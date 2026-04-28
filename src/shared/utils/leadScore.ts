import type { LeadScoreBucket } from '@shared/types/domain'

export interface LeadScoreInfo {
  bucket: LeadScoreBucket
  label: string
  icon: string
}

export function getLeadScoreBucket(score: number): LeadScoreInfo {
  if (score >= 70) return { bucket: 'hot', label: 'HOT', icon: '🔥' }
  if (score >= 40) return { bucket: 'warm', label: 'WARM', icon: '🌤' }
  return { bucket: 'cold', label: 'COLD', icon: '❄' }
}
