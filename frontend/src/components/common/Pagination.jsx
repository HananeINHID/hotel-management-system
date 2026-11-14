import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ count, pageSize = 10, currentPage = 1, onPageChange }) {
  const totalPages = Math.ceil((count || 0) / pageSize)

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200 rounded-b-xl text-sm text-slate-600">
      <div>
        Affichage de{' '}
        <span className="font-semibold text-slate-800">
          {(currentPage - 1) * pageSize + 1}
        </span>{' '}
        à{' '}
        <span className="font-semibold text-slate-800">
          {Math.min(currentPage * pageSize, count)}
        </span>{' '}
        sur <span className="font-semibold text-slate-800">{count}</span> résultats
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 font-medium bg-slate-100 rounded-lg text-slate-700">
          Page {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
