import React, { useEffect, useState } from 'react'
import { MessageSquare, ClipboardList } from 'lucide-react'
import { clientsApi } from '../../api'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Alert } from '../common/Alert'
import { StarRating } from './StarRating'
import { formatDate, formatMoney } from '../../utils/formatters'

export function ClientHistoryModal({ clientId, onClose }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!clientId) return
    setData(null)
    setError(null)
    clientsApi
      .getHistorique(clientId)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
  }, [clientId])

  const c = data?.client

  return (
    <Modal
      isOpen={Boolean(clientId)}
      onClose={onClose}
      title={c ? `Historique de ${c.nom_complet}` : 'Historique du client'}
      maxWidth="max-w-2xl"
    >
      {error && <Alert type="error" message={error} />}
      {!data && !error && <LoadingSpinner text="Chargement de l'historique..." />}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <Info label="Pièce d'identité" value={c.piece_identite} />
            <Info label="Téléphone" value={c.telephone || '—'} />
            <Info label="Email" value={c.email || '—'} />
            <Info label="Nationalité" value={c.nationalite || '—'} />
          </div>

          <section>
            <h4 className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
              <ClipboardList className="w-4 h-4 text-[#1d9a8a]" /> Réservations
            </h4>
            {data.reservations.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune réservation enregistrée pour ce client.</p>
            ) : (
              <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl text-sm">
                {data.reservations.map((r) => (
                  <li key={r.id_reservation} className="flex justify-between gap-3 p-3">
                    <span>
                      Réservation n°{r.id_reservation} — {formatDate(r.date_reservation)}
                    </span>
                    <span className="text-slate-500">
                      {r.statut_reservation || '—'}
                      {r.montant_estime != null && ` · ${formatMoney(r.montant_estime)}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h4 className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
              <MessageSquare className="w-4 h-4 text-[#1d9a8a]" /> Avis déposés
              {data.note_moyenne != null && (
                <span className="ml-auto text-xs font-medium text-slate-500">
                  moyenne {data.note_moyenne} / 5 ({data.nb_avis} avis)
                </span>
              )}
            </h4>
            {data.avis.length === 0 ? (
              <p className="text-sm text-slate-500">Ce client n'a laissé aucun avis.</p>
            ) : (
              <ul className="space-y-2">
                {data.avis.map((a) => (
                  <li key={a.id_avis} className="p-3 border border-slate-200 rounded-xl text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <StarRating value={a.note} />
                      <span className="text-xs text-slate-500">
                        Séjour n°{a.sejour} · {formatDate(a.date_avis)}
                      </span>
                    </div>
                    {a.commentaire && <p className="mt-1.5 text-slate-700">{a.commentaire}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Modal>
  )
}

function Info({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium text-slate-800 break-words">{value}</div>
    </div>
  )
}
