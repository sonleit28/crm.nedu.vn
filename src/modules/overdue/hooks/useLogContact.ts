import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'

export function useLogContact(paymentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (note?: string) =>
      api.post(`/payments/${paymentId}/contact`, { note }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['overdue'] })
    },
  })
}
