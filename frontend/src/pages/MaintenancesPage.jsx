import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import {
  Wrench, Plus, Search, Eye, Edit2, Trash2, AlertTriangle,
  CheckCircle2, Clock, XCircle, Filter, X, RefreshCw,
  DollarSign, Calendar, User, BedDouble, ChevronRight,
} from 'lucide-react'
import { maintenancesAPI, chambresAPI } from '../services/chambresMaintenances'
import { employesApi } from '../api'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Alert } from '../components/common/Alert'
import { Pagination } from '../components/common/Pagination'
import { useToast } from '../hooks/useToast'
import { formatDate, formatMoney } from '../utils/formatters'
import {
  STATUT_MAINTENANCE_CONFIG,
  TYPE_MAINTENANCE_LABELS,
} from '../utils/chambresFormatters'

// ─── Badge statut ──────────────────────────────────────────────────────
function StatutBadge({ statut }) {
  const cfg = STATUT_MAINTENANCE_CONFIG[statut] || {
    label: statut, bg: 'bg-gray-100 text-gray-700 border-gray-300', dot: 'bg-gray-400',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── Alerte bloquante ─────────────────────────────────────────────────
function BloquanteAlert() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold">
      <AlertTriangle className="w-3 h-3" /> Bloquante
    </span>
  )
}

