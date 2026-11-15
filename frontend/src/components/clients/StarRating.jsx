import React from 'react'
import { Star } from 'lucide-react'

/** Affichage (lecture seule) ou saisie (si onChange fourni) d'une note de 1 à 5. */
export function StarRating({ value = 0, onChange, size = 'w-4 h-4' }) {
  return (
    <div className="inline-flex items-center gap-0.5" role={onChange ? 'radiogroup' : 'img'} aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value
        const icon = (
          <Star className={`${size} ${filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
        )
        return onChange ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="p-0.5 rounded hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40"
            title={`${n} / 5`}
            role="radio"
            aria-checked={n === value}
          >
            {icon}
          </button>
        ) : (
          <span key={n}>{icon}</span>
        )
      })}
    </div>
  )
}
