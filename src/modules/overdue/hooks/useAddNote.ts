import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'

export function useAddNote(paymentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (note: string) =>
      api.post(`/payments/${paymentId}/note`, { note }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['overdue'] })
    },
  })
}
