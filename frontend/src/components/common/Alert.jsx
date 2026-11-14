import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

export function Alert({ type = 'error', message, title, onClose, className = '' }) {
  if (!message) return null

  const configs = {
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: AlertCircle,
      iconColor: 'text-rose-600',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    info: {
      bg: 'bg-sky-50 border-sky-200 text-sky-900',
      icon: Info,
      iconColor: 'text-sky-600',
    },
  }

  const config = configs[type] || configs.error
  const Icon = config.icon

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${config.bg} ${className}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 text-sm">
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="leading-relaxed">{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="opacity-60 hover:opacity-100 p-0.5 rounded transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
