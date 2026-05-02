# CLAUDE.md — nedu-crm

> Portal: **crm.nedu.vn** · Repo: **nedu-crm** · Phase 1 · Sprint 14 ngày
> Owner: NhiLe Holdings · N-Education BU · IT Team
> Source docs: `Nedu_CRM_BigPicture_IT_Brief.html`, `crm-nedu_UserStory.docx`,
> `crm-nedu.html` (prototype — **source of truth về UI**), `architecture.md`
> (NLH frontend portal template — **không được lệch core**)

---

## 0. Cách dùng file này (cho dev / Claude Code)

1. File này là **single source of truth** để build CRM portal frontend.
2. Đọc lần lượt: section 1 (mục đích) → 2 (stack) → 3 (folders) → 6 (API contracts) → 7 (pages chi tiết) → 10 (build order).
3. Khi nghi ngờ về UI → mở `crm-nedu.html` (prototype). Khi nghi ngờ về business rule → mở `Nedu_CRM_BigPicture_IT_Brief.html`. Khi nghi ngờ về convention → mở `architecture.md`.
4. **Không** thêm feature ngoài spec. **Không** đổi tech stack.
5. Câu lệnh khởi động cho Claude Code có ở section 12.

---

## 1. Mục đích

CRM portal cho N-Education — quản lý lifecycle học viên từ lead → enrolled → thanh toán → analytics. 6 modules: Dashboard / Pipeline Kanban (5 stage) / Contacts / Finance / Overdue / Analytics. Người dùng chính là **Founder + Admin** (full access) và **Sale viên** (giới hạn theo phân quyền).

Portal là **frontend-only**: mọi data đi qua `api.nedu.vn` (Express/NestJS, IT đang build song song). Không tự host DB, không có backend riêng. Nguồn dữ liệu cuối là Supabase `ops` schema do `nedu-backend` own — CRM portal chỉ READ + gửi mutation (chủ yếu là INSERT vào `pipeline_actions`).

---

## 2. Tech Stack (cố định — không lệch)

Theo `architecture.md` (NLH frontend portal template):

| Layer        | Choice                          | Notes                                                       |
| ------------ | ------------------------------- | ----------------------------------------------------------- |
| Framework    | **React 19** + **Vite**         | Không Next.js, không CRA.                                   |
| Language     | **TypeScript strict**           | Không `any`, không `@ts-ignore`.                            |
| Routing      | **React Router v7**             | `BrowserRouter`. Không hash router.                         |
| Server state | **TanStack Query v5**           | Mọi data từ BE đi qua `useQuery` / `useMutation`.           |
| Client state | **Zustand v5**                  | Chỉ cho UI state + auth. Không thay React Query.            |
| Styling      | **Tailwind v4** (`@tailwindcss/vite`) | Không CSS-in-JS. CSS variables theo prototype dùng qua `@theme`. |
| Mock API     | **MSW v2** (`msw/browser`)      | Service Worker intercept `fetch` ở dev.                     |
| Auth         | **Central Auth** `auth-central` (NLH-CORE) | Google OAuth → JWT → `localStorage`.                        |
| Realtime     | **SSE** (`EventSource`)         | Channel `/api/sse/overdue` cho toast quá hạn.               |
| Charts       | **Tự render bằng SVG/CSS**      | Không thêm chart lib ở Phase 1 — bar chart đơn giản dùng div%. |
| Deploy       | **Cloudflare Workers** (assets-only SPA) | `@cloudflare/vite-plugin` + `wrangler.jsonc`. 2 worker tách bằng `--name` flag: `nedu-crm-dev` (script `deploy:dev`) và `nedu-crm-prod` (script `deploy:prod`). |

### Font (exception so với Master Prompt PROMPT-BUILD-001)

Prototype `crm-nedu.html` dùng **Inter only** — UI dashboard data-dense, không phù hợp Playfair Display headline. Quyết định: giữ Inter only, document tại đây như exception có chủ đích.

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Cấm tự ý thêm

Redux, Recoil, Jotai, SWR, Axios, styled-components, Emotion, MUI, Ant Design, Chart.js, Recharts (Phase 1), Supabase client (FE không gọi DB trực tiếp).

---

## 3. File Structure

```
nedu-crm/
├── public/
│   └── mockServiceWorker.js              # npx msw init public/
├── src/
│   ├── main.tsx                          # await enableMocking() → render <AppRouter />
│   ├── App.tsx                           # AppLayout: sidebar + topbar + <Outlet />
│   ├── index.css                         # Tailwind entry + CSS vars (@theme)
│   │
│   ├── routes/
│   │   ├── index.tsx                     # <AppRouter /> — providers + routes
│   │   ├── ProtectedRoute.tsx            # Gate by useAuthStore
│   │   └── RoleGate.tsx                  # Gate by role (admin-only routes → Sale redirect)
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── AuthCallbackPage.tsx
│   │   │   └── stores/
│   │   │       └── useAuthStore.ts
│   │   │
│   │   ├── dashboard/                    # CRM-001..003
│   │   │   ├── pages/DashboardPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── KpiCard.tsx
│   │   │   │   ├── RevenueByCourseChart.tsx
│   │   │   │   ├── CloseRateModal.tsx
│   │   │   │   ├── EnrollmentModal.tsx
│   │   │   │   └── OverdueAlertBanner.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDashboardSummary.ts
│   │   │   │   ├── useCloseRateByCourse.ts
│   │   │   │   └── useEnrollmentByCourse.ts
│   │   │   └── types/index.ts
│   │   │
│   │   ├── pipeline/                     # CRM-006..008
│   │   │   ├── pages/PipelinePage.tsx
│   │   │   ├── components/
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   ├── KanbanColumn.tsx
│   │   │   │   ├── LeadCard.tsx
│   │   │   │   ├── LeadDetailPanel.tsx
│   │   │   │   ├── LeadScoreBadge.tsx
│   │   │   │   ├── StageMoveDialog.tsx
│   │   │   │   └── CallbackBadge.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useLeads.ts
│   │   │   │   ├── useLead.ts
│   │   │   │   ├── usePipelineActions.ts
│   │   │   │   └── useMoveLeadStage.ts
│   │   │   └── types/index.ts
│   │   │
│   │   ├── contacts/                     # CRM-009..012
│   │   │   ├── pages/ContactsPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── ContactsTable.tsx
│   │   │   │   ├── ContactsFilterBar.tsx
│   │   │   │   ├── ContactDetailModal.tsx
│   │   │   │   ├── TierBadge.tsx
│   │   │   │   └── AddContactModal.tsx        # Phase 2
│   │   │   ├── hooks/
│   │   │   │   ├── useContacts.ts
│   │   │   │   ├── useContact.ts
│   │   │   │   └── useCreateContact.ts        # Phase 2
│   │   │   └── types/index.ts
│   │   │
│   │   ├── finance/                      # CRM-013..014
│   │   │   ├── pages/FinancePage.tsx
│   │   │   ├── components/
│   │   │   │   ├── FinanceKpiGrid.tsx
│   │   │   │   ├── PaymentsTable.tsx
│   │   │   │   ├── PaymentsFilterBar.tsx
│   │   │   │   ├── PaymentsSummaryBar.tsx
│   │   │   │   └── PaymentStatusBadge.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFinanceSummary.ts
│   │   │   │   └── usePayments.ts
│   │   │   └── types/index.ts
│   │   │
│   │   ├── overdue/                      # CRM-015..017
│   │   │   ├── pages/OverduePage.tsx
│   │   │   ├── components/
│   │   │   │   ├── OverdueCard.tsx
│   │   │   │   ├── InstallmentProgressBar.tsx
│   │   │   │   ├── ContactDialer.tsx
│   │   │   │   ├── NoteEditor.tsx
│   │   │   │   ├── PauseStudyDialog.tsx
│   │   │   │   └── OverdueAlertBanner.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useOverdueList.ts
│   │   │   │   ├── useLogContact.ts
│   │   │   │   ├── useAddNote.ts
│   │   │   │   └── usePauseStudy.ts
│   │   │   └── types/index.ts
│   │   │
│   │   └── analytics/                    # CRM-018..021
│   │       ├── pages/AnalyticsPage.tsx
│   │       ├── components/
│   │       │   ├── AnalyticsTabs.tsx
│   │       │   ├── ConversionFunnelTable.tsx
│   │       │   ├── LeadSourceTable.tsx
│   │       │   ├── ConsultantKpiTable.tsx
│   │       │   └── DateRangePicker.tsx     # Phase 2
│   │       ├── hooks/
│   │       │   ├── useFunnel.ts
│   │       │   ├── useLeadSourceStats.ts
│   │       │   └── useConsultantKpi.ts
│   │       └── types/index.ts
│   │
│   ├── shared/
│   │   ├── config/
│   │   │   ├── env.ts                    # wrap import.meta.env
│   │   │   ├── api-client.ts             # fetch wrapper + 401 refresh + retry 1
│   │   │   ├── auth-central-client.ts    # redirectToGoogleLogin / refresh / logout
│   │   │   ├── token-storage.ts          # nlh_access_token / nlh_refresh_token
│   │   │   ├── query-client.ts           # TanStack QueryClient singleton
│   │   │   └── sse-client.ts             # createOverdueSSEClient(onMessage)
│   │   ├── stores/
│   │   │   ├── useToastStore.ts          # global toast stack (overdue + generic)
│   │   │   └── useOverdueBadgeStore.ts   # số đỏ sidebar realtime
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx         # sidebar + topbar + content + toast slot
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── SidebarNavItem.tsx
│   │   │   │   ├── Topbar.tsx
│   │   │   │   └── TopbarSearch.tsx      # Phase 2 — placeholder Phase 1
│   │   │   ├── ui/
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Modal.tsx             # backdrop click → close (event.target===this)
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── ToastStack.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   └── DeltaBadge.tsx        # ↑/↓ % so tháng trước
│   │   │   └── feedback/
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── ApiErrorView.tsx
│   │   ├── hooks/
│   │   │   ├── useOverdueSSE.ts          # subscribe SSE + push toast + sync badge
│   │   │   └── useRoleGuard.ts           # admin-only redirect
│   │   ├── types/
│   │   │   ├── auth.ts                   # AuthUser, Role, TokenPair
│   │   │   ├── domain.ts                 # Lead, Contact, Payment, PipelineAction…
│   │   │   └── api.ts                    # ApiError, Paginated<T>
│   │   └── utils/
│   │       ├── formatVND.ts
│   │       ├── formatDateVN.ts
│   │       ├── tier.ts                   # getTier(lifetimeValue, courseCount)
│   │       ├── leadScore.ts              # getLeadScoreBucket(score)
│   │       └── buildQuery.ts
│   │
│   └── mocks/
│       ├── init.ts                       # enableMocking() + cleanup khi tắt
│       ├── browser.ts                    # setupWorker(...handlers)
│       ├── config.ts                     # unauthorized() / forbidden() / notFound() / badRequest()
│       ├── handlers/
│       │   ├── auth.ts                   # /auth/me, refresh, logout
│       │   ├── dashboard.ts              # /dashboard/summary, /dashboard/close-rate, /dashboard/enrollment
│       │   ├── leads.ts                  # /leads, /leads/:id, POST /leads/:id/move
│       │   ├── contacts.ts               # /contacts, /contacts/:id
│       │   ├── payments.ts               # /payments, /payments/overdue
│       │   ├── overdue-actions.ts        # POST /payments/:id/contact|note|pause
│       │   ├── analytics.ts              # /analytics/funnel|source|consultant-kpi
│       │   └── sse-overdue.ts            # GET /sse/overdue (mock event stream)
│       └── data/
│           ├── users.ts                  # mock consultants + admin
│           ├── leads.ts                  # ~30 leads phân bổ 5 stages
│           ├── pipeline-actions.ts       # audit log
│           ├── contacts.ts               # 7 contacts (theo prototype)
│           ├── payments.ts               # 7 transactions (theo prototype)
│           └── courses.ts                # 5 khóa: Design Thinking B5, Lã Chính Mình B3, …
│
├── .env.example
├── vercel.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── package.json
```

