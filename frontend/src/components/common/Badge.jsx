import React from 'react'
import {
  STATUT_PAIEMENT_CONFIG,
  STATUT_EMPLOYE_CONFIG,
} from '../../utils/formatters'

export function StatusBadge({ status, type = 'paiement' }) {
  const config =
    type === 'paiement'
      ? STATUT_PAIEMENT_CONFIG[status]
      : STATUT_EMPLOYE_CONFIG[status]

  if (!config) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
        {status || '—'}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
