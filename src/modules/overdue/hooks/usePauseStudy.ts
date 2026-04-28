import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'

export function usePauseStudy(paymentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reason: string) =>
      api.post(`/payments/${paymentId}/pause`, { reason }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['overdue'] })
    },
  })
}