**Nguyên tắc:** feature-first (folder chia theo domain), shared/ chỉ chứa code domain-agnostic. Theo `architecture.md` mục 2.

---

## 4. Database Schema (REFERENCE — KHÔNG own)

CRM portal **KHÔNG own** database. Schema do `nedu-backend` own ở Supabase `ops` schema. Section này chép lại từ BigPicture để dev hiểu shape data, **không phải để CRM portal tạo migration**.

### `leads`

```sql
CREATE TABLE ops.leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  email           text,
  phone           text,
  source          text NOT NULL,           -- enum app-level: facebook_ads | google | referral | webinar | organic | tiktok
  interested_course text,                  -- ID hoặc tên khóa
  test_result_json jsonb,                  -- từ nedu.vn/test
  lead_score      int CHECK (lead_score BETWEEN 0 AND 100),
  current_stage   text NOT NULL,           -- enum: lead_new | contacted | consulting | followup | closed
  callback_at     timestamptz,             -- lịch hẹn gọi lại (nullable)
  assigned_to     uuid REFERENCES ops.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()  -- IMMUTABLE
);
```

### `pipeline_actions` — INSERT-only, audit trail bất biến

```sql
CREATE TABLE ops.pipeline_actions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         uuid NOT NULL REFERENCES ops.leads(id),
  from_stage      text,                    -- nullable cho action đầu (lead intake)
  to_stage        text,
  action_type     text NOT NULL,           -- enum: move | note | call | enroll | sms | email
  note            text,
  performed_by    uuid REFERENCES ops.users(id),
  metadata        jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);
-- RULE: Không có UPDATE, không có DELETE. RLS policy enforce.
```

### `contacts`

```sql
CREATE TABLE ops.contacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         uuid REFERENCES ops.leads(id),    -- nullable
  name            text NOT NULL,
  email           text,
  phone           text,
  tier            text NOT NULL DEFAULT 'newbie',   -- enum: diamond | gold | silver | newbie
  lifetime_value  bigint NOT NULL DEFAULT 0,        -- VND
  internal_note   text,
  sale_owner      uuid REFERENCES ops.users(id),
  current_course_id uuid REFERENCES ops.courses(id),
  enrolled_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

### `payments`

```sql
CREATE TABLE ops.payments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id        uuid NOT NULL REFERENCES ops.contacts(id),
  course_id         uuid NOT NULL REFERENCES ops.courses(id),
  amount            bigint NOT NULL,          -- VND. Âm = hoàn tiền
  installment_index int NOT NULL DEFAULT 1,   -- kỳ 1/2/3
  installment_total int NOT NULL DEFAULT 1,
  due_date          date,
  paid_at           timestamptz,
  status            text NOT NULL,            -- enum: completed | pending | overdue | refunded
  gateway           text,                     -- vnpay | stripe | momo | manual
  method            text,                     -- transfer | card | ewallet
  created_at        timestamptz NOT NULL DEFAULT now()
);
```

### Bảng phụ (CRM read-only)

- `ops.users` — internal staff (consultant, admin, founder). Auth qua Google Workspace.
- `ops.courses` — danh sách khóa học (id, name, batch, price, status, started_at).

### RLS — tóm tắt (enforce ở `nedu-backend`)

| Table             | Founder/Admin                            | Sale (consultant)                            |
| ----------------- | ---------------------------------------- | -------------------------------------------- |
| leads             | SELECT all                               | SELECT WHERE assigned_to = auth.uid()        |
| pipeline_actions  | SELECT all + INSERT                      | INSERT (lead của mình) + SELECT (lead của mình) |
| contacts          | SELECT all (kể cả LTV, internal_note)    | SELECT (sale_owner = auth.uid()) — **không LTV, không note nội bộ team khác** |
| payments          | SELECT all                               | SELECT WHERE contact thuộc mình              |
| analytics aggregates | SELECT all                            | DENIED                                       |

**Chú ý cho FE:** UI vẫn ẩn các trường nhạy cảm theo role (defense-in-depth), nhưng RLS ở DB layer là last-line — sai DB là sai thật.

---

## 5. TypeScript Types

### `shared/types/auth.ts`

```ts
export type Role = 'founder' | 'admin' | 'consultant'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: Role
  // Legacy mapping: 'founder' và 'admin' UI gọi chung là Admin/Founder; 'consultant' UI gọi là Sale.
}

export interface TokenPair {
  access_token: string
  refresh_token: string
}
```

### `shared/types/domain.ts`

```ts
// ─── Enums (string literal unions) ─────────────────────────────
export type LeadStage =
  | 'lead_new'      // Lead mới
  | 'contacted'     // Tiếp cận
  | 'consulting'    // Tư vấn
  | 'followup'      // Follow-up
  | 'closed'        // Chốt đơn

export type LeadSource =
  | 'facebook_ads' | 'google' | 'referral' | 'webinar' | 'organic' | 'tiktok'

export type LeadScoreBucket = 'hot' | 'warm' | 'cold'

export type ContactTier = 'diamond' | 'gold' | 'silver' | 'newbie'

export type PaymentStatus = 'completed' | 'pending' | 'overdue' | 'refunded'

export type PaymentGateway = 'vnpay' | 'stripe' | 'momo' | 'manual'

export type PipelineActionType = 'move' | 'note' | 'call' | 'enroll' | 'sms' | 'email'

// ─── Entities ──────────────────────────────────────────────────
export interface Course {
  id: string
  name: string                  // ví dụ "Design Thinking B5"
  batch: string                 // "B5"
  price_vnd: number
  status: 'running' | 'upcoming' | 'finished'
  started_at?: string
}

export interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  source: LeadSource
  interested_course?: string
  lead_score: number            // 0..100
  current_stage: LeadStage
  callback_at?: string          // ISO
  assigned_to?: string          // user id
  assigned_to_name?: string     // hydrate ở api
  created_at: string            // ISO
  // Tags hiển thị (server-derived):
  enrolled_at?: string          // chỉ khi current_stage='closed'
  last_action_at?: string       // để hiện "2h trước"
}

