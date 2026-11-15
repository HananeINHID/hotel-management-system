import { STATUTS_RESERVATION } from '../../utils/reservations'

export default function StatutReservation({ statut }) {
  const config = STATUTS_RESERVATION[statut] || {
    label: statut || '—', classes: 'bg-slate-100 text-slate-700 border-slate-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${config.classes}`}>
      {config.label}
    </span>
  )
}
