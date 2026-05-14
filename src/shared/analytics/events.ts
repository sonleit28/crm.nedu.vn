// Event catalog — typed.
//
// Mỗi event có schema cố định. Khi thêm event mới: thêm key vào `EventMap`,
// sau đó dùng `analytics.track('name', { ...params })` ở consumer.
//
// Quy tắc params:
// - KHÔNG truyền PII (email, full_name, phone, payment info). Chỉ truyền ID.
// - Tên event: snake_case, dạng `domain_action[_result]`.

export interface EventMap {
  // placeholder — phase 1 chưa định nghĩa event domain.
  // Ví dụ sẽ thêm dần:
  // pipeline_stage_moved: { lead_id: string; from_stage: string; to_stage: string }
  // contact_detail_opened: { contact_id: string }
  // payment_status_filtered: { status: string }
}

export type EventName = keyof EventMap
