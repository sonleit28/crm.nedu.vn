import { http } from 'msw'
import type { Lead, LeadStage, PipelineAction, PipelineActionType } from '@shared/types/domain'
import type { Paginated } from '@shared/types/api'
import { env } from '@shared/config/env'
import { MOCK_LEADS } from '@/mocks/data/leads'
import { MOCK_PIPELINE_ACTIONS } from '@/mocks/data/pipeline-actions'
import { findMockUserById } from '@/mocks/data/users'
import {
  okRaw,
  ok,
  created,
  notFound,
  badRequest,
  unauthorized,
  resolveMockUidFromRequest,
} from '@/mocks/config'

const API = `${env.API_URL}/api`

// In-memory mutable state — Phase 1 mock (CLAUDE.md mục 10 Sprint 2: "Mutate array trực tiếp").
const leads: Lead[] = [...MOCK_LEADS]
const actions: PipelineAction[] = [...MOCK_PIPELINE_ACTIONS]

const VALID_STAGES: LeadStage[] = ['awareness', 'interest', 'consideration', 'intent', 'enrolled', 'retention']
const VALID_ACTION_TYPES: PipelineActionType[] = ['move', 'note', 'call', 'enroll', 'sms', 'email']

function nextId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function applyRoleFilter(list: Lead[], request: Request): Lead[] {
  const uid = resolveMockUidFromRequest(request)
  const user = findMockUserById(uid)
  if (!user) return list
  // Sale (consultant): chỉ thấy lead của mình. Founder/Admin thấy hết.
  if (user.roles?.includes('consultant')) {
    return list.filter((l) => l.assigned_to === user.id)
  }
  return list
}

export const leadsHandlers = [
  // GET /leads?stage=&assigned_to=&q=&limit=&page=
  http.get(`${API}/leads`, ({ request }) => {
    const url = new URL(request.url)
    const stage = url.searchParams.get('stage') as LeadStage | null
    const assignedTo = url.searchParams.get('assigned_to')
    const q = url.searchParams.get('q')?.toLowerCase().trim() ?? ''
    const limit = Number(url.searchParams.get('limit') ?? 100)
    const page = Number(url.searchParams.get('page') ?? 1)

    let filtered = applyRoleFilter(leads, request)
    if (stage) filtered = filtered.filter((l) => l.current_stage === stage)
    if (assignedTo) filtered = filtered.filter((l) => l.assigned_to === assignedTo)
    if (q) {
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.email ?? '').toLowerCase().includes(q) ||
          (l.phone ?? '').includes(q),
      )
    }

    // Sort: most recent activity first (last_action_at fallback created_at).
    filtered.sort((a, b) => {
      const aT = a.last_action_at ?? a.created_at
      const bT = b.last_action_at ?? b.created_at
      return bT.localeCompare(aT)
    })

    const total = filtered.length
    const start = (page - 1) * limit
    const data = filtered.slice(start, start + limit)
    const body: Paginated<Lead> = { data, meta: { page, limit, total } }
    return okRaw(body)
  }),

  // GET /leads/:id
  http.get(`${API}/leads/:id`, ({ request, params }) => {
    const id = params.id as string
    const visible = applyRoleFilter(leads, request)
    const found = visible.find((l) => l.id === id)
    if (!found) return notFound('Lead không tồn tại hoặc bạn không có quyền xem.')
    return ok(found)
  }),

  // GET /leads/:id/actions
  http.get(`${API}/leads/:id/actions`, ({ request, params }) => {
    const id = params.id as string
    const visible = applyRoleFilter(leads, request)
    if (!visible.some((l) => l.id === id)) {
      return notFound('Lead không tồn tại hoặc bạn không có quyền xem.')
    }
    const list = actions
      .filter((a) => a.lead_id === id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    return ok(list)
  }),

  // POST /leads/:id/move — body { to_stage, note? }
  http.post(`${API}/leads/:id/move`, async ({ request, params }) => {
    const uid = resolveMockUidFromRequest(request)
    const performer = findMockUserById(uid)
    if (!performer) return unauthorized()

    const id = params.id as string
    const lead = leads.find((l) => l.id === id)
    if (!lead) return notFound('Lead không tồn tại.')

    // Sale: chỉ move lead của mình
    if (performer.roles?.includes('consultant') && lead.assigned_to !== performer.id) {
      return notFound('Bạn không có quyền thao tác lead này.')
    }

    const body = (await request.json().catch(() => ({}))) as {
      to_stage?: LeadStage
      note?: string
    }
    if (!body.to_stage || !VALID_STAGES.includes(body.to_stage)) {
      return badRequest('to_stage không hợp lệ.')
    }

    const fromStage = lead.current_stage
    const toStage = body.to_stage
    const now = new Date().toISOString()

    lead.current_stage = toStage
    lead.last_action_at = now
    if (toStage === 'enrolled' && !lead.enrolled_at) {
      lead.enrolled_at = now
    }

    const action: PipelineAction = {
      id: nextId('pa'),
      lead_id: id,
      from_stage: fromStage,
      to_stage: toStage,
      action_type: toStage === 'enrolled' ? 'enroll' : 'move',
      note: body.note,
      performed_by: performer.id,
      performed_by_name: performer.full_name,
      created_at: now,
    }
    actions.unshift(action)
    return created(action)
  }),

  // POST /leads/:id/actions — body { action_type, note?, metadata? }
  http.post(`${API}/leads/:id/actions`, async ({ request, params }) => {
    const uid = resolveMockUidFromRequest(request)
    const performer = findMockUserById(uid)
    if (!performer) return unauthorized()

    const id = params.id as string
    const lead = leads.find((l) => l.id === id)
    if (!lead) return notFound('Lead không tồn tại.')

    if (performer.roles?.includes('consultant') && lead.assigned_to !== performer.id) {
      return notFound('Bạn không có quyền thao tác lead này.')
    }

    const body = (await request.json().catch(() => ({}))) as {
      action_type?: PipelineActionType
      note?: string
      metadata?: Record<string, unknown>
    }
    if (!body.action_type || !VALID_ACTION_TYPES.includes(body.action_type)) {
      return badRequest('action_type không hợp lệ.')
    }

    const now = new Date().toISOString()
    const action: PipelineAction = {
      id: nextId('pa'),
      lead_id: id,
      from_stage: null,
      to_stage: null,
      action_type: body.action_type,
      note: body.note,
      performed_by: performer.id,
      performed_by_name: performer.full_name,
      metadata: body.metadata,
      created_at: now,
    }
    actions.unshift(action)
    lead.last_action_at = now
    return created(action)
  }),

  // PATCH /leads/:id/callback — body { callback_at | null }
  http.patch(`${API}/leads/:id/callback`, async ({ request, params }) => {
    const uid = resolveMockUidFromRequest(request)
    const performer = findMockUserById(uid)
    if (!performer) return unauthorized()

    const id = params.id as string
    const lead = leads.find((l) => l.id === id)
    if (!lead) return notFound('Lead không tồn tại.')

    if (performer.roles?.includes('consultant') && lead.assigned_to !== performer.id) {
      return notFound('Bạn không có quyền thao tác lead này.')
    }

    const body = (await request.json().catch(() => ({}))) as { callback_at?: string | null }
    lead.callback_at = body.callback_at ?? undefined
    lead.last_action_at = new Date().toISOString()
    return ok(lead)
  }),
]
