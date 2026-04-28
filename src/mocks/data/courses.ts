import type { Course } from '@shared/types/domain'

export const MOCK_COURSES: Course[] = [
  {
    id: 'c_design_thinking_b5',
    name: 'Design Thinking B5',
    batch: 'B5',
    price_vnd: 8_500_000,
    status: 'running',
    started_at: '2026-04-01',
  },
  {
    id: 'c_la_chinh_minh_b3',
    name: 'Là Chính Mình B3',
    batch: 'B3',
    price_vnd: 6_500_000,
    status: 'running',
    started_at: '2026-04-10',
  },
  {
    id: 'c_public_speaking_b2',
    name: 'Public Speaking B2',
    batch: 'B2',
    price_vnd: 5_500_000,
    status: 'upcoming',
    started_at: '2026-05-15',
  },
  {
    id: 'c_storytelling_b4',
    name: 'Storytelling B4',
    batch: 'B4',
    price_vnd: 7_000_000,
    status: 'running',
    started_at: '2026-04-05',
  },
  {
    id: 'c_other',
    name: 'Khác',
    batch: '—',
    price_vnd: 0,
    status: 'finished',
  },
]

export function findCourseById(id?: string): Course | undefined {
  if (!id) return undefined
  return MOCK_COURSES.find((c) => c.id === id)
}
