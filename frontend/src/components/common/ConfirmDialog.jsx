import React from 'react'
import { Modal } from './Modal'
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react'

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation requise',
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  isLoading = false,
}) {
  const typeConfig = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-rose-600 bg-rose-100',
      btnColor: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-600 bg-amber-100',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-emerald-600 bg-emerald-100',
      btnColor: 'bg-[#1d9a8a] hover:bg-[#167d70] text-white',
    },
    info: {
      icon: HelpCircle,
      iconColor: 'text-sky-600 bg-sky-100',
      btnColor: 'bg-sky-600 hover:bg-sky-700 text-white',
    },
  }

  const current = typeConfig[type] || typeConfig.warning
  const Icon = current.icon

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-3 rounded-full shrink-0 ${current.iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-slate-600 text-sm leading-relaxed mt-1">
          {message}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2 ${current.btnColor}`}
        >
          {isLoading && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}
