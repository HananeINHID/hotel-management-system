import { useEffect, useState } from 'react'
import { Search, UserRound, X } from 'lucide-react'
import { clientsApi } from '../../api'
import { getList } from '../../utils/reservations'

// Recherche d'un client par nom, prénom ou pièce d'identité
export default function ClientPicker({ value, onChange, disabled }) {
  const [terme, setTerme] = useState('')
  const [resultats, setResultats] = useState([])
  const [ouvert, setOuvert] = useState(false)

  useEffect(() => {
    if (!ouvert) return undefined
    const t = setTimeout(async () => {
      try {
        const { data } = await clientsApi.getAll({ search: terme, page_size: 8 })
        setResultats(getList(data))
      } catch {
        setResultats([])
      }
    }, 250)
    return () => clearTimeout(t)
  }, [terme, ouvert])

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
        <span className="flex items-center gap-2 text-slate-800">
          <UserRound className="h-4 w-4 text-[#1d9a8a]" />
          {value.nom} {value.prenom}
          <span className="text-slate-400">{value.piece_identite}</span>
        </span>
        {!disabled && (
          <button type="button" onClick={() => onChange(null)} aria-label="Changer de client"
            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
      <input
        value={terme}
        onChange={(e) => setTerme(e.target.value)}
        onFocus={() => setOuvert(true)}
        placeholder="Rechercher un client (nom, prénom, pièce d'identité)"
        className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm"
      />
      {ouvert && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {resultats.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">Aucun client trouvé.</li>
          )}
          {resultats.map((c) => (
            <li key={c.id_client}>
              <button type="button"
                onClick={() => { onChange(c); setOuvert(false); setTerme('') }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50">
                <span>{c.nom} {c.prenom}</span>
                <span className="text-xs text-slate-400">{c.piece_identite}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
