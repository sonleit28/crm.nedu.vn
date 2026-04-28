import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { ContactDetail } from '@shared/types/domain'

export function useContact(id: string | null) {
  return useQuery<ContactDetail>({
    queryKey: ['contacts', id],
    queryFn: () => api.get<ContactDetail>(`/contacts/${id}`),
    enabled: !!id,
  })
}