export interface PipelineAction {
  id: string
  lead_id: string
  from_stage: LeadStage | null
  to_stage: LeadStage | null
  action_type: PipelineActionType
  note?: string
  performed_by: string
  performed_by_name?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface ContactSummary {
  id: string
  name: string
  email?: string
  phone?: string
  source: LeadSource
  current_course?: string       // tên khóa đang học
  payment_status_label: string  // "Đủ" / "Chờ kỳ 1" / "Nợ kỳ 2" — derived
  payment_status_class: PaymentStatus | 'paid'
  tier: ContactTier
  // Sale role: lifetime_value KHÔNG được trả về
}

export interface ContactDetail extends ContactSummary {
  lead_date: string
  sale_owner_name: string
  lifetime_value: number        // chỉ admin/founder
  current_course_fee?: number
  course_history: Array<{       // chỉ admin/founder
    name: string
    period: string              // "06/2024"
    amount: number
  }>
  internal_note?: string        // chỉ admin/founder hoặc sale_owner = self
  internal_note_author?: string
}

export interface Payment {
  id: string
  contact_id: string
  contact_name: string          // hydrate
  course_id: string
  course_name: string           // hydrate
  amount: number                // VND, âm = hoàn tiền
  installment_index: number
  installment_total: number
  due_date?: string
  paid_at?: string
  status: PaymentStatus
  gateway?: PaymentGateway
  method?: 'transfer' | 'card' | 'ewallet'
  created_at: string
}

export interface OverdueCase {
  payment_id: string
  contact_id: string
  contact_name: string
  course_name: string
  installment_type: string             // "Trả góp 3 kỳ" | "1 lần"
  installment_index: number
  installment_total: number
  sale_owner_name: string
  sale_owner_phone?: string
  total_fee: number                    // tổng học phí của khóa
  paid_amount: number                  // đã thu
  remaining_amount: number             // còn nợ
  overdue_amount: number               // đang quá hạn
  overdue_days: number
  severity: 'critical' | 'warn'        // critical >=5 ngày
  installments: Array<{
    index: number
    due_date: string
    amount: number
    status: 'paid' | 'overdue' | 'pending'  // 🟢 / 🔴 / ⬜
    paid_at?: string
  }>
}

// ─── Dashboard / Analytics aggregates ──────────────────────────
export interface DashboardSummary {
  month: string                 // "2026-04"
  total_leads: number
  total_leads_delta_pct: number      // % vs tháng trước
  close_rate_pct: number             // 0..100
  close_rate_delta_pct: number
  enrolled_count: number
  enrolled_delta_pct: number
  revenue_vnd: number
  revenue_delta_pct: number
  consulting_total: number           // Tư vấn + Follow-up
  consulting_breakdown: { consulting: number; followup: number }
  revenue_by_course: Array<{
    course_id: string
    course_name: string
    revenue_vnd: number
    student_count: number
  }>
  has_critical_overdue: boolean
  top_overdue?: { name: string; days: number; status: 'escalated' | 'pending' }
}

export interface CloseRateByCourse {
  course_name: string
  leads: number
  closed: number
  rate_pct: number
}

export interface EnrollmentByCourse {
  course_name: string
  enrolled: number
  revenue_vnd: number
  status: 'running' | 'upcoming' | 'finished'
}

export interface FunnelRow {
  stage: LeadStage
  label: string
  count: number
  conversion_pct: number             // % qua bước (so với stage trước)
}

export interface LeadSourceStat {
  source: LeadSource
  source_label: string
  leads: number
  closed: number
  rate_pct: number
  revenue_vnd: number
}

export interface ConsultantKpi {
  consultant_id: string
  consultant_name: string
  leads: number
  closed: number
  rate_pct: number
  avg_response_hours: number
}

export interface FinanceSummary {
  month: string
  total_revenue_vnd: number
  collected_vnd: number
  collected_pct: number
  receivable_vnd: number
  receivable_count: number
  overdue_vnd: number
  overdue_count: number
  delta_pct_total_revenue: number
}
```

### `shared/types/api.ts`

```ts
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) { super(message) }
}

export interface Paginated<T> {
  data: T[]
  meta: { page: number; limit: number; total: number }
}
```

---

## 6. API Contracts

Base URL: `${VITE_API_URL}/api`. Auth: `Authorization: Bearer <access_token>`.

Response envelope (NestJS `TransformInterceptor`):
- Single / aggregate: `{ data: T }` — `api.get<T>()` unwrap về `T`
- List paginated: `{ data: T[], meta: { page, limit, total } }` — dùng `api.getRaw<Paginated<T>>()`
- Error: `{ statusCode, message, error }` — wrapper throw `ApiError`

### Auth (do auth-central + nedu-backend xử)

| Method | Path                              | Description                                         |
| ------ | --------------------------------- | --------------------------------------------------- |
| GET    | `/auth/me`                        | Trả `AuthUser` của token hiện tại.                  |
| POST   | `/auth/refresh`                   | Body `{ refresh_token }` → `{ access_token, refresh_token }`. |
| POST   | `/auth/logout`                    | Revoke ở auth-central + clear local.                |

Login flow chính (Google OAuth) qua `auth-central` — xem `auth-central-client.ts`.

### Dashboard (CRM-001..003)

| Method | Path                                              | Returns                |
| ------ | ------------------------------------------------- | ---------------------- |
| GET    | `/dashboard/summary?month=YYYY-MM`                | `DashboardSummary`     |
| GET    | `/dashboard/close-rate?month=YYYY-MM`             | `CloseRateByCourse[]`  |
| GET    | `/dashboard/enrollment?month=YYYY-MM`             | `EnrollmentByCourse[]` |

### Pipeline (CRM-006..008)

| Method | Path                                              | Returns / Body                                      |
| ------ | ------------------------------------------------- | --------------------------------------------------- |
| GET    | `/leads?stage=&assigned_to=&q=&limit=&page=`      | `Paginated<Lead>` (group bởi `current_stage` ở UI). |
| GET    | `/leads/:id`                                      | `Lead`                                              |
| GET    | `/leads/:id/actions`                              | `PipelineAction[]` (sort desc theo `created_at`).   |
| POST   | `/leads/:id/move`                                 | Body `{ to_stage, note? }` → `PipelineAction`. **INSERT** vào `pipeline_actions`. |
| POST   | `/leads/:id/actions`                              | Body `{ action_type, note?, metadata? }` → `PipelineAction`. |
| PATCH  | `/leads/:id/callback`                             | Body `{ callback_at \| null }` → `Lead` (chỉ đổi `callback_at`). |

### Contacts (CRM-009..012)

| Method | Path                                                          | Returns                              |
| ------ | ------------------------------------------------------------- | ------------------------------------ |
| GET    | `/contacts?q=&source=&course=&tier=&limit=&page=`             | `Paginated<ContactSummary>`          |
| GET    | `/contacts/:id`                                               | `ContactDetail` (server enforce role-based fields). |
| POST   | `/contacts` *(Phase 2)*                                       | Body create — xem section 7 Contacts. |

### Finance (CRM-013..014)

| Method | Path                                                                                | Returns                |
| ------ | ----------------------------------------------------------------------------------- | ---------------------- |
| GET    | `/finance/summary?month=YYYY-MM`                                                    | `FinanceSummary`       |
| GET    | `/payments?from=&to=&course=&status=&q=&limit=&page=`                               | `Paginated<Payment>`   |

### Overdue (CRM-015..017)

| Method | Path                                              | Returns / Body                                         |
| ------ | ------------------------------------------------- | ------------------------------------------------------ |
| GET    | `/payments/overdue?assigned_to=`                  | `OverdueCase[]` (sort desc theo `overdue_days`).       |
| POST   | `/payments/:id/contact`                           | Body `{ note? }` → `PipelineAction` (action_type=`call`). |
| POST   | `/payments/:id/note`                              | Body `{ note }` → `PipelineAction` (action_type=`note`). |
| POST   | `/payments/:id/pause`                             | Body `{ reason }` → `{ ok: true }`. Backend đặt cờ tạm dừng học. |

### SSE Realtime — Toast quá hạn

```
GET /api/sse/overdue
Accept: text/event-stream
Authorization: Bearer <token>
```

Server emit `data: <JSON>` với shape:

```ts
interface OverdueSSEEvent {
  type: 'overdue.new'
  severity: 'critical' | 'warn'
  payment_id: string
  contact_name: string
  course_name: string
  amount_vnd: number
  overdue_days: number
  sale_owner_name: string
  emitted_at: string
}
```

FE side: `useOverdueSSE` subscribe → push toast vào `useToastStore` + sync `useOverdueBadgeStore` (badge sidebar). Acceptable delay: ≤30s từ khi worker phát hiện.

### Analytics (CRM-018..021)

| Method | Path                                                          | Returns                |
| ------ | ------------------------------------------------------------- | ---------------------- |
| GET    | `/analytics/funnel?from=&to=`                                 | `FunnelRow[]`          |
| GET    | `/analytics/source?from=&to=`                                 | `LeadSourceStat[]`     |
| GET    | `/analytics/consultant-kpi?from=&to=`                         | `ConsultantKpi[]`      |

Default `from`/`to` = đầu tháng / cuối tháng hiện tại nếu không truyền. Phase 1: tab default range tháng hiện tại; Phase 2: bổ sung DateRangePicker.

---

## 7. Pages / Components chi tiết

### 7.0. AppLayout (shared/components/layout/AppLayout.tsx)

Layout 3 vùng theo prototype:

- **Sidebar fixed left** (`width: 240px`, `bg: var(--bg2) #0F2447`):
  - Logo block: chữ "N" trên ô vuông `#0EA5E9`, label "N-Education / CRM SYSTEM".
  - 3 nav-section với label uppercase tracking-wide:
    - **Tổng quan** → Dashboard (📊), Pipeline (🔀), Contacts (👥)
    - **Tài chính** → Tổng quan (💰), Quá hạn (🔴) **+ badge số đỏ realtime**
    - **Phân tích** → Analytics (📈)
  - User block ở đáy (avatar tròn 32px chữ in hoa + name + role).
- **Topbar sticky top** (height 56px, `var(--bg2)`):
  - Left: page title (16px bold) + breadcrumb (12px muted).
  - Right: search input (240px, placeholder "Tìm contact, học viên, lead...") — Phase 1 disabled/placeholder, Phase 2 active. Settings button ⚙️.
- **Content area** (`padding: 24px`, scroll-y).
- **Toast stack** mounted global ở `<body>` portal — render từ `useToastStore`.

**Sale role:** Sidebar ẩn 2 mục **Tổng quan tài chính** + **Analytics**. Mục **Quá hạn** vẫn hiển thị (chỉ thấy của mình).

**Behaviors:**
- Click nav item → React Router navigate, item active highlight `bg: rgba(14,165,233,0.12); color: var(--accent)`.
- Sidebar badge "Quá hạn" subscribe `useOverdueBadgeStore`, hiển thị nếu `count > 0`, ẩn nếu `=0`.

---

### 7.1. LoginPage (CRM-022)

Route: `/login`. Public.

**Layout:** Center card 400px, dark bg, logo N-Education + tagline "CRM Hệ thống quản lý lifecycle".

