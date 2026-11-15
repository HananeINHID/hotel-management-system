import { useCallback, useEffect, useState } from 'react'
import { CalendarCheck, Check, Eye, Pencil, Plus, Search, Trash2, XCircle } from 'lucide-react'
import { reservationsApi } from '../api'
import { Alert } from '../components/common/Alert'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Pagination } from '../components/common/Pagination'
import ReservationDetailModal from '../components/reservations/ReservationDetailModal'
import ReservationFormModal from '../components/reservations/ReservationFormModal'
import StatutReservation from '../components/reservations/StatutReservation'
import { useToast } from '../hooks/useToast'
import {
  STATUTS_RESERVATION, formatJour, formatMAD, getList,
} from '../utils/reservations'

const PAGE_SIZE = 10

// Libellés des actions de confirmation
const ACTIONS = {
  confirmer: {
    titre: 'Confirmer la réservation', type: 'success', bouton: 'Confirmer',
    message: (r) => `Confirmer la réservation #${r.id_reservation} de ${r.client_nom} ? Les chambres seront verrouillées pour ces dates.`,
    succes: 'Réservation confirmée.',
  },
  annuler: {
    titre: 'Annuler la réservation', type: 'danger', bouton: "Annuler la réservation",
    message: (r) => `Annuler la réservation #${r.id_reservation} de ${r.client_nom} ? Les chambres redeviendront disponibles. Cette action est définitive.`,
    succes: 'Réservation annulée.',
  },
  supprimer: {
    titre: 'Supprimer la réservation', type: 'danger', bouton: 'Supprimer',
    message: (r) => `Supprimer définitivement la réservation #${r.id_reservation} ?`,
    succes: 'Réservation supprimée.',
  },
}

function ReservationsPage() {
  const toast = useToast()
  const [reservations, setReservations] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [recherche, setRecherche] = useState('')
  const [terme, setTerme] = useState('')
  const [statut, setStatut] = useState('')
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  const [formulaire, setFormulaire] = useState({ ouvert: false, reservation: null })
  const [detail, setDetail] = useState(null)
  const [action, setAction] = useState(null) // { nom, reservation }
  const [enCours, setEnCours] = useState(false)

  // Recherche différée pour ne pas appeler l'API à chaque frappe
  useEffect(() => {
    const t = setTimeout(() => { setTerme(recherche); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [recherche])

  const charger = useCallback(async () => {
    setChargement(true)
    setErreur('')
    try {
      const { data } = await reservationsApi.getAll({
        page, page_size: PAGE_SIZE,
        ...(terme ? { q: terme } : {}),
        ...(statut ? { statut_reservation: statut } : {}),
      })
      setReservations(getList(data))
      setCount(data.count ?? getList(data).length)
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }, [page, terme, statut])

  useEffect(() => { charger() }, [charger])

  const apresEnregistrement = (_data, edition) => {
    setFormulaire({ ouvert: false, reservation: null })
    toast.success(edition ? 'Réservation modifiée.' : 'Réservation créée.')
    charger()
  }

  const executerAction = async () => {
    const { nom, reservation } = action
    setEnCours(true)
    try {
      if (nom === 'supprimer') await reservationsApi.delete(reservation.id_reservation)
      else await reservationsApi[nom](reservation.id_reservation)
      toast.success(ACTIONS[nom].succes)
      setAction(null)
      charger()
    } catch (err) {
      toast.error(err.message)
      setAction(null)
    } finally {
      setEnCours(false)
    }
  }

  const btn = 'rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30'

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-[#1d9a8a]" />
            <h1 className="text-2xl font-bold text-slate-800">Réservations</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Une réservation peut regrouper plusieurs chambres, chacune avec ses propres dates.
          </p>
        </div>
        <button type="button" onClick={() => setFormulaire({ ouvert: true, reservation: null })}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#1d9a8a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#167d70]">
          <Plus className="h-4 w-4" /> Nouvelle réservation
        </button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input value={recherche} onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher par client ou numéro de chambre"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm" />
        </div>
        <select value={statut} onChange={(e) => { setStatut(e.target.value); setPage(1) }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUTS_RESERVATION).map(([cle, s]) => (
            <option key={cle} value={cle}>{s.label}</option>
          ))}
        </select>
      </div>

      {erreur && <Alert type="error" message={erreur} onClose={() => setErreur('')} />}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {chargement ? (
          <div className="p-10"><LoadingSpinner /></div>
        ) : reservations.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Aucune réservation trouvée. Créez-en une avec « Nouvelle réservation ».
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3">N°</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Chambres</th>
                  <th className="px-4 py-3">Période</th>
                  <th className="px-4 py-3 text-right">Montant estimé</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((r) => (
                  <tr key={r.id_reservation} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-800">#{r.id_reservation}</td>
                    <td className="px-4 py-3">
                      {r.client_nom}
                      <span className="block text-xs text-slate-400">{r.nb_personnes_total} personne(s)</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.chambres.map((c) => c.numero_chambre).join(', ')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatJour(r.date_arrivee)} → {formatJour(r.date_depart)}
                    </td>
                    <td className="px-4 py-3 text-right">{formatMAD(r.montant_estime)}</td>
                    <td className="px-4 py-3"><StatutReservation statut={r.statut_reservation} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button type="button" className={btn} title="Détails" onClick={() => setDetail(r)}>
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" className={btn} title="Modifier" disabled={!r.modifiable}
                          onClick={() => setFormulaire({ ouvert: true, reservation: r })}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" className={btn} title="Confirmer"
                          disabled={r.statut_reservation !== 'EN_ATTENTE'}
                          onClick={() => setAction({ nom: 'confirmer', reservation: r })}>
                          <Check className="h-4 w-4" />
                        </button>
                        <button type="button" className={btn} title="Annuler"
                          disabled={!['EN_ATTENTE', 'CONFIRMEE'].includes(r.statut_reservation)}
                          onClick={() => setAction({ nom: 'annuler', reservation: r })}>
                          <XCircle className="h-4 w-4" />
                        </button>
                        <button type="button" className={btn} title="Supprimer"
                          disabled={['CONFIRMEE', 'TERMINEE'].includes(r.statut_reservation)}
                          onClick={() => setAction({ nom: 'supprimer', reservation: r })}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination count={count} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} />
      </div>

      <ReservationFormModal isOpen={formulaire.ouvert} reservation={formulaire.reservation}
        onClose={() => setFormulaire({ ouvert: false, reservation: null })}
        onSaved={apresEnregistrement} />

      <ReservationDetailModal reservation={detail} onClose={() => setDetail(null)} />

      <ConfirmDialog isOpen={Boolean(action)} onClose={() => setAction(null)} onConfirm={executerAction}
        isLoading={enCours}
        title={action ? ACTIONS[action.nom].titre : ''}
        type={action ? ACTIONS[action.nom].type : 'warning'}
        confirmText={action ? ACTIONS[action.nom].bouton : 'Confirmer'}
        cancelText="Retour"
        message={action ? ACTIONS[action.nom].message(action.reservation) : ''} />
    </div>
  )
}

export default ReservationsPage
