import { useState } from 'react'
import { useFunnel } from '../hooks/useFunnel'
import { useLeadSourceStats } from '../hooks/useLeadSourceStats'
import { useConsultantKpi } from '../hooks/useConsultantKpi'
import { ConversionFunnelTable } from './ConversionFunnelTable'
import { LeadSourceTable } from './LeadSourceTable'
import { ConsultantKpiTable } from './ConsultantKpiTable'

const TABS = [
  { key: 'funnel', label: 'Conversion Funnel' },
  { key: 'source', label: 'Nguồn Lead' },
  { key: 'kpi', label: 'TV viên KPI' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function AnalyticsTabs() {
  const [tab, setTab] = useState<TabKey>('funnel')

  const { data: funnel, isLoading: loadingFunnel } = useFunnel()
  const { data: sources, isLoading: loadingSources } = useLeadSourceStats()
  const { data: kpi, isLoading: loadingKpi } = useConsultantKpi()

  return (
    <div className="bg-card border border-border rounded-r2 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={[
              'px-5 py-3 text-[13px] font-medium transition-colors border-b-2 -mb-px',
              tab === t.key
                ? 'border-accent text-accent'
                : 'border-transparent text-text2 hover:text-text',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'funnel' && (
          <ConversionFunnelTable rows={funnel ?? []} isLoading={loadingFunnel} />
        )}
        {tab === 'source' && (
          <LeadSourceTable rows={sources ?? []} isLoading={loadingSources} />
        )}
        {tab === 'kpi' && (
          <ConsultantKpiTable rows={kpi ?? []} isLoading={loadingKpi} />
        )}
      </div>
    </div>
  )
}
