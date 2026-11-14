import React from 'react'
import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ text = 'Chargement en cours...', size = 'md', full = false }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-slate-500">
      <Loader2 className={`animate-spin text-[#1d9a8a] ${sizeClasses[size] || sizeClasses.md}`} />
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  )

  if (full) {
    return <div className="min-h-[300px] flex items-center justify-center">{content}</div>
  }

  return content
}