// ─── Formulaire Maintenance ───────────────────────────────────────────
function MaintenanceForm({ initial, chambres, employes, onSave, onCancel, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initial
      ? {
          ...initial,
          debut: initial.debut ? initial.debut.slice(0, 16) : '',
          fin: initial.fin ? initial.fin.slice(0, 16) : '',
          cout: initial.cout || '0.00',
        }
      : {
          chambre: '',
          employe: '',
          debut: '',
          fin: '',
          type: 'corrective',
          description: '',
          cout: '0.00',
          statut: 'planifiee',
          bloquante: true,
        }
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Chambre *</label>
          <select {...register('chambre', { required: 'Requis' })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 bg-white">
            <option value="">Sélectionner…</option>
            {chambres.map((c) => (
              <option key={c.id_chambre} value={c.id_chambre}>
                Chambre {c.numero_chambre} — Étage {c.etage}
              </option>
            ))}
          </select>
          {errors.chambre && <p className="text-rose-500 text-xs mt-1">{errors.chambre.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Employé *</label>
          <select {...register('employe', { required: 'Requis' })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 bg-white">
            <option value="">Sélectionner…</option>
            {employes.map((e) => (
              <option key={e.id_employe} value={e.id_employe}>
                {e.nom} {e.prenom} — {e.poste_display || e.poste}
              </option>
            ))}
          </select>
          {errors.employe && <p className="text-rose-500 text-xs mt-1">{errors.employe.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
          <select {...register('type', { required: 'Requis' })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 bg-white">
            {Object.entries(TYPE_MAINTENANCE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
          <select {...register('statut')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 bg-white">
            {Object.entries(STATUT_MAINTENANCE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date de début *</label>
          <input type="datetime-local" {...register('debut', { required: 'Requis' })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40" />
          {errors.debut && <p className="text-rose-500 text-xs mt-1">{errors.debut.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin prévue</label>
          <input type="datetime-local" {...register('fin')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
        <textarea rows={3} {...register('description', { required: 'Requis' })}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 resize-none" />
        {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description.message}</p>}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Coût (MAD)</label>
          <input type="number" step="0.01" min="0" {...register('cout')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40" />
        </div>
        <div className="flex items-center gap-2 mt-5">
          <input type="checkbox" id="bloquante" {...register('bloquante')}
            className="w-4 h-4 accent-[#1d9a8a]" />
          <label htmlFor="bloquante" className="text-sm font-medium text-slate-700">
            Maintenance bloquante
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-[#1d9a8a] hover:bg-[#167d70] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Enregistrer
        </button>
      </div>
    </form>
  )
}

// ─── PAGE PRINCIPALE ────────────────────────────────────────────────────
function MaintenancesPage() {
  const toast = useToast()

  // ── State ──────────────────────────────────────────────────────────
  const [maintenances, setMaintenances] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const PAGE_SIZE = 10

  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterBloquante, setFilterBloquante] = useState('')

  // Données de référence
  const [chambres, setChambres] = useState([])
  const [employes, setEmployes] = useState([])

  // Modals
  const [modalForm, setModalForm] = useState(null)
  const [modalView, setModalView] = useState(null)
  const [modalDelete, setModalDelete] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  // ── Chargement ─────────────────────────────────────────────────────
  const loadRefs = useCallback(async () => {
    try {
      const [cData, eRes] = await Promise.all([
        chambresAPI.list({ page_size: 200 }),
        employesApi.getAll({ page_size: 200 }).catch(() => ({ data: { results: [] } })),
      ])
      setChambres(cData.results || [])
      setEmployes(eRes.data?.results || eRes.data || [])
    } catch (e) {
      console.error('Erreur chargement refs:', e)
    }
  }, [])

  const loadMaintenances = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      if (filterStatut) params.statut = filterStatut
      if (filterType) params.type = filterType
      if (filterBloquante !== '') params.bloquante = filterBloquante
      const data = await maintenancesAPI.list(params)
      setMaintenances(data.results || [])
      setCount(data.count || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterStatut, filterType, filterBloquante])

  useEffect(() => { loadRefs() }, [loadRefs])
  useEffect(() => { loadMaintenances() }, [loadMaintenances])

  // ── Stats ──────────────────────────────────────────────────────────
  const stats = {
    total: count,
    planifiees: maintenances.filter((m) => m.statut === 'planifiee').length,
    en_cours: maintenances.filter((m) => m.statut === 'en_cours').length,
    bloquantes: maintenances.filter((m) => m.bloquante && ['planifiee', 'en_cours'].includes(m.statut)).length,
  }

  // ── Handlers ───────────────────────────────────────────────────────
  const handleSave = async (formData) => {
    setFormLoading(true)
    try {
      const payload = {
        ...formData,
        cout: formData.cout || '0.00',
        fin: formData.fin || null,
        bloquante: formData.bloquante === true || formData.bloquante === 'true' || formData.bloquante === 1,
      }
      if (modalForm.data) {
        await maintenancesAPI.update(modalForm.data.id_maintenance, payload)
        toast.success('Maintenance mise à jour.')
      } else {
        await maintenancesAPI.create(payload)
        toast.success('Maintenance créée.')
      }
      setModalForm(null)
      loadMaintenances()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    setFormLoading(true)
    try {
      await maintenancesAPI.delete(modalDelete.id_maintenance)
      toast.success(`Maintenance #${modalDelete.id_maintenance} supprimée.`)
      setModalDelete(null)
      loadMaintenances()
    } catch (e) {
      toast.error(e.message)
      setModalDelete(null)
    } finally {
      setFormLoading(false)
    }
  }

  const handleChangerStatut = async (m, statut) => {
    try {
      await maintenancesAPI.changerStatut(m.id_maintenance, statut)
      toast.success(`Statut → ${STATUT_MAINTENANCE_CONFIG[statut]?.label}`)
      loadMaintenances()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const resetFilters = () => {
    setSearch(''); setFilterStatut(''); setFilterType(''); setFilterBloquante(''); setPage(1)
  }
  const hasActiveFilters = search || filterStatut || filterType || filterBloquante !== ''

  // Icône de statut
  const statutIcon = {
    planifiee: <Clock className="w-4 h-4 text-sky-500" />,
    en_cours: <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />,
    terminee: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    annulee: <XCircle className="w-4 h-4 text-slate-400" />,
  }

  return (
    <div className="page-content space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-[#1d9a8a]" /> Suivi des maintenances
          </h1>
          <p className="text-slate-500 text-sm mt-1">Interventions, états et responsables</p>
        </div>
        <button
          onClick={() => setModalForm({ data: null })}
          className="flex items-center gap-2 px-4 py-2 bg-[#1d9a8a] text-white text-sm font-medium rounded-lg hover:bg-[#167d70] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Nouvelle intervention
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: count, bg: 'bg-slate-50 border-slate-200', color: 'text-slate-700' },
          { label: 'Planifiées', value: stats.planifiees, bg: 'bg-sky-50 border-sky-200', color: 'text-sky-700' },
          { label: 'En cours', value: stats.en_cours, bg: 'bg-amber-50 border-amber-200', color: 'text-amber-700' },
          { label: 'Bloquantes actives', value: stats.bloquantes, bg: 'bg-rose-50 border-rose-200', color: 'text-rose-700' },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} border rounded-xl p-3 text-center`}>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Alerte maintenances bloquantes actives */}
      {stats.bloquantes > 0 && (
        <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <span><strong>{stats.bloquantes}</strong> maintenance(s) bloquante(s) active(s) — des chambres sont indisponibles.</span>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Rechercher par description, chambre, employé…"
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 focus:border-[#1d9a8a]" />
          </div>
          <select value={filterStatut} onChange={(e) => { setFilterStatut(e.target.value); setPage(1) }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40">
            <option value="">Tous les statuts</option>
            {Object.entries(STATUT_MAINTENANCE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40">
            <option value="">Tous les types</option>
            {Object.entries(TYPE_MAINTENANCE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select value={filterBloquante} onChange={(e) => { setFilterBloquante(e.target.value); setPage(1) }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40">
            <option value="">Toutes</option>
            <option value="true">Bloquantes</option>
            <option value="false">Non bloquantes</option>
          </select>
          {hasActiveFilters && (
            <button onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors">
              <X className="w-3.5 h-3.5" /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Contenu */}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner text="Chargement des maintenances…" full />
      ) : maintenances.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucune maintenance trouvée</p>
          <p className="text-sm mt-1">{hasActiveFilters ? "Essayez d'autres filtres." : 'Créez une première intervention.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Chambre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Responsable</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Début</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Coût</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {maintenances.map((m) => (
                <tr key={m.id_maintenance}
                  className={`hover:bg-slate-50 transition-colors ${m.bloquante && ['planifiee', 'en_cours'].includes(m.statut) ? 'bg-rose-50/40' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">#{m.id_maintenance}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-[#1d9a8a]" />
                      <span className="font-semibold text-slate-700">{m.chambre_numero || `#${m.chambre}`}</span>
                    </div>
                    {m.bloquante && ['planifiee', 'en_cours'].includes(m.statut) && (
                      <div className="mt-1"><BloquanteAlert /></div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${m.type === 'preventive' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                      {TYPE_MAINTENANCE_LABELS[m.type] || m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {statutIcon[m.statut]}
                      <StatutBadge statut={m.statut} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <User className="w-3.5 h-3.5" />
                      {m.employe_nom_complet || `#${m.employe}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {formatDate(m.debut, true)}
                    {m.fin && <div className="text-slate-400">→ {formatDate(m.fin, true)}</div>}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {m.cout && parseFloat(m.cout) > 0 ? formatMoney(m.cout) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setModalView(m)}
                        className="p-1.5 text-slate-400 hover:text-[#1d9a8a] hover:bg-teal-50 rounded-lg transition-colors" title="Voir">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setModalForm({ data: m })}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {/* Changement de statut rapide */}
                      {m.statut === 'planifiee' && (
                        <button onClick={() => handleChangerStatut(m, 'en_cours')}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Démarrer">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      {m.statut === 'en_cours' && (
                        <button onClick={() => handleChangerStatut(m, 'terminee')}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Terminer">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {['planifiee', 'annulee'].includes(m.statut) && (
                        <button onClick={() => setModalDelete(m)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination count={count} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} />

      {/* ══ Modal Formulaire ══ */}
      <Modal isOpen={!!modalForm} onClose={() => setModalForm(null)}
        title={modalForm?.data ? `Modifier maintenance #${modalForm.data.id_maintenance}` : 'Nouvelle intervention'}
        maxWidth="max-w-2xl">
        {modalForm && (
          <MaintenanceForm
            initial={modalForm.data}
            chambres={chambres}
            employes={employes}
            onSave={handleSave}
            onCancel={() => setModalForm(null)}
            loading={formLoading} />
        )}
      </Modal>

      {/* ══ Modal Vue détail ══ */}
      <Modal isOpen={!!modalView} onClose={() => setModalView(null)}
        title={`Maintenance #${modalView?.id_maintenance}`} maxWidth="max-w-lg">
        {modalView && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <StatutBadge statut={modalView.statut} />
              {modalView.bloquante && <BloquanteAlert />}
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${modalView.type === 'preventive' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                {TYPE_MAINTENANCE_LABELS[modalView.type]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-0.5">Chambre</div>
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5 text-[#1d9a8a]" /> {modalView.chambre_numero || `#${modalView.chambre}`}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-0.5">Responsable</div>
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#1d9a8a]" /> {modalView.employe_nom_complet || `#${modalView.employe}`}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-0.5">Début</div>
                <div className="font-semibold text-slate-800">{formatDate(modalView.debut, true)}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-0.5">Fin prévue</div>
                <div className="font-semibold text-slate-800">{modalView.fin ? formatDate(modalView.fin, true) : '—'}</div>
              </div>
              <div className="bg-teal-50 rounded-lg p-3 col-span-2">
                <div className="text-xs text-slate-400 mb-0.5">Coût</div>
                <div className="font-bold text-[#1d9a8a] text-base">{formatMoney(modalView.cout)}</div>
              </div>
            </div>

            <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Description</div>
              {modalView.description}
            </div>

            {/* Actions rapides de statut */}
            {modalView.statut === 'planifiee' && (
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => { handleChangerStatut(modalView, 'en_cours'); setModalView(null) }}
                  className="flex-1 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
                  Démarrer
                </button>
                <button onClick={() => { handleChangerStatut(modalView, 'annulee'); setModalView(null) }}
                  className="flex-1 py-2 text-sm font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors">
                  Annuler
                </button>
              </div>
            )}
            {modalView.statut === 'en_cours' && (
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => { handleChangerStatut(modalView, 'terminee'); setModalView(null) }}
                  className="flex-1 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
                  Marquer terminée
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ══ Confirm suppression ══ */}
      <ConfirmDialog
        isOpen={!!modalDelete}
        onClose={() => setModalDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer la maintenance"
        message={`Supprimer la maintenance #${modalDelete?.id_maintenance} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="danger"
        isLoading={formLoading} />
    </div>
  )
}

export default MaintenancesPage