**Elements:**
- Heading "Đăng nhập"
- Sub: "Sử dụng tài khoản Google Workspace của Nedu để vào hệ thống."
- Button **"Đăng nhập với Google"** (full width, `bg: white`, icon Google + text). Click → `redirectToGoogleLogin()` → `/auth/oauth/google?return_to=/auth-callback`.
- Footer link nhỏ: "Cần truy cập? Liên hệ admin@nedu.vn".

**State:**
- `isLoading=true` (ví dụ user đã có session, đang fetch `/auth/me`) → spinner full screen.
- `error` → banner đỏ "Đăng nhập thất bại. Vui lòng thử lại."

**Note về UserStory CRM-022 vs implementation:** UserStory mô tả email/password + "Ghi nhớ 30 ngày". BigPicture + Architecture template thống nhất Google OAuth qua `auth-central`. Implementation theo BigPicture (rationale: nhân viên nghỉ → remove khỏi Google Workspace → mất access ngay; không quản password). "Ghi nhớ 30 ngày" thay bằng refresh-token TTL 30 ngày ở `auth-central`.

---

### 7.2. AuthCallbackPage

Route: `/auth-callback`. Public.

Parse fragment `#access_token=...&refresh_token=...&expires_in=...` từ URL → gọi `useAuthStore.acceptTokens(...)` → fetch `/auth/me` → navigate `/dashboard`. Hiển thị spinner trong khi xử.

Lỗi: redirect `/login` với query `?error=callback_failed`.

---

### 7.3. DashboardPage (CRM-001..003)

Route: `/dashboard`. Roles: Founder, Admin, Consultant (Sale thấy cùng KPI nhưng KPI doanh thu ẩn — xem chi tiết bên dưới).

**Section heading:**
- Title: "Dashboard"
- Sub: "Tổng quan hệ thống · Cập nhật theo tháng [04/2026]"

**Banner KHẨN CẤP** (top): hiển thị nếu `summary.has_critical_overdue === true`. Background `rgba(239,68,68,0.1)`, border-left `3px solid var(--red)`, text "🔴 KHẨN CẤP — [name] quá hạn [N] ngày · đã escalate Admin". Click banner → navigate `/overdue`. Khi `=false` → ẩn hoàn toàn (không placeholder).

**KPI Grid** — 5 cột, gap 16px:

| # | KPI                        | Value source                              | Clickable | Modal                    | Visible cho Sale |
| - | -------------------------- | ----------------------------------------- | --------- | ------------------------ | ---------------- |
| 1 | 👥 Tổng Lead (tháng)       | `total_leads`                             | Không     | —                        | ✓                |
| 2 | 🎯 Tỷ lệ chốt (tháng)      | `close_rate_pct`                          | **Có**    | CloseRateModal (→ 7.3.1) | ✓                |
| 3 | ✅ Đăng ký thành công       | `enrolled_count`                          | **Có**    | EnrollmentModal (→ 7.3.2)| ✓                |
| 4 | 💰 Doanh thu (tháng)        | `revenue_vnd` (format "186.5M ₫")         | Không     | —                        | **✗ ẩn**         |
| 5 | 💬 Đang được tư vấn         | `consulting_total` + breakdown footer     | Không     | —                        | ✓                |

Mỗi KPI card: label (11px uppercase muted) + value (30px bold) + footer (delta `↑/↓ %` + "vs tháng trước"). Card clickable có cursor pointer + arrow `›` góc phải, hover translate-x.

**Revenue by Course Chart** (chỉ Founder/Admin):
- Card header: "Doanh thu theo khóa (tháng)" + sub "Tổng [X]M ₫ · [N] khóa đang vận hành" + badge tháng "Tháng 04/2026".
- Bar chart 5 cột render bằng `<div>` + `height: %`:
  - Cột cao nhất = 90%, các cột khác scale theo `revenue_vnd / max * 90`.
  - Color rotate: `accent`, `teal`, `mint`, `coral`, `muted` (cột "Khác" cuối cùng).
  - Mỗi cột: value (top, font-700), bar (radius 6 6 0 0, hover `filter: brightness(1.15)`), label dưới + count "[N] HV".
- Click bar → mở `CloseRateModal` cho khóa đó.

#### 7.3.1. CloseRateModal

Trigger: click KPI #2 hoặc click bar chart.

**Header:**
- Title "🎯 Tỷ lệ chốt theo khóa"
- Sub: "Phân tích chi tiết tháng 04/2026 · Tỷ lệ chốt tổng: [X]% ([closed]/[total])"
- Close `✕`

**Body:**
- Table 4 cột: Khóa | Lead | Chốt | Tỷ lệ
- Sort: rate desc.
- Color rate: `≥25%` mint, `15–25%` amber, `<15%` red.
- Insight box dưới (background accent 6%, border accent 15%): "💡 Insight: [course max rate] chốt cao nhất ([X]%) — content marketing đang hiệu quả. [course min rate] thấp dưới benchmark 25% — cần review pitch của TV viên." (text generate client-side từ data, không AI).

**Behaviors:** click backdrop → close. ESC → close.

#### 7.3.2. EnrollmentModal

Trigger: click KPI #3.

Title "✅ Đăng ký thành công theo khóa", sub "Tháng 04/2026 · Tổng [N] học viên đăng ký mới".

Table 4 cột: Khóa | Đăng ký | Doanh thu | Trạng thái (badge "Đang chạy"/"Sắp khai giảng"/"Kết thúc").

Insight box mint background: text generate từ top khóa.

---

### 7.4. PipelinePage (CRM-006..008)

Route: `/pipeline`. Roles: Founder, Admin, Consultant.

**Section heading:** "Pipeline Kanban" + sub "Quản lý pipeline tư vấn — view tổng hợp từ bàn tư vấn viên".

**Layout:** 5 cột grid `repeat(5, 1fr)`, gap 12px.

