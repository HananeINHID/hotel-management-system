
import { useCallback, useEffect, useState } from 'react'
import {
  Archive,
  CalendarDays,
  CheckCircle,
  Clock,
  LogIn,
  LogOut,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { sejoursApi } from '../api'
import { Alert } from '../components/common/Alert'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useToast } from '../hooks/useToast'

const PAGE_SIZE = 10

const STATUTS = {
  EN_COURS: {
    label: 'En cours',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  TERMINE: {
    label: 'Terminé',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  ANNULE: {
    label: 'Annulé',
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
  },
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function getList(data) {
  if (Array.isArray(data)) return data
  return data?.results || data?.data || []
}

function CheckInModal({ reservations, onClose, onConfirm, loading }) {
  const [selected, setSelected] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (selected) onConfirm(selected)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Effectuer un check-in
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Sélectionnez une chambre associée à une réservation confirmée.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {reservations.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-600">
            Aucune réservation confirmée disponible pour le check-in.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Réservation et chambre
              </span>
              <select
                required
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm"
              >
                <option value="">Choisir une chambre</option>
                {reservations.map((item) => {
                  const id = item.id_reservation_chambre ??
                    item.id_reservationchambre ??
                    item.id

                  const reservationId =
                    item.id_reservation ??
                    item.reservation?.id_reservation ??
                    item.reservation

                  const chambre =
                    item.numero_chambre ??
                    item.chambre?.numero_chambre ??
                    item.chambre?.id_chambre ??
                    item.id_chambre ??
                    'Chambre'

                  return (
                    <option key={id} value={id}>
                      Réservation #{reservationId} — Chambre {chambre}
                      {' — '}
                      {formatDate(item.date_arrivee_prevue)}
                      {' au '}
                      {formatDate(item.date_depart_prevue)}
                    </option>
                  )
                })}
              </select>
            </label>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!selected || loading}
                className="flex items-center gap-2 rounded-lg bg-[#1d9a8a] px-4 py-2 text-sm font-medium text-white hover:bg-[#167d70] disabled:opacity-50"
              >
                <LogIn className="h-4 w-4" />
                {loading ? 'Enregistrement…' : 'Confirmer le check-in'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function SejoursPage() {
  const toast = useToast()

  const [sejours, setSejours] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [reservations, setReservations] = useState([])

  const [currentPage, setCurrentPage] = useState(1)
  const [filterStatut, setFilterStatut] = useState('')
  const [filterArchive, setFilterArchive] = useState('')
  const [search, setSearch] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [isActionRunning, setIsActionRunning] = useState(false)

  const loadSejours = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const params = {
        page: currentPage,
        page_size: PAGE_SIZE,
      }

      if (filterStatut) params.statut_sejour = filterStatut
      if (filterArchive !== '') params.est_archive = filterArchive
      if (search.trim()) params.search = search.trim()

      const response = await sejoursApi.getAll(params)
      const data = response.data

      setSejours(getList(data))
      setTotalCount(Array.isArray(data) ? data.length : (data?.count || 0))
    } catch (err) {
      setError(err.message || 'Impossible de charger les séjours.')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, filterStatut, filterArchive, search])

  useEffect(() => {
    loadSejours()
  }, [loadSejours])

  const openCheckIn = async () => {
    setIsSaving(true)
    try {
      const response = await sejoursApi.getArrivees()
      setReservations(getList(response.data))
      setShowCheckIn(true)
    } catch (err) {
      toast.error(err.message || 'Impossible de charger les réservations.')
    } finally {
      setIsSaving(false)
    }
  }

  const confirmCheckIn = async (reservationChambreId) => {
    setIsSaving(true)
    try {
      await sejoursApi.checkIn({
        reservation_chambre: reservationChambreId,
      })

      toast.success('Check-in effectué avec succès.')
      setShowCheckIn(false)
      setCurrentPage(1)
      await loadSejours()
    } catch (err) {
      toast.error(err.message || 'Le check-in a échoué.')
    } finally {
      setIsSaving(false)
    }
  }

  const executeAction = async () => {
    if (!pendingAction) return

    setIsActionRunning(true)

    try {
      const { sejour, kind } = pendingAction

      if (kind === 'check-out') {
        await sejoursApi.checkOut(sejour.id_sejour)
        toast.success('Check-out effectué avec succès.')
      }

      if (kind === 'archive') {
        await sejoursApi.archive(sejour.id_sejour)
        toast.success('Séjour archivé avec succès.')
      }

      if (kind === 'unarchive') {
        await sejoursApi.unarchive(sejour.id_sejour)
        toast.success('Séjour désarchivé avec succès.')
      }

      setPendingAction(null)
      await loadSejours()
    } catch (err) {
      toast.error(err.message || 'Une erreur est survenue.')
    } finally {
      setIsActionRunning(false)
    }
  }

  const actionConfig = {
    'check-out': {
      title: 'Confirmer le check-out',
      message: (sejour) =>
        `Enregistrer le départ réel du séjour #${sejour.id_sejour} maintenant ?`,
      confirmText: 'Confirmer le départ',
      type: 'warning',
    },
    archive: {
      title: 'Archiver le séjour',
      message: (sejour) =>
        `Voulez-vous archiver le séjour terminé #${sejour.id_sejour} ?`,
      confirmText: 'Archiver',
      type: 'info',
    },
    unarchive: {
      title: 'Désarchiver le séjour',
      message: (sejour) =>
        `Voulez-vous restaurer le séjour #${sejour.id_sejour} ?`,
      confirmText: 'Désarchiver',
      type: 'success',
    },
  }

  const confirmation = pendingAction
    ? actionConfig[pendingAction.kind]
    : null

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-[#1d9a8a]" />
            <h1 className="text-2xl font-bold text-slate-800">
              Gestion des séjours
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Gérez les arrivées, les départs et l'archivage des séjours.
          </p>
        </div>

        <button
          type="button"
          onClick={openCheckIn}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#1d9a8a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#167d70] disabled:opacity-50"
        >
          <LogIn className="h-4 w-4" />
          Effectuer un check-in
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            Séjours en cours
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {sejours.filter((s) => s.statut_sejour === 'EN_COURS' && !s.est_archive).length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CheckCircle className="h-4 w-4" />
            Séjours terminés
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-700">
            {sejours.filter((s) => s.statut_sejour === 'TERMINE').length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Archive className="h-4 w-4" />
            Séjours archivés
          </div>
          <p className="mt-2 text-2xl font-bold text-violet-700">
            {sejours.filter((s) => s.est_archive).length}
          </p>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          title="Chargement impossible"
          message={error}
          onClose={() => setError('')}
        />
      )}

      <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-medium text-slate-500">
            Rechercher
          </span>
          <div className="flex items-center rounded-lg border border-slate-200 px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setCurrentPage(1)
              }}
              placeholder="Rechercher un séjour..."
              className="w-full border-0 px-2 py-2 text-sm outline-none"
            />
          </div>
        </label>

        <label className="flex-1">
          <span className="mb-1 block text-xs font-medium text-slate-500">
            Statut
          </span>
          <select
            value={filterStatut}
            onChange={(event) => {
              setFilterStatut(event.target.value)
              setCurrentPage(1)
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUTS).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex-1">
          <span className="mb-1 block text-xs font-medium text-slate-500">
            Archivage
          </span>
          <select
            value={filterArchive}
            onChange={(event) => {
              setFilterArchive(event.target.value)
              setCurrentPage(1)
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Archivés et actifs</option>
            <option value="false">Non archivés</option>
            <option value="true">Archivés</option>
          </select>
        </label>

        <button
          type="button"
          onClick={loadSejours}
          disabled={isLoading}
          className="mt-auto flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </section>

      {isLoading ? (
        <div className="flex justify-center rounded-xl border border-slate-200 bg-white py-16">
          <LoadingSpinner />
        </div>
      ) : sejours.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h2 className="font-semibold text-slate-700">
            Aucun séjour à afficher
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Aucun séjour ne correspond aux filtres sélectionnés.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Séjour</th>
                  <th className="px-5 py-3 font-semibold">Réservation</th>
                  <th className="px-5 py-3 font-semibold">Chambre</th>
                  <th className="px-5 py-3 font-semibold">Arrivée prévue</th>
                  <th className="px-5 py-3 font-semibold">Départ prévu</th>
                  <th className="px-5 py-3 font-semibold">Arrivée réelle</th>
                  <th className="px-5 py-3 font-semibold">Départ réel</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sejours.map((sejour) => {
                  const status = STATUTS[sejour.statut_sejour] || {
                    label: sejour.statut_sejour || 'Inconnu',
                    classes: 'bg-slate-100 text-slate-700 border-slate-200',
                  }

                  const reservationId =
                    sejour.id_reservation ??
                    sejour.reservation?.id_reservation ??
                    sejour.reservation

                  const chambre =
                    sejour.numero_chambre ??
                    sejour.chambre?.numero_chambre ??
                    sejour.chambre?.id_chambre ??
                    sejour.id_chambre ??
                    '—'

                  return (
                    <tr key={sejour.id_sejour} className="hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                        #{sejour.id_sejour}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {reservationId ? `#${reservationId}` : '—'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {chambre}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDate(sejour.date_arrivee_prevue)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDate(sejour.date_depart_prevue)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDate(sejour.arrivee_reelle)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDate(sejour.depart_reel)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${status.classes}`}>
                            {status.label}
                          </span>
                          {sejour.est_archive && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-700">
                              <Archive className="h-3 w-3" />
                              Archivé
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {sejour.statut_sejour === 'EN_COURS' && !sejour.est_archive && (
                            <button
                              type="button"
                              onClick={() => setPendingAction({ sejour, kind: 'check-out' })}
                              title="Enregistrer le check-out"
                              className="rounded-lg p-2 text-amber-700 hover:bg-amber-50"
                            >
                              <LogOut className="h-4 w-4" />
                            </button>
                          )}

                          {sejour.statut_sejour === 'TERMINE' && !sejour.est_archive && (
                            <button
                              type="button"
                              onClick={() => setPendingAction({ sejour, kind: 'archive' })}
                              title="Archiver"
                              className="rounded-lg p-2 text-violet-700 hover:bg-violet-50"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          )}

                          {sejour.est_archive && (
                            <button
                              type="button"
                              onClick={() => setPendingAction({ sejour, kind: 'unarchive' })}
                              title="Désarchiver"
                              className="rounded-lg p-2 text-sky-700 hover:bg-sky-50"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}

                          <Link
                            to={`/sejours/${sejour.id_sejour}/finance`}
                            title="Voir le résumé financier"
                            className="rounded-lg p-2 text-[#1d9a8a] hover:bg-teal-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">
              {totalCount} séjour(s) au total
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Précédent
              </button>
              <span className="text-sm text-slate-600">
                Page {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckIn && (
        <CheckInModal
          reservations={reservations}
          onClose={() => !isSaving && setShowCheckIn(false)}
          onConfirm={confirmCheckIn}
          loading={isSaving}
        />
      )}

      {confirmation && pendingAction && (
        <ConfirmDialog
          isOpen={Boolean(pendingAction)}
          onClose={() => !isActionRunning && setPendingAction(null)}
          onConfirm={executeAction}
          title={confirmation.title}
          message={confirmation.message(pendingAction.sejour)}
          confirmText={confirmation.confirmText}
          type={confirmation.type}
          isLoading={isActionRunning}
        />
      )}
    </div>
  )
}

export default SejoursPage
