import { useContact } from '../hooks/useContact'
import { Modal, ModalHeader, ModalBody } from '@shared/components/ui/Modal'
import { Spinner } from '@shared/components/ui/Spinner'
import { TierBadge } from './TierBadge'
import { SOURCE_LABEL } from '@shared/utils/enums'
import { formatDateVN } from '@shared/utils/formatDateVN'
import { formatVND } from '@shared/utils/formatVND'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'

interface ContactDetailModalProps {
  contactId: string | null
  onClose: () => void
}

export function ContactDetailModal({ contactId, onClose }: ContactDetailModalProps) {
  const { data: contact, isLoading } = useContact(contactId)
  const role = useAuthStore((s) => s.user?.role)
  const isAdmin = role === 'founder' || role === 'admin'

  const paymentBadgeCls = {
    paid: 'bg-mint/10 text-mint border border-mint/30',
    completed: 'bg-mint/10 text-mint border border-mint/30',
    pending: 'bg-amber/10 text-amber border border-amber/30',
    overdue: 'bg-red/10 text-red border border-red/30',
    refunded: 'bg-muted/10 text-text2 border border-border',
  }

  return (
    <Modal open={!!contactId} onClose={onClose} width={620} ariaLabel="Chi tiết contact">
      <ModalHeader
        title={contact?.full_name ?? '...'}
        subtitle={
          contact
            ? `${contact.email ?? '—'} · ${contact.phone ?? '—'} / Nguồn: ${SOURCE_LABEL[contact.source]}`
            : undefined
        }
        onClose={onClose}
      />
      <ModalBody>
        {isLoading || !contact ? (
          <div className="py-12 grid place-items-center">
            <Spinner size={28} className="text-accent" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Thông tin lead */}
            <section>
              <div className="text-[10px] uppercase tracking-wider text-text3 mb-2">
                📌 Thông tin lead
              </div>
              <div className="bg-card2 rounded-r p-3 space-y-1.5 text-[12px]">
                <KvRow label="Ngày tạo lead" value={formatDateVN(contact.lead_date, { withYear: true })} />
                <KvRow
                  label="TV viên phụ trách"
                  value={<span className="text-accent font-medium">{contact.sale_owner_name}</span>}
                />
              </div>
            </section>

            {/* LTV — admin/founder only */}
            {isAdmin ? (
              <section>
                <div className="text-[10px] uppercase tracking-wider text-text3 mb-2">
                  🔒 Tổng tiền đã đóng (lifetime) · Phân loại khách hàng
                </div>
                <div className="bg-card2 rounded-r p-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] text-text2 mb-1">Lifetime value</div>
                    <div className="text-[24px] font-bold text-text leading-none mb-2">
                      {formatVND(contact.lifetime_value)}
                    </div>
                    <TierBadge tier={contact.tier} large />
                  </div>
                  <div className="text-[12px] text-text2 flex items-center">
                    {contact.course_history.length + 1} khóa (bao gồm khóa hiện tại) ·{' '}
                    {TIER_DESC[contact.tier]}
                  </div>
                </div>
              </section>
            ) : (
              <section>
                <div className="text-[10px] uppercase tracking-wider text-text3 mb-2">
                  🔒 Tổng tiền đã đóng (lifetime) · Phân loại khách hàng
                </div>
                <div className="bg-card2 rounded-r p-3 text-[12px] text-text3 italic">
                  🔒 Cần quyền admin để xem
                </div>
              </section>
            )}

            {/* Khóa đang học */}
            <section>
              <div className="text-[10px] uppercase tracking-wider text-text3 mb-2">
                📖 Khóa đang học
              </div>
              {contact.current_course ? (
                <div className="bg-card2 rounded-r p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-semibold text-text">{contact.current_course}</div>
                    <div className="text-[11px] text-text2 mt-0.5">
                      Đang học{contact.current_course_fee ? ` · Học phí ${formatVND(contact.current_course_fee)}` : ''}
                    </div>
                  </div>
                  <span
                    className={[
                      'inline-flex items-center px-2 py-0.5 rounded-r text-[11px] font-semibold',
                      paymentBadgeCls[contact.payment_status_class] ?? 'text-text3',
                    ].join(' ')}
                  >
                    {contact.payment_status_label}
                  </span>
                </div>
              ) : (
                <div className="text-[12px] text-text3 italic">Chưa đăng ký khóa nào.</div>
              )}
            </section>

            {/* Khóa đã học — admin/founder only */}
            {isAdmin && (
              <section>
                <div className="text-[10px] uppercase tracking-wider text-text3 mb-2">
                  🔒 Khóa đã học (lịch sử)
                </div>
                {contact.course_history.length === 0 ? (
                  <div className="text-[12px] text-text3 italic">Chưa có khóa nào trong quá khứ.</div>
                ) : (
                  <div className="space-y-1.5">
                    {contact.course_history.map((h, i) => (
                      <div
                        key={i}
                        className="bg-card2 rounded-r p-2.5 flex items-center justify-between text-[12px]"
                      >
                        <span className="text-text">{h.name}</span>
                        <span className="text-text2">{h.period} · {formatVND(h.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Ghi chú nội bộ */}
            {(isAdmin || contact.internal_note !== undefined) && (
              <section>
                <div className="text-[10px] uppercase tracking-wider text-text3 mb-2">
                  🔒 Ghi chú nội bộ
                </div>
                {contact.internal_note ? (
                  <div className="bg-amber/5 border border-amber/20 rounded-r p-3 text-[12px] text-text2 italic leading-snug">
                    {contact.internal_note}
                    {contact.internal_note_author && (
                      <div className="text-[10px] text-text3 mt-1.5 not-italic">
                        — {contact.internal_note_author}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[12px] text-text3 italic">Chưa có ghi chú.</div>
                )}
              </section>
            )}
          </div>
        )}
      </ModalBody>
    </Modal>
  )
}

const TIER_DESC: Record<string, string> = {
  diamond: 'VIP · 3+ khóa',
  gold: 'Khách thân thiết · 2 khóa',
  silver: 'Mới / 1 khóa',
  newbie: 'Chưa enroll',
}

function KvRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-text2 text-[11px] shrink-0">{label}</span>
      <span className="text-text text-right">{value}</span>
    </div>
  )
}