| # | Column     | Stage key    | Header color    |
| - | ---------- | ------------ | --------------- |
| 1 | Lead mới   | `lead_new`   | `var(--accent)` (#0EA5E9) |
| 2 | Tiếp cận   | `contacted`  | `var(--teal)` (#06B6D4)   |
| 3 | Tư vấn     | `consulting` | `var(--amber)` (#F59E0B)  |
| 4 | Follow-up  | `followup`   | `var(--coral)` (#F97316)  |
| 5 | Chốt đơn   | `closed`     | `var(--mint)` (#10B981)   |

**Column header:** padding 8px 12px, radius top, font-700, color trắng (cột mint/amber dùng đen vì bg sáng). Right side: count realtime số card trong cột.

**Column body:** `bg: var(--card)`, border-top none (liền với header), padding 8px, gap 8px, min-height 300px.

**Lead card:**
- `bg: var(--card2)`, radius `var(--r)`, padding 10px.
- Line 1: name (12px font-600).
- Line 2: "[interested_course] · [source label]" (10px text2). VD: "Design Thinking · Facebook Ads".
- Line 3 (flex justify-between):
  - Left: `<LeadScoreBadge score={lead.lead_score} />` — 3 buckets:
    - HOT ≥70: 🔥, `bg: rgba(239,68,68,.15)`, color red.
    - WARM 40–69: 🌤, amber bg/color.
    - COLD <40: ❄, muted bg/color.
  - Right: timestamp/callback hint:
    - Stage `closed`: badge "✅ Enrolled" mint + ngày "26/04".
    - Có `callback_at`:
      - Hôm nay → "Hôm nay" (color amber, highlight bg vàng).
      - Quá hạn → "Quá hạn [N]d" (color red).
      - Tương lai → "Gọi lại 29/04".
    - Không có callback → "[N]h trước" / "[N]d trước" (relative).

**Click lead card → LeadDetailPanel** (CRM-007):
Slide panel từ phải vào (width 480px, full height) hoặc modal — chọn slide panel để giữ context Kanban.

Panel sections:
1. **Header**: name (18px bold) + close ✕. Sub: phone + email.
2. **Thông tin cơ bản**: source · course quan tâm · TV viên phụ trách (link → filter pipeline theo TV).
3. **Lead score**: số 0–100 + bucket badge + rationale text (server cung cấp ở field tương lai; Phase 1 hiển thị "Tự động: nguồn + test_result").
4. **Lịch sử tương tác** (timeline desc):
   - Mỗi row: icon action_type + content + timestamp + performer name.
   - Type icons: `move` 🔀, `note` 💬, `call` 📞, `enroll` ✅, `sms` 💬, `email` ✉️.
5. **Action buttons** (3 nút stack):
   - 📞 **Gọi điện** — `tel:[phone]` + đồng thời INSERT pipeline_action `call` với note nullable.
   - 💬 **Ghi chú** — open `<NoteEditor>` inline (textarea + Lưu/Hủy) → INSERT `note`.
   - 🔀 **Chuyển giai đoạn** — open `<StageMoveDialog>`: select to_stage + textarea note (optional) + button "Xác nhận" → POST `/leads/:id/move`. Sau success: invalidate `['pipeline','leads']`, panel refresh, toast mint "Đã chuyển sang [stage]".

**Behaviors:**
- Mọi action → INSERT `pipeline_actions` (KHÔNG UPDATE). Quy tắc bất biến từ BigPicture.
- Stage move sang `closed` → backend trigger tạo contact + payment skeleton — FE chỉ refetch sau success.
- Drag-drop card giữa cột **Phase 2** (Phase 1 dùng Stage Move dialog).

**Empty state per column:** "Chưa có lead nào ở giai đoạn này" (italic muted, padding 16px).

**Filter (top-right Phase 2):** Filter theo TV viên (chỉ admin/founder thấy filter; Sale auto-filter `assigned_to=self`). Phase 1: hardcode `assigned_to=self` cho Sale ở api-client.

---

### 7.5. ContactsPage (CRM-009..012)

Route: `/contacts`. Roles: Founder, Admin, Consultant.

**Heading row:** Title "Contacts" + sub "Hồ sơ học viên · Click 'Chi tiết' để xem data ẩn". Phải có button **`＋ Thêm Contact`** primary (Phase 2 — Phase 1 disabled với tooltip "Phase 2").

**Filter bar** (4 controls inline):
- Input search: placeholder "Tìm tên, SĐT, email..." (debounce 300ms).
- Select source: All / Facebook Ads / Google / Referral / Webinar / Organic.
- Select course: All / [list khóa đang vận hành từ `/courses` hoặc hardcode 4 khóa Phase 1].
- Select tier: All / 💎 Kim cương / 🥇 Vàng / 🥈 Bạc / — Chưa phân loại.

Badge count "[N] kết quả" hiển thị bên phải filter sau khi apply. Button "Đặt lại" reset all filters.

**Table:**

| Col | Header     | Render                                            |
| --- | ---------- | ------------------------------------------------- |
| 1   | Tên        | `<strong>{name}</strong>`                         |
| 2   | Email      | `<span class="text-muted text-[11px]">{email}</span>` |
| 3   | SĐT        | `{phone}`                                         |
| 4   | Nguồn      | label tiếng Việt theo `LeadSource`                |
| 5   | Khóa đang học | `{current_course}` hoặc "—"                    |
| 6   | Thanh toán | Badge theo `payment_status_class`                 |
| 7   | Phân loại  | `<TierBadge tier={tier} />` — newbie hiển thị "—" |
| 8   | (action)   | Button "Chi tiết →" → mở `ContactDetailModal`     |

Row hover bg subtle. Loading: skeleton 5 row. Empty: "Không có contact nào khớp filter".

**ContactDetailModal (CRM-011):**

Modal width ~620px, padding lớn. Sections theo prototype:

1. **Header**: name (h3) + sub "[email] · [phone] / Nguồn: [source]".
2. **📌 Thông tin lead** (kv-rows): Ngày tạo lead | TV viên phụ trách (color accent).
3. **🔒 Tổng tiền đã đóng (lifetime) · Phân loại khách hàng** — **CHỈ admin/founder thấy** (Sale: section ẩn hoặc placeholder "🔒 Cần quyền admin để xem"):
   - Box bg `var(--card2)`, padding 16px, grid 2 col:
     - Left: label "Lifetime value" + value bold (28px) `formatVND(lifetime_value)` + tier badge lớn.
     - Right: text "[N] khóa (bao gồm khóa hiện tại) · [tier desc]".
4. **📖 Khóa đang học**: row tên khóa + sub "Đang học · Học phí [X]" + payment status badge.
5. **🔒 Khóa đã học (lịch sử)** — admin/founder only:
   - Mỗi row: tên khóa + period + amount.
   - Empty: "Chưa có khóa nào trong quá khứ" (italic muted).
6. **🔒 Ghi chú nội bộ** — admin/founder hoặc sale_owner=self:
   - Box bg amber 6%, italic, footer "— [author name]".
   - Empty: "Chưa có ghi chú".

Close: ✕ button + click backdrop (`event.target===this`) + ESC.

**`<TierBadge>` thresholds (utils/tier.ts):**

```ts
export function getTier(lifetime: number, courseCount: number): {
  key: ContactTier; label: string; icon: string; cssClass: string; desc: string;
} {
  if (!lifetime || lifetime <= 0)
    return { key: 'newbie', label: '—', icon: '', cssClass: 'badge-newbie', desc: 'Chưa enroll' }
  if (lifetime >= 10_000_000 || courseCount >= 3)
    return { key: 'diamond', label: 'Kim cương', icon: '💎', cssClass: 'badge-diamond', desc: 'VIP · 3+ khóa' }
  if (lifetime >= 5_000_000 || courseCount >= 2)
    return { key: 'gold', label: 'Vàng', icon: '🥇', cssClass: 'badge-gold', desc: 'Khách thân thiết · 2 khóa' }
  return { key: 'silver', label: 'Bạc', icon: '🥈', cssClass: 'badge-silver', desc: 'Mới / 1 khóa' }
}
```

Server đã trả `tier` ở response → FE chủ yếu dùng để render badge; chỉ fallback compute khi missing.

**AddContactModal (CRM-012, Phase 2):**
Form fields:
- Họ tên (text, required, min 2)
- Email (email, required, regex chuẩn)
- SĐT (text, required, regex VN: `^(0|\+84)[0-9]{9}$`)
- Nguồn (select required: 5 options)
- Khóa quan tâm (select khóa đang vận hành, optional)
- TV viên phụ trách (select users role=consultant, default = current user nếu role consultant)

Buttons: "Lưu" → POST `/contacts` → invalidate list + toast "Đã thêm contact!" + close. "Hủy" / backdrop → close không lưu. Validate inline (red text dưới field). Toast lỗi nếu API trả 400.

---

### 7.6. FinancePage (CRM-013..014)

Route: `/finance`. Roles: **Founder, Admin only** (Sale truy cập → RoleGate redirect `/dashboard` + toast "Bạn không có quyền truy cập trang này").

**Heading:** "💰 Tài chính" + sub "Tổng quan thanh toán — dữ liệu đồng bộ từ payment gateway".

**KPI Grid 4 cột:**

| # | KPI            | Value                                          | Color         |
| - | -------------- | ---------------------------------------------- | ------------- |
| 1 | 💰 Tổng thu tháng | `total_revenue_vnd` "186.5M ₫" + delta ↑/↓ %  | text          |
| 2 | 📥 Đã thu      | `collected_vnd` + footer "[X]% tổng"           | mint          |
| 3 | ⏳ Công nợ      | `receivable_vnd` + "[N] học viên"             | amber         |
| 4 | 🔴 Quá hạn     | `overdue_vnd` + "[N] học viên"                | red (chỉ khi >0; =0 thì muted) |

**Transaction Card:**

Header row (flex-wrap): Title "Giao dịch gần đây" + filter inline.

Filter bar:
- Date `from` (default `2026-04-01`), `to` (default `2026-04-30`). Native `<input type=date>` color-scheme dark.
- Select course: All / 4 khóa.
- Select status: All / ✓ Hoàn thành / ⏳ Đang chờ / 🔴 Quá hạn / ↩ Hoàn tiền.
- Button "Đặt lại" reset.

Summary bar (sau khi apply filter): row 3 metric:
- "Số giao dịch: [N]"
- "Tổng giá trị: [VND]" (mint nếu ≥0, red nếu <0)
- "Khoảng thời gian: [from] → [to]"

Filter logic: client-side filter table rows (vì list pagination Phase 1 dưới 1k rows). Phase 2: server-side filter qua query params.

Table cols: Học viên | Khóa | Số tiền | Phương thức | Trạng thái | Ngày | Gateway

- Số tiền: bold; nếu negative (refund) → color muted với prefix "−" (ví dụ "−1,500,000₫").
- Status badge map:
  - `completed` → mint "✓ Hoàn thành"
  - `pending` → amber "⏳ Chờ kỳ [N]" hoặc "⏳ Đang chờ"
  - `overdue` → red "🔴 Quá hạn [X] ngày" + row bg `rgba(239,68,68,0.04)`
  - `refunded` → muted "↩ Hoàn tiền"
- Ngày: `paid_at` nếu có, fallback `due_date` với prefix "Hạn:".
- Click row overdue → navigate `/overdue?focus=[payment_id]`.

---

### 7.7. OverduePage (CRM-015..017)

Route: `/overdue`. Roles: Founder/Admin (full list); Consultant (chỉ case của mình).

**Heading:** "🔴 Thanh toán quá hạn" + sub "[N] học viên có khoản thanh toán quá hạn — cần xử lý ngay".

**Alert banner critical** (top, sticky 60px below topbar): hiển thị nếu có case `overdue_days >= 7`. "🔴 KHẨN CẤP cho Sale — [name] quá hạn [X] ngày · đã escalate Admin". Chỉ banner cho case khẩn nhất (top 1).

**Sort:** desc theo `overdue_days` (nặng nhất trên cùng).

**OverdueCard:** stack vertical, gap 12px. Border-left:
- Severity `critical` (≥5 ngày) → `border-left: 3px solid var(--red)`
- Severity `warn` (<5 ngày) → `border-left: 3px solid var(--amber)`

Card sections:

1. **Header row** (flex justify-between):
   - Left:
     - Name (15px bold)
     - "[course_name] · [installment_type]" (12px text2)
     - "Sale phụ trách: [name] · SĐT: [phone]" (11px, name color accent)
   - Right (text-right):
     - "Đang quá hạn" (11px text2)
     - `{overdue_amount}` (20px bold, color red/amber theo severity)
     - "Quá hạn [X] ngày" (11px font-600 same color)

2. **Progress 3-column box** (grid 3 col, padding 12px 14px, bg `var(--card2)`):
   - Tổng học phí: `{total_fee}` + sub "[N] kỳ × [X]M"
   - Đã thanh toán: `{paid_amount}` (mint) + sub "✓ Kỳ [last_paid_index] ([date])"
   - Còn nợ: `{remaining_amount}` (red/amber) + sub "Kỳ [overdue_idx] (quá hạn) + Kỳ [next]..."

3. **Installment progress bar** (8px height, radius 4px, overflow hidden):
   - Chia theo `installment_total` segments, each `width: 100/N %`.
   - Color theo segment status:
     - `paid` → mint
     - `overdue` → red (severity critical) hoặc amber (warn)
     - `pending` → `var(--card2)` + `border-left: 1px dashed var(--text3)` cho segment chưa đến hạn.
   - Below bar: row text 10px showing each installment label "✓ Kỳ 1 / 🔴 Kỳ 2 · 20/04 / Kỳ 3 · 20/05" với color tương ứng.

4. **Action buttons row** (gap 8px, mt 14px):
   - **📞 Liên hệ** (primary) → `<ContactDialer>`:
     - Modal nhỏ: hiển thị `tel:[contact_phone]` link auto-clickable + textarea note + button "Lưu cuộc gọi" → POST `/payments/:id/contact` body `{ note }`.
     - Sau success: toast mint "Đã ghi nhận cuộc gọi", invalidate `['overdue']` + `['leads', contact.lead_id, 'actions']`.
   - **💬 Ghi chú** (secondary) → `<NoteEditor>` inline:
     - Textarea expand inline trong card + button Lưu/Hủy.
     - Lưu → POST `/payments/:id/note` body `{ note }`. Sau success: toast "Đã thêm ghi chú · [timestamp]".
   - **⏸ Tạm dừng học** (danger, **chỉ admin/founder** thấy) → `<PauseStudyDialog>`:
     - Confirm 2 bước: dialog 1 "Bạn có chắc chắn tạm dừng học?" → click "Xác nhận" → dialog 2 textarea reason required (min 20 char) + button "Tạm dừng".
     - Submit → POST `/payments/:id/pause` body `{ reason }`. Toast "Đã tạm dừng học của [name]".

**Toast realtime (CRM-017)** — global, không phụ thuộc trang:

`useOverdueSSE` mount ở `App.tsx` (sau ProtectedRoute). Listen event `type=overdue.new`:

- Push toast vào stack góc phải trên (z-index 1000).
- Toast shape:
  - Critical (severity=`critical`): border-left `3px solid var(--red)`, icon 🔴.
  - Warn: border-left amber, icon 🟡.
  - Body: "[severity_title]" + "[contact_name] · [course_name]" + "[amount] ₫ · Quá hạn [N] ngày · Sale: [name]"
  - Auto dismiss sau **10 giây**.
  - Close button ✕ stop propagation.
  - Click toast (không phải ✕) → navigate `/overdue` + dismiss.
- Đồng thời: bump `useOverdueBadgeStore.count` để sidebar badge update realtime.

---

### 7.8. AnalyticsPage (CRM-018..021)

Route: `/analytics`. Roles: **Founder only** (Admin OK theo BigPicture nói "Analytics chỉ Founder" — nhưng user role `admin` cũng có quyền vì Founder = role founder, Admin = founder/admin combined). Quyết định: `founder | admin` được phép. Sale → redirect `/dashboard`.

**Heading:** "📈 Analytics" + sub "Phân tích hiệu quả marketing, tư vấn, và khóa học".

**Date range** (Phase 1 hardcode tháng hiện tại; Phase 2 `<DateRangePicker>` với quick options Tháng này / Tháng trước / Quý này / Tùy chọn).

**Tabs** (3 tabs, click switch):

#### Tab 1 — Conversion Funnel

Table 3 cols: Stage | Số lượng | Tỷ lệ qua bước.

Rows theo stage order: Lead mới → Đã liên hệ → Đang tư vấn → Follow-up → Chốt đơn.

Conversion % calculation: `count[i] / count[i-1] * 100` (row đầu = 100%).

Color rule: `≥70%` mint, `50–70%` amber, `<50%` red.

Highlight stage có rate thấp nhất (ngoài row đầu): row bg `rgba(239,68,68,0.04)` + tooltip "Cải thiện ưu tiên".

Bold "Lead mới" (đầu) + "Chốt đơn" (cuối) names + count cuối.

#### Tab 2 — Nguồn Lead

Table 5 cols: Nguồn | Leads | Chốt | Tỷ lệ | Doanh thu.

Sort default: rate desc. Click header để sort theo từng cột.

Row top rate: badge "Top" amber bên cạnh source name + bold row.

Color rate: same scheme funnel.

Doanh thu format: "[X]M" (chia 1tr).

Source label tiếng Việt:
- `facebook_ads` → "Facebook Ads"
- `google` → "Google"
- `referral` → "Referral"
- `webinar` → "Webinar"
- `organic` → "Organic"
- `tiktok` → "TikTok"

#### Tab 3 — TV viên KPI

Table 5 cols: TV viên | Leads | Chốt | Tỷ lệ | TB phản hồi (giờ).

Sort default: rate desc.

TB phản hồi color:
- `≤3h` → mint
- `3–5h` → text default (hoặc amber nếu strict; theo prototype 3.5h text default → giữ default; >5h amber; >6h red).
- `>5h` → red flag icon 🚩 cạnh value.

TV viên top rate: badge "Top" mint bên cạnh name.

Click name → Phase 2 mở pipeline cá nhân TV viên (Phase 1: no-op + tooltip "Phase 2").

---

### 7.9. NotFoundPage / 403 Forbidden

Route: `*` → redirect `/dashboard`.
RoleGate fail (Sale truy cập admin route) → redirect `/dashboard` + push toast warn "Bạn không có quyền truy cập [path]".

---

## 8. Shared Components

| Component                  | Notes                                                                            |
| -------------------------- | -------------------------------------------------------------------------------- |
| `<Card>`                   | Wrapper bg/border/radius/padding theo prototype. Props `padding`, `borderColor`. |
| `<Badge>`                  | Variants: `hot`/`warm`/`cold`/`active`/`pending`/`paid`/`overdue`/`refunded`/`info`/`diamond`/`gold`/`silver`/`newbie`. |
| `<Button>`                 | Variants: `primary` (accent), `secondary` (card2), `danger` (red), `ghost`. Sizes: `sm`, `md`. |
| `<Modal>`                  | Backdrop click close (`event.target === this`). ESC close. Focus trap. Body scroll lock. |
| `<ConfirmDialog>`          | Wrapper Modal: title + message + Cancel/Confirm buttons. Props `variant: 'danger' \| 'default'`. |
| `<Toast>` + `<ToastStack>` | Stack góc phải trên, z 1000. `useToastStore.push({ type, title, body, meta?, ttl? })`. |
| `<Table>`                  | Wrapper với loading skeleton + empty state + sort header.                        |
| `<Select>`, `<Input>`      | Style theo prototype: bg `card2`, border, radius `r`, padding 7px 12px.          |
| `<Tabs>`                   | Active tab: border-bottom 2px accent. Switch cập nhật query param `?tab=`.       |
| `<Spinner>`                | SVG spinner 24px, color accent.                                                  |
| `<EmptyState>`             | Icon + title + sub + optional action button.                                     |
| `<DeltaBadge>`             | "↑ X%" mint (bg mint 10%) hoặc "↓ X%" red. Auto sign từ delta number.            |
| `<LeadScoreBadge>`         | Inputs `score: number`. Auto bucket + emoji + class.                             |
| `<TierBadge>`              | Inputs `tier: ContactTier`. Render icon + label.                                 |
| `<PaymentStatusBadge>`     | Inputs `status: PaymentStatus`, `installmentIndex?`, `overdueDays?`. Tự sinh label đúng prototype. |
| `<ApiErrorView>`           | Inline error state cho query failure: icon + message + retry button.             |
| `<ErrorBoundary>`          | Catch render errors → fallback UI + log Sentry (Phase 2).                        |

---

## 9. AI Prompts

**KHÔNG có AI features ở Phase 1.**

Insight text trong CloseRateModal/EnrollmentModal là template-based, generate client-side từ data:

```ts
// pseudo
const top = sortByRate(rows)[0]
const bottom = sortByRate(rows).at(-1)
return `Insight: ${top.course} chốt cao nhất (${top.rate}%) — content marketing đang hiệu quả. ${bottom.course} thấp dưới benchmark 25% — cần review pitch của TV viên.`
```

Phase 2+ có thể tích hợp insight tự động qua Anthropic API — không nằm trong scope file này.

---

## 10. Build Order — Sprint 14 ngày

Adapt từ Sprint plan BigPicture (vốn cover full-stack). Vì CRM portal là FE-only và `nedu-backend` build song song, sprint này focus FE + MSW; Sprint 6 mới integrate backend thật.

### Sprint 1 — Foundation (Day 1–2)

- [ ] `npm create vite@latest nedu-crm -- --template react-ts`
- [ ] Install deps: `@tanstack/react-query`, `react-router-dom`, `zustand`, `msw`, `tailwindcss`, `@tailwindcss/vite`
- [ ] Config `vite.config.ts` với 4 alias: `@`, `@shared`, `@modules`, `@routes`.
- [ ] Tạo `src/shared/config/`: `env.ts`, `token-storage.ts`, `auth-central-client.ts`, `api-client.ts`, `query-client.ts`, `sse-client.ts` — copy logic từ ops.nedu.vn template (architecture.md mục 4-5), không modify core.
- [ ] Tạo `src/modules/auth/`: `useAuthStore.ts` (interface đúng spec architecture.md mục 5), `LoginPage.tsx` (Google button), `AuthCallbackPage.tsx`.
- [ ] Tạo `src/routes/`: `index.tsx` (AppRouter), `ProtectedRoute.tsx`, `RoleGate.tsx`.
- [ ] `src/main.tsx`: `await enableMocking()` trước render.
- [ ] `src/mocks/`: `init.ts`, `browser.ts`, `config.ts`, `handlers/auth.ts` (mock `/auth/me` đọc `mock_uid` từ localStorage), `data/users.ts` (3 personas: founder, admin, consultant).
- [ ] `npx msw init public/`.
- [ ] `.env.example` (`VITE_API_URL`, `VITE_AUTH_CENTRAL_URL`, `VITE_ENABLE_MOCKING`).
- [ ] `vercel.json` SPA rewrite.
- [ ] Tailwind `index.css` với CSS vars match prototype + `@theme` directive.
- [ ] AppLayout shell: Sidebar + Topbar + content slot. Sidebar render đủ 3 nav-section (chưa cần badge realtime ở sprint này).
- [ ] **Verify:** `npm run dev` → mock login flow chạy end-to-end, mock_uid switch persona đổi sidebar (Sale ẩn finance/analytics).

### Sprint 2 — Pipeline (Day 3–5) ⭐

Module quan trọng nhất — consultant phải dùng được trong tuần đầu.

- [ ] Mock data: `mocks/data/leads.ts` (~30 leads phân 5 stage, mix score), `pipeline-actions.ts` (audit log), `courses.ts` (4 khóa Phase 1 + 1 "Khác").
- [ ] Handlers: `mocks/handlers/leads.ts` cho `/leads`, `/leads/:id`, `/leads/:id/actions`, POST `/leads/:id/move`, POST `/leads/:id/actions`, PATCH `/leads/:id/callback`. Mutate array trực tiếp. Mock filter `assigned_to=self` cho consultant persona.
- [ ] Hooks: `useLeads`, `useLead`, `usePipelineActions`, `useMoveLeadStage`. Query keys hierarchical: `['pipeline','leads', filters]`, `['pipeline','leads', leadId]`, `['pipeline','leads', leadId, 'actions']`.
- [ ] Components: `KanbanBoard`, `KanbanColumn`, `LeadCard`, `LeadScoreBadge`, `CallbackBadge`, `LeadDetailPanel`, `StageMoveDialog`, `NoteEditor`.
- [ ] `PipelinePage.tsx` route `/pipeline`.
- [ ] **Verify:** load 5 columns đúng count, click card → panel mở, ghi chú/move stage → action timeline update + count cột thay đổi.

### Sprint 3 — Contacts (Day 5–7)

- [ ] Mock data: `mocks/data/contacts.ts` — 7 contacts theo prototype (lan/minh/phuc/ha/dung/mai/tuan).
- [ ] Handlers: `mocks/handlers/contacts.ts` cho `/contacts` (filter q/source/course/tier), `/contacts/:id` (role-based fields: nếu mock_uid là consultant → ẩn `lifetime_value`, `course_history`, `internal_note` cho contact không thuộc mình).
- [ ] Hooks: `useContacts`, `useContact`. Query keys: `['contacts', 'list', filters]`, `['contacts', contactId]`.
- [ ] Components: `ContactsTable`, `ContactsFilterBar`, `ContactDetailModal`, `TierBadge`, `AddContactModal` (Phase 2 placeholder).
- [ ] `ContactsPage.tsx` route `/contacts`.
- [ ] **Verify:** filter combos đúng, modal hiển thị đầy đủ data, Sale persona thấy section LTV/note ẩn hoặc placeholder "🔒 Cần quyền admin".

### Sprint 4 — Finance + Overdue + Realtime (Day 7–10)

- [ ] Mock data: `mocks/data/payments.ts` — 7 transactions theo prototype + 2 overdue cases (Lưu Văn Bảo 7d, Trần Văn Minh 3d).
- [ ] Handlers: `payments.ts` cho `/finance/summary`, `/payments`, `/payments/overdue`. `overdue-actions.ts` cho POST contact/note/pause.
- [ ] Hooks: `useFinanceSummary`, `usePayments`, `useOverdueList`, `useLogContact`, `useAddNote`, `usePauseStudy`.
- [ ] Components: `FinanceKpiGrid`, `PaymentsTable`, `PaymentsFilterBar`, `PaymentsSummaryBar`, `PaymentStatusBadge`, `OverdueCard`, `InstallmentProgressBar`, `ContactDialer`, `OverdueAlertBanner`, `PauseStudyDialog`.
- [ ] `FinancePage.tsx` route `/finance` (Founder/Admin only via RoleGate).
- [ ] `OverduePage.tsx` route `/overdue`.
- [ ] **SSE realtime:** `mocks/handlers/sse-overdue.ts` — handler trả `text/event-stream`, push 1 `overdue.new` event sau 6s và 1 sau 14s (như prototype demo). `useOverdueSSE` hook subscribe, push toast vào `useToastStore`, bump `useOverdueBadgeStore`. Mount hook ở `App.tsx` sau ProtectedRoute.
- [ ] Sidebar badge "Quá hạn" subscribe `useOverdueBadgeStore.count`.
- [ ] **Verify:** Toast pop sau 6s/14s ở mọi trang, click toast → navigate /overdue + dismiss, badge sidebar count đồng bộ. Sale persona không truy cập được /finance (redirect /dashboard + toast warn).

### Sprint 5 — Dashboard + Analytics (Day 10–12)

- [ ] Mock data: aggregate function trong `mocks/handlers/dashboard.ts` đọc từ leads/contacts/payments mock arrays để compute `DashboardSummary` realtime (không hardcode → thay đổi data ở module khác sẽ phản ánh ở Dashboard sau refresh).
- [ ] Handlers: `dashboard.ts` (3 endpoints), `analytics.ts` (3 endpoints).
- [ ] Hooks: `useDashboardSummary`, `useCloseRateByCourse`, `useEnrollmentByCourse`, `useFunnel`, `useLeadSourceStats`, `useConsultantKpi`.
- [ ] Components: `KpiCard`, `RevenueByCourseChart` (SVG/CSS bar chart, no lib), `CloseRateModal`, `EnrollmentModal`, `OverdueAlertBanner` (Dashboard variant), `AnalyticsTabs`, `ConversionFunnelTable`, `LeadSourceTable`, `ConsultantKpiTable`.
- [ ] `DashboardPage.tsx` route `/dashboard`.
- [ ] `AnalyticsPage.tsx` route `/analytics` (Founder/Admin only).
- [ ] **Verify:** 5 KPI cards render đúng, click KPI #2/#3 → modal đúng, click bar chart → modal close-rate cho khóa đó. Banner Dashboard hiện khi có overdue critical, ẩn khi không. Sale persona không vào /analytics.

### Sprint 6 — Polish + Integration (Day 12–14)

- [ ] RBAC test toàn bộ: 3 personas qua mọi route, verify ẩn/hiện đúng.
- [ ] Visual polish: match prototype màu/spacing/font weight pixel-perfect (so sánh side-by-side `crm-nedu.html`).
- [ ] Loading skeletons + empty states + error states cho mọi list.
- [ ] Keyboard support: Modal ESC, Tabs arrow keys, Table row Enter để mở detail.
- [ ] Accessibility cơ bản: focus ring, aria-label cho icon buttons, role="dialog" cho modal.
- [ ] Switch mode: set `VITE_ENABLE_MOCKING=false` → integrate `api.nedu.vn` thật (nếu IT đã ready). Fix mismatch envelope nếu có.
- [ ] Build + deploy Cloudflare Workers (xem section 13 — Deploy flow): `npm run deploy:dev` → smoke test ở `nedu-crm-dev.workers.dev`, sau đó `npm run deploy:prod` → smoke test ở `nedu-crm-prod.workers.dev`. Sau khi 2 env chạy được mới lên dashboard Cloudflare cấu hình GitHub repo + branch + env vars + custom domain `crm.nedu.vn`.
- [ ] Smoke test prod: login Google → dashboard load → mỗi module đi qua được.

### Phase 2 backlog (sau launch)

- TopbarSearch (CRM-005) hoạt động đầy đủ với multi-resource search.
- AddContact form (CRM-012) — actual create.
- Drag-drop card Kanban giữa cột.
- DateRangePicker Analytics (CRM-021).
- Click TV viên → personal pipeline view.
- Sentry error tracking + ErrorBoundary network-aware fallback.
- Recharts cho chart phức tạp hơn nếu cần.

---

## 11. Environment Variables

`.env.example`:

```bash
# Backend của N-Education (Express/NestJS — IT đang build)
VITE_API_URL=http://localhost:8080

# NLH Central Auth (Google OAuth provider)
VITE_AUTH_CENTRAL_URL=http://localhost:4000

# Bật MSW mock layer ở dev (PROD luôn = false)
VITE_ENABLE_MOCKING=true
```

Cloudflare Workers env (cấu hình trên dashboard sau lần deploy đầu — xem section 13):
- `production` (`nedu-crm-prod`): `VITE_API_URL=https://api.nedu.vn`, `VITE_AUTH_CENTRAL_URL=https://auth-central.vn` (hoặc domain prod tương đương), `VITE_ENABLE_MOCKING=false`.
- `dev` (`nedu-crm-dev`): trỏ tới staging API; `VITE_ENABLE_MOCKING=false` (mock chỉ chạy ở `npm run dev` local).
- Build-time vars: cấu hình ở Cloudflare → Workers → Settings → Variables and Secrets (build vars). Cũng có thể inline qua `.env.production` / `.env.development` ở local nếu muốn deploy thủ công.

LocalStorage keys (dùng chung toàn NLH):
- `nlh_access_token` — JWT access (~15min TTL)
- `nlh_refresh_token` — JWT refresh (~30 ngày TTL)
- `mock_uid` — chỉ tồn tại khi `VITE_ENABLE_MOCKING=true`, dùng để switch persona Founder/Admin/Sale ở dev.

---

## 12. Câu lệnh mở đầu cho Claude Code

Sau khi tạo folder `nedu-crm/` và bỏ file `CLAUDE.md` này vào root, mở Claude Code và paste:

```
Đọc CLAUDE.md.

Build nedu-crm theo đúng spec trong file này.
Bắt đầu Sprint 1 (Foundation): scaffold Vite + TS + Tailwind v4 + alias, các shared/config theo architecture.md, auth shell (LoginPage, AuthCallbackPage, useAuthStore với mock branch + live branch), routing với ProtectedRoute và RoleGate, MSW init với handler /auth/me và 3 personas mock (founder/admin/consultant), AppLayout với Sidebar + Topbar khớp prototype crm-nedu.html.

Tạo xong Sprint 1 thì:
1. List tất cả file đã tạo.
2. Verify checklist Sprint 1 trong CLAUDE.md mục 10.
3. Chỉ ra cách switch mock_uid để test 3 personas.

Tôi confirm rồi mới qua Sprint 2 (Pipeline).

QUY TẮC TUYỆT ĐỐI:
- KHÔNG đổi tech stack đã fix ở section 2.
- KHÔNG thêm feature ngoài spec (Phase 2 items để placeholder).
- KHÔNG dùng Supabase client trực tiếp ở FE — mọi data qua api-client wrapper.
- pipeline_actions chỉ INSERT (UI không có UPDATE/DELETE).
- RLS UI: Sale ẩn LTV, finance, analytics — defense in depth, server vẫn enforce.
- Match prototype crm-nedu.html pixel-by-pixel cho màu/spacing/badge.
- Dùng CSS variables theo section 7 (--bg, --accent, --mint, --red, ...).

Khi nghi ngờ:
- UI → mở crm-nedu.html
- Business rule → mở Nedu_CRM_BigPicture_IT_Brief.html
- Convention → mở architecture.md
- Acceptance criteria → mở crm-nedu_UserStory.docx
```

---

## 13. Deploy lên Cloudflare Workers

> Stack: Vite + `@cloudflare/vite-plugin` (build ra `dist/` + auto-generate `dist/wrangler.json`) + `wrangler` CLI. Cùng flow với `hieucon.vn` (Next.js qua OpenNext) — chỉ khác build adapter. Reference đầy đủ: [`/DEPLOY-CLOUDFLARE.md`](../../DEPLOY-CLOUDFLARE.md).
>
> **Quan trọng:** Worker name **thực tế** trên CF = top-level `name` trong `wrangler.jsonc` (`nedu-crm`). Block `env.{dev,production}.name` (`nedu-crm-dev` / `nedu-crm-prod`) giữ trong file làm **declaration / reference** cho slug worker mong muốn, nhưng wrangler/vite-plugin không apply field đó. Việc tách 2 worker dev/prod thực sự dựa vào `--name nedu-crm-dev` và `--name nedu-crm-prod` ở `deploy:dev` / `deploy:prod` scripts.

### 13.1 Lần đầu deploy (làm 1 lần ở local)

Trước khi cấu hình GitHub auto-deploy trên Cloudflare dashboard, **luôn deploy thủ công từ máy local** để verify cả 2 environment chạy được.

```bash
# 1. Login Cloudflare CLI (chỉ chạy 1 lần / 1 máy — mở browser xác thực)
npx wrangler login

# 2. Verify đã login đúng account
npx wrangler whoami

# 3. Deploy environment dev → tạo Worker `nedu-crm-dev`
npm run deploy:dev
# → mở https://nedu-crm-dev.<account>.workers.dev và smoke test

# 4. Deploy environment production → tạo Worker `nedu-crm-prod`
npm run deploy:prod
# → mở https://nedu-crm-prod.<account>.workers.dev và smoke test
```

Sau bước này, 2 Worker đã tồn tại trên Cloudflare account → đủ điều kiện để gắn vào GitHub repo và custom domain.

### 13.2 Cấu hình tiếp trên Cloudflare dashboard (sau khi deploy local OK)

Vào dashboard Cloudflare → **Workers & Pages** → chọn từng Worker (`nedu-crm-dev`, `nedu-crm-prod`) và cấu hình:

1. **Source · Connect to Git**
   - Connect GitHub repo `nedu-crm` (hoặc tên repo tương ứng).
   - `nedu-crm-dev`: branch `develop` (hoặc `staging`) → auto deploy mỗi khi push.
   - `nedu-crm-prod`: branch `main` → auto deploy mỗi khi push.
   - Build command: `npm run build` (vì `@cloudflare/vite-plugin` đã sinh `dist/wrangler.json`).
   - Deploy command: `npx wrangler deploy --name nedu-crm-dev` (hoặc `--name nedu-crm-prod` cho worker prod).

2. **Settings · Variables and Secrets** (build-time + runtime nếu cần)
   - `VITE_API_URL` — `https://api.nedu.vn` (prod) / staging URL (dev).
   - `VITE_AUTH_CENTRAL_URL` — URL `auth-central` tương ứng env.
   - `VITE_ENABLE_MOCKING` — `false` cho cả 2 env (mock chỉ chạy ở `npm run dev`).
   - Secret (nếu có) → mark là Secret, không để plaintext.

3. **Settings · Domains & Routes**
   - `nedu-crm-prod`: gắn custom domain `crm.nedu.vn` (DNS có sẵn ở Cloudflare → 1-click).
   - `nedu-crm-dev`: gắn `crm-dev.nedu.vn` (hoặc giữ subdomain `*.workers.dev` nếu chỉ team IT dùng).

4. **(Tùy chọn) Settings · Build · Watch paths** — nếu repo monorepo, cấu hình watch chỉ thư mục `crm.nedu.vn/**` để tránh build trùng.

### 13.3 Sau lần đầu — flow hằng ngày

- Push lên branch tương ứng → Cloudflare auto build + deploy.
- Cần redeploy thủ công (rollback / debug) → vẫn chạy được `npm run deploy:dev` / `npm run deploy:prod` từ local (login token vẫn còn).
- Thay đổi `wrangler.jsonc` (thêm binding R2/KV/Durable Object) → phải deploy local 1 lần để test trước, rồi mới merge.

### 13.4 Các quy tắc

- **Không** tự ý đổi `name` trong `wrangler.jsonc` (top-level đã pin `nedu-crm`; env block `nedu-crm-dev` / `nedu-crm-prod` giữ làm declaration). Worker dev/prod thực tế được tách qua `--name` flag trong package.json scripts.
- **Không** commit `.wrangler/` (đã `.gitignore`) — đó là local state.
- File `vercel.json` **giữ lại** — team vibe coding (non-IT) deploy nhánh prototype của họ lên Vercel song song; CRM portal chính chạy trên Cloudflare nhưng config Vercel SPA rewrite + MSW headers vẫn cần cho luồng vibe coding. Không xoá.
- SPA fallback đã handle qua `assets.not_found_handling: "single-page-application"` trong `wrangler.jsonc` — không cần worker code custom.
- MSW (`mockServiceWorker.js`) chỉ active khi `VITE_ENABLE_MOCKING=true` ở build time → prod không phục vụ mock dù file vẫn nằm trong assets.

---

## Appendix A — CSS variables (Tailwind v4 `@theme`)

`src/index.css`:

```css
@import "tailwindcss";

@theme {
  /* Surfaces */
  --color-bg: #0A1628;
  --color-bg2: #0F2447;
  --color-card: #132040;
  --color-card2: #1E3A5F;

  /* Brand & accents */
  --color-accent: #0EA5E9;
  --color-teal:   #06B6D4;
  --color-mint:   #10B981;
  --color-amber:  #F59E0B;
  --color-coral:  #F97316;
  --color-red:    #EF4444;
  --color-muted:  #64748B;

  /* Text */
  --color-text:  #E2E8F0;
  --color-text2: #94A3B8;
  --color-text3: #475569;

  /* Borders */
  --color-border:  rgba(255,255,255,0.08);
  --color-border2: rgba(255,255,255,0.04);

  /* Layout */
  --spacing-sidebar: 240px;
  --spacing-topbar:  56px;

  /* Radii */
  --radius-r:  8px;
  --radius-r2: 12px;
  --radius-r3: 16px;

  /* Fonts */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
}

html { font-size: 14px; }
body { font-family: var(--font-sans); background: var(--color-bg); color: var(--color-text); }
```

Class usage example: `bg-card`, `text-text2`, `rounded-r2`, `border-border`, etc. — Tailwind v4 auto-generate từ `@theme`.

---

## Appendix B — Mock personas (`mocks/data/users.ts`)

```ts
export const MOCK_USERS = [
  {
    id: 'u_founder',
    email: 'nhi@nedu.vn',
    name: 'Lê Thảo Nhi',
    avatar_url: '',
    role: 'founder',
  },
  {
    id: 'u_admin',
    email: 'admin@nedu.vn',
    name: 'Admin Demo',
    role: 'admin',
  },
  {
    id: 'u_consultant_minhtam',
    email: 'minhtam@nedu.vn',
    name: 'Minh Tâm',
    role: 'consultant',
  },
] as const

export const DEFAULT_MOCK_ID = 'u_admin'
```

Switch persona ở dev: `localStorage.setItem('mock_uid', 'u_consultant_minhtam')` rồi reload — auth store re-init với user mới, sidebar/route gates apply lại.

---

## Appendix C — Quy tắc IT bất di bất dịch (theo BigPicture mục 04)

1. **`pipeline_actions` chỉ INSERT — bất biến tuyệt đối.** UI không expose edit/delete cho action history. Sai = dữ liệu audit bị tampered.
2. **Toast overdue là realtime — không polling.** SSE hoặc Supabase Realtime. Delay tối đa chấp nhận: 30s.
3. **Google OAuth qua Google Workspace Nedu.** Nhân viên nghỉ → IT Ops remove khỏi Workspace → mất access ngay. Không có password riêng.
4. **RLS phân quyền theo role — Finance/Analytics chỉ Admin/Founder.** UI ẩn là defense-in-depth; server RLS là last line.
5. **Analytics Phase 1: query trực tiếp.** Khi data >10k records mới cân nhắc materialized view.
6. **Mọi automation có thể thì phải tự động.** Lead mới → Telegram 5 phút (server). SLA 24h alert (server). Overdue → toast + escalate (server + FE SSE). FE nhiệm vụ: render đúng + push action → server.

---

*CLAUDE.md · nedu-crm v1.0 · NhiLe Holdings · Tháng 4/2026*
*Sources: NL-PROMPT-BUILD-001 (master prompt) + Nedu_CRM_BigPicture_IT_Brief + crm-nedu_UserStory + crm-nedu.html (prototype) + architecture.md (NLH frontend portal template)*
