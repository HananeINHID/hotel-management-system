import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, Edit2, Trash2, MessageSquare, Star } from 'lucide-react'
import { avisApi, clientsApi } from '../api'
import { useToast } from '../hooks/useToast'
import { formatDate } from '../utils/formatters'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Pagination } from '../components/common/Pagination'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Alert } from '../components/common/Alert'
import { StarRating } from '../components/clients/StarRating'

const today = () => new Date().toISOString().slice(0, 10)
const EMPTY = { client: '', sejour: '', note: 5, date_avis: today(), commentaire: '' }
const INPUT = 'w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]'
const LABEL = 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1'

function AvisPage() {
  const toast = useToast()
  const [avis, setAvis] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [clients, setClients] = useState([])

  const [searchQuery, setSearchQuery] = useState('')
  const [noteFilter, setNoteFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAvis, setEditingAvis] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, avis: null, isDeleting: false })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY })
  const noteValue = watch('note')

  const loadStats = useCallback(async () => {
    try {
      const res = await avisApi.getStatistiques()
      setStats(res.data)
    } catch {
      setStats(null)
    }
  }, [])

  const loadAvis = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const params = { page: currentPage }
      if (searchQuery.trim()) params.search = searchQuery.trim()
      if (noteFilter) params.note = noteFilter
      if (clientFilter) params.client = clientFilter
      const res = await avisApi.getAll(params)
      if (res.data?.results) {
        setAvis(res.data.results)
        setTotalCount(res.data.count)
      } else if (Array.isArray(res.data)) {
        setAvis(res.data)
        setTotalCount(res.data.length)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery, noteFilter, clientFilter])

  useEffect(() => {
    const t = setTimeout(loadAvis, 250)
    return () => clearTimeout(t)
  }, [loadAvis])

  useEffect(() => {
    loadStats()
    clientsApi
      .getAll({ page_size: 100 })
      .then((res) => setClients(res.data?.results ?? res.data ?? []))
      .catch(() => {})
  }, [loadStats])

  const handleOpenCreate = () => {
    setEditingAvis(null)
    reset({ ...EMPTY, date_avis: today() })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (a) => {
    setEditingAvis(a)
    reset({
      client: String(a.client),
      sejour: String(a.sejour),
      note: a.note,
      date_avis: a.date_avis,
      commentaire: a.commentaire || '',
    })
    setIsModalOpen(true)
  }

  const refresh = () => {
    loadAvis()
    loadStats()
  }

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      client: Number(data.client),
      sejour: Number(data.sejour),
      note: Number(data.note),
    }
    try {
      if (editingAvis) {
        await avisApi.update(editingAvis.id_avis, payload)
        toast.success('Avis mis à jour.')
      } else {
        await avisApi.create(payload)
        toast.success('Avis enregistré.')
      }
      setIsModalOpen(false)
      refresh()
    } catch (err) {
      toast.error(err.message) // ex. « séjour non terminé », « un seul avis par séjour »
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.avis) return
    try {
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }))
      await avisApi.delete(deleteConfirm.avis.id_avis)
      toast.success('Avis supprimé.')
      setDeleteConfirm({ isOpen: false, avis: null, isDeleting: false })
      refresh()
    } catch (err) {
      toast.error(err.message)
      setDeleteConfirm({ isOpen: false, avis: null, isDeleting: false })
    }
  }

  const maxRep = stats ? Math.max(1, ...Object.values(stats.repartition)) : 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#1d9a8a]" />
            <h1 className="text-2xl font-bold text-slate-800">Avis clients</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Un avis est lié à un séjour terminé, rédigé par le client concerné (un seul avis par séjour).
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1d9a8a] hover:bg-[#167d70] text-white font-medium rounded-xl shadow-sm transition-colors text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouvel avis
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {stats && stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <Star className="w-9 h-9 fill-amber-400 text-amber-400 shrink-0" />
            <div>
              <div className="text-3xl font-bold text-slate-800">{stats.note_moyenne} / 5</div>
              <div className="text-sm text-slate-500">Note moyenne sur {stats.total} avis</div>
            </div>
          </div>
          <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
            {[5, 4, 3, 2, 1].map((n) => (
              <div key={n} className="flex items-center gap-3 text-xs text-slate-600">
                <span className="w-10">{n} ★</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(stats.repartition[String(n)] / maxRep) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right">{stats.repartition[String(n)]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher dans les commentaires ou par client..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
          />
        </div>
        <select
          value={clientFilter}
          onChange={(e) => {
            setClientFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="md:w-56 py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20"
          aria-label="Filtrer par client"
        >
          <option value="">Tous les clients</option>
          {clients.map((c) => (
            <option key={c.id_client} value={c.id_client}>
              {c.nom_complet}
            </option>
          ))}
        </select>
        <select
          value={noteFilter}
          onChange={(e) => {
            setNoteFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="md:w-44 py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20"
          aria-label="Filtrer par note"
        >
          <option value="">Toutes les notes</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} étoile{n > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner full text="Chargement des avis..." />
        ) : avis.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">Aucun avis trouvé</p>
            <p className="text-sm mt-1">Modifiez vos filtres ou enregistrez un premier avis.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Note</th>
                  <th className="py-3.5 px-4">Commentaire</th>
                  <th className="py-3.5 px-4">Séjour</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {avis.map((a) => (
                  <tr key={a.id_avis} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">{a.client_nom}</td>
                    <td className="py-3.5 px-4">
                      <StarRating value={a.note} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{a.commentaire || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600">n°{a.sejour}</td>
                    <td className="py-3.5 px-4 text-slate-600">{formatDate(a.date_avis)}</td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(a)}
                        className="p-1.5 text-slate-500 hover:text-[#1d9a8a] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Modifier l'avis"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ isOpen: true, avis: a, isDeleting: false })}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Supprimer l'avis"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination count={totalCount} pageSize={pageSize} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAvis ? "Modifier l'avis" : 'Enregistrer un avis'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Client *</label>
              <select {...register('client', { required: 'Choisissez un client' })} className={INPUT}>
                <option value="">Choisir un client</option>
                {clients.map((c) => (
                  <option key={c.id_client} value={c.id_client}>
                    {c.nom_complet}
                  </option>
                ))}
              </select>
              {errors.client && <span className="text-xs text-rose-600 mt-1">{errors.client.message}</span>}
            </div>
            <div>
              <label className={LABEL}>N° du séjour (terminé) *</label>
              <input
                type="number"
                min="1"
                {...register('sejour', { required: 'Le séjour est obligatoire' })}
                className={INPUT}
              />
              {errors.sejour && <span className="text-xs text-rose-600 mt-1">{errors.sejour.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Note *</label>
              <StarRating
                value={Number(noteValue)}
                onChange={(n) => setValue('note', n)}
                size="w-7 h-7"
              />
            </div>
            <div>
              <label className={LABEL}>Date de l'avis *</label>
              <input type="date" {...register('date_avis', { required: 'La date est obligatoire' })} className={INPUT} />
            </div>
          </div>

          <div>
            <label className={LABEL}>Commentaire</label>
            <textarea
              rows={3}
              {...register('commentaire')}
              placeholder="Ce que le client a pensé de son séjour..."
              className={INPUT}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium bg-[#1d9a8a] hover:bg-[#167d70] text-white rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {editingAvis ? 'Enregistrer les modifications' : "Enregistrer l'avis"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, avis: null, isDeleting: false })}
        onConfirm={confirmDelete}
        title="Supprimer cet avis ?"
        message={`Voulez-vous vraiment supprimer l'avis de ${deleteConfirm.avis?.client_nom} ? Cette action est irréversible.`}
        confirmText="Confirmer la suppression"
        type="danger"
        isLoading={deleteConfirm.isDeleting}
      />
    </div>
  )
}

export default AvisPage
