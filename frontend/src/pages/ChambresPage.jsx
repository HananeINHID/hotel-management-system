import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import {
  BedDouble, Plus, Search, Filter, Edit2, Trash2, Eye,
  CheckCircle, XCircle, Wrench, ChevronDown, X, RefreshCw,
  Tag, Layers, DollarSign, Users, CalendarCheck,
} from 'lucide-react'
import { categoriesChambresAPI, chambresAPI } from '../services/chambresMaintenances'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Alert } from '../components/common/Alert'
import { Pagination } from '../components/common/Pagination'
import { useToast } from '../hooks/useToast'
import { formatMoney } from '../utils/formatters'
import { ETAT_CHAMBRE_CONFIG } from '../utils/chambresFormatters'

// ─── Badge d'état chambre ──────────────────────────────────────────────
function EtatBadge({ etat }) {
  const cfg = ETAT_CHAMBRE_CONFIG[etat] || { label: etat, bg: 'bg-gray-100 text-gray-700 border-gray-300', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── Carte chambre (vue grille) ───────────────────────────────────────
function ChambreCard({ chambre, onView, onEdit, onDelete, onChangeEtat }) {
  const cfg = ETAT_CHAMBRE_CONFIG[chambre.etat_physique] || {}
  const borderColor = {
    disponible: 'border-t-emerald-400',
    en_maintenance: 'border-t-amber-400',
    hors_service: 'border-t-rose-400',
  }[chambre.etat_physique] || 'border-t-slate-300'

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 ${borderColor} hover:shadow-md transition-shadow flex flex-col`}>
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">Chambre {chambre.numero_chambre}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Étage {chambre.etage}</p>
          </div>
          <EtatBadge etat={chambre.etat_physique} />
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Tag className="w-3.5 h-3.5 text-[#1d9a8a]" />
            <span>{chambre.categorie_detail?.libelle || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-3.5 h-3.5 text-[#1d9a8a]" />
            <span>{chambre.categorie_detail?.capacite ?? '—'} pers.</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <DollarSign className="w-3.5 h-3.5 text-[#1d9a8a]" />
            <span>{formatMoney(chambre.categorie_detail?.tarif_nuit)}/nuit</span>
          </div>
        </div>

        {chambre.description && (
          <p className="mt-2 text-xs text-slate-400 line-clamp-2">{chambre.description}</p>
        )}
      </div>

      <div className="border-t border-slate-100 p-3 flex items-center gap-1 justify-end">
        <button onClick={() => onView(chambre)}
          className="p-1.5 text-slate-400 hover:text-[#1d9a8a] hover:bg-teal-50 rounded-lg transition-colors" title="Voir">
          <Eye className="w-4 h-4" />
        </button>
        <button onClick={() => onEdit(chambre)}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
          <Edit2 className="w-4 h-4" />
        </button>
        <div className="relative group">
          <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Changer état">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="absolute right-0 bottom-full mb-1 hidden group-hover:flex flex-col bg-white border border-slate-200 rounded-lg shadow-lg z-20 w-40 overflow-hidden">
            {Object.entries(ETAT_CHAMBRE_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => onChangeEtat(chambre.id_chambre, key)}
                className={`text-left px-3 py-2 text-xs hover:bg-slate-50 ${chambre.etat_physique === key ? 'font-semibold text-[#1d9a8a]' : 'text-slate-700'}`}>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => onDelete(chambre)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Supprimer">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Formulaire Catégorie ──────────────────────────────────────────────
function CategorieForm({ initial, onSave, onCancel, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initial || { libelle: '', capacite: '', tarif_nuit: '', description: '' }
  })
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Libellé *</label>
        <input {...register('libelle', { required: 'Libellé requis' })}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 focus:border-[#1d9a8a]" />
        {errors.libelle && <p className="text-rose-500 text-xs mt-1">{errors.libelle.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Capacité (pers.) *</label>
          <input type="number" min="1" {...register('capacite', { required: 'Requis', min: { value: 1, message: 'Min 1' } })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 focus:border-[#1d9a8a]" />
          {errors.capacite && <p className="text-rose-500 text-xs mt-1">{errors.capacite.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tarif / nuit (MAD) *</label>
          <input type="number" step="0.01" min="0" {...register('tarif_nuit', { required: 'Requis', min: { value: 0, message: 'Min 0' } })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 focus:border-[#1d9a8a]" />
          {errors.tarif_nuit && <p className="text-rose-500 text-xs mt-1">{errors.tarif_nuit.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea rows={2} {...register('description')}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 focus:border-[#1d9a8a] resize-none" />
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

// ─── Formulaire Chambre ────────────────────────────────────────────────
function ChambreForm({ initial, categories, onSave, onCancel, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initial
      ? { ...initial, categorie: initial.categorie }
      : { numero_chambre: '', etage: '', etat_physique: 'disponible', categorie: '', description: '' }
  })
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de chambre *</label>
          <input {...register('numero_chambre', { required: 'Requis' })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 focus:border-[#1d9a8a]" />
          {errors.numero_chambre && <p className="text-rose-500 text-xs mt-1">{errors.numero_chambre.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Étage *</label>
          <input type="number" min="0" {...register('etage', { required: 'Requis', min: { value: 0, message: 'Min 0' } })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 focus:border-[#1d9a8a]" />
          {errors.etage && <p className="text-rose-500 text-xs mt-1">{errors.etage.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie *</label>
          <select {...register('categorie', { required: 'Requis' })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 focus:border-[#1d9a8a] bg-white">
            <option value="">Sélectionner…</option>
            {categories.map((c) => (
              <option key={c.id_categorie} value={c.id_categorie}>{c.libelle} — {formatMoney(c.tarif_nuit)}/nuit</option>
            ))}
          </select>
          {errors.categorie && <p className="text-rose-500 text-xs mt-1">{errors.categorie.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">État physique</label>
          <select {...register('etat_physique')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 focus:border-[#1d9a8a] bg-white">
            {Object.entries(ETAT_CHAMBRE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea rows={2} {...register('description')}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 focus:border-[#1d9a8a] resize-none" />
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

// ─── Vérificateur de disponibilité ───────────────────────────────────
function DisponibiliteChecker({ chambreId }) {
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const check = async () => {
    if (!dateDebut || !dateFin) return
    setLoading(true)
    setResult(null)
    try {
      const data = await chambresAPI.verifierDisponibilite(chambreId, dateDebut, dateFin)
      setResult(data)
    } catch (e) {
      setResult({ error: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 rounded-xl p-4 mt-4 border border-slate-200">
      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
        <CalendarCheck className="w-4 h-4 text-[#1d9a8a]" /> Vérifier la disponibilité
      </h4>
      <div className="flex flex-col sm:flex-row gap-2">
        <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40" />
        <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40" />
        <button onClick={check} disabled={!dateDebut || !dateFin || loading}
          className="px-4 py-1.5 bg-[#1d9a8a] text-white text-sm rounded-lg hover:bg-[#167d70] disabled:opacity-50 transition-colors">
          {loading ? '...' : 'Vérifier'}
        </button>
      </div>
      {result && !result.error && (
        <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${result.disponible ? 'text-emerald-700' : 'text-rose-700'}`}>
          {result.disponible
            ? <><CheckCircle className="w-4 h-4" /> Disponible sur cette période</>
            : <><XCircle className="w-4 h-4" /> Non disponible — {result.raison}</>}
        </div>
      )}
      {result?.error && <p className="mt-2 text-xs text-rose-600">{result.error}</p>}
    </div>
  )
}

// ─── PAGE PRINCIPALE ────────────────────────────────────────────────────
function ChambresPage() {
  const toast = useToast()

  // ── State ──────────────────────────────────────────────────────────
  const [tab, setTab] = useState('chambres') // 'chambres' | 'categories'
  const [chambres, setChambres] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const PAGE_SIZE = 12

  const [search, setSearch] = useState('')
  const [filterEtat, setFilterEtat] = useState('')
  const [filterCategorie, setFilterCategorie] = useState('')
  const [filterEtage, setFilterEtage] = useState('')

  // Modals
  const [modalForm, setModalForm] = useState(null) // { type: 'chambre'|'categorie', data: null|{} }
  const [modalView, setModalView] = useState(null)
  const [modalDelete, setModalDelete] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  // ── Chargement données ─────────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    try {
      const data = await categoriesChambresAPI.list({ page_size: 100 })
      setCategories(Array.isArray(data) ? data : data.results || [])
    } catch (e) {
      console.error('Erreur catégories:', e)
    }
  }, [])

  const loadChambres = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      if (filterEtat) params.etat_physique = filterEtat
      if (filterCategorie) params.categorie = filterCategorie
      if (filterEtage) params.etage = filterEtage
      const data = await chambresAPI.list(params)
      setChambres(data.results || [])
      setCount(data.count || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterEtat, filterCategorie, filterEtage])

  useEffect(() => { loadCategories() }, [loadCategories])
  useEffect(() => { if (tab === 'chambres') loadChambres() }, [tab, loadChambres])

  const [catList, setCatList] = useState([])
  const [catLoading, setCatLoading] = useState(false)

  const loadCatList = useCallback(async () => {
    setCatLoading(true)
    try {
      const data = await categoriesChambresAPI.list({ page_size: 100 })
      setCatList(Array.isArray(data) ? data : data.results || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setCatLoading(false)
    }
  }, [])

  useEffect(() => { if (tab === 'categories') loadCatList() }, [tab, loadCatList])

  // ── Stats rapides ─────────────────────────────────────────────────
  const stats = {
    total: count,
    disponibles: chambres.filter((c) => c.etat_physique === 'disponible').length,
    maintenance: chambres.filter((c) => c.etat_physique === 'en_maintenance').length,
    hors_service: chambres.filter((c) => c.etat_physique === 'hors_service').length,
  }

  // ── Handlers CRUD Chambre ──────────────────────────────────────────
  const handleSaveChambre = async (formData) => {
    setFormLoading(true)
    try {
      if (modalForm.data) {
        await chambresAPI.update(modalForm.data.id_chambre, formData)
        toast.success('Chambre mise à jour avec succès.')
      } else {
        await chambresAPI.create(formData)
        toast.success('Chambre créée avec succès.')
      }
      setModalForm(null)
      loadChambres()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteChambre = async () => {
    setFormLoading(true)
    try {
      await chambresAPI.delete(modalDelete.id_chambre)
      toast.success(`Chambre ${modalDelete.numero_chambre} supprimée.`)
      setModalDelete(null)
      loadChambres()
    } catch (e) {
      toast.error(e.message)
      setModalDelete(null)
    } finally {
      setFormLoading(false)
    }
  }

  const handleChangeEtat = async (id, etat) => {
    try {
      await chambresAPI.changerEtat(id, etat)
      toast.success(`État mis à jour : ${ETAT_CHAMBRE_CONFIG[etat]?.label}`)
      loadChambres()
    } catch (e) {
      toast.error(e.message)
    }
  }

  // ── Handlers CRUD Catégorie ────────────────────────────────────────
  const handleSaveCategorie = async (formData) => {
    setFormLoading(true)
    try {
      if (modalForm.data) {
        await categoriesChambresAPI.update(modalForm.data.id_categorie, formData)
        toast.success('Catégorie mise à jour.')
      } else {
        await categoriesChambresAPI.create(formData)
        toast.success('Catégorie créée.')
      }
      setModalForm(null)
      loadCatList()
      loadCategories()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteCategorie = async () => {
    setFormLoading(true)
    try {
      await categoriesChambresAPI.delete(modalDelete.id_categorie)
      toast.success(`Catégorie « ${modalDelete.libelle} » supprimée.`)
      setModalDelete(null)
      loadCatList()
      loadCategories()
    } catch (e) {
      toast.error(e.message)
      setModalDelete(null)
    } finally {
      setFormLoading(false)
    }
  }

  // ── Réinitialiser filtres ──────────────────────────────────────────
  const resetFilters = () => {
    setSearch('')
    setFilterEtat('')
    setFilterCategorie('')
    setFilterEtage('')
    setPage(1)
  }

  const hasActiveFilters = search || filterEtat || filterCategorie || filterEtage

  return (
    <div className="page-content space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-[#1d9a8a]" /> Gestion des chambres
          </h1>
          <p className="text-slate-500 text-sm mt-1">Chambres, catégories, états et disponibilités</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalForm({ type: tab === 'categories' ? 'categorie' : 'chambre', data: null })}
            className="flex items-center gap-2 px-4 py-2 bg-[#1d9a8a] text-white text-sm font-medium rounded-lg hover:bg-[#167d70] transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            {tab === 'categories' ? 'Nouvelle catégorie' : 'Nouvelle chambre'}
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { key: 'chambres', label: 'Chambres', icon: BedDouble },
          { key: 'categories', label: 'Catégories', icon: Layers },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === key ? 'bg-white text-[#1d9a8a] shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ══════════════ TAB CHAMBRES ══════════════ */}
      {tab === 'chambres' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: count, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
              { label: 'Disponibles', value: stats.disponibles, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
              { label: 'En maintenance', value: stats.maintenance, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
              { label: 'Hors service', value: stats.hors_service, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} border rounded-xl p-3 text-center`}>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Filtres */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" placeholder="Rechercher par numéro, description…"
                  value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40 focus:border-[#1d9a8a]" />
              </div>
              <select value={filterEtat} onChange={(e) => { setFilterEtat(e.target.value); setPage(1) }}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40">
                <option value="">Tous les états</option>
                {Object.entries(ETAT_CHAMBRE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <select value={filterCategorie} onChange={(e) => { setFilterCategorie(e.target.value); setPage(1) }}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40">
                <option value="">Toutes catégories</option>
                {categories.map((c) => (
                  <option key={c.id_categorie} value={c.id_categorie}>{c.libelle}</option>
                ))}
              </select>
              <input type="number" min="0" placeholder="Étage" value={filterEtage}
                onChange={(e) => { setFilterEtage(e.target.value); setPage(1) }}
                className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/40" />
              {hasActiveFilters && (
                <button onClick={resetFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200">
                  <X className="w-3.5 h-3.5" /> Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* Contenu */}
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

          {loading ? (
            <LoadingSpinner text="Chargement des chambres…" full />
          ) : chambres.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <BedDouble className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucune chambre trouvée</p>
              <p className="text-sm mt-1">
                {hasActiveFilters ? 'Essayez d\'autres filtres.' : 'Commencez par créer une chambre.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {chambres.map((c) => (
                <ChambreCard key={c.id_chambre} chambre={c}
                  onView={(ch) => setModalView(ch)}
                  onEdit={(ch) => setModalForm({ type: 'chambre', data: ch })}
                  onDelete={(ch) => setModalDelete(ch)}
                  onChangeEtat={handleChangeEtat} />
              ))}
            </div>
          )}

          <Pagination count={count} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} />
        </>
      )}

      {/* ══════════════ TAB CATÉGORIES ══════════════ */}
      {tab === 'categories' && (
        <>
          {catLoading ? (
            <LoadingSpinner text="Chargement des catégories…" full />
          ) : catList.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucune catégorie</p>
              <p className="text-sm mt-1">Créez une catégorie pour commencer.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Libellé</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Capacité</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tarif / nuit</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Chambres</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {catList.map((cat) => (
                    <tr key={cat.id_categorie} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{cat.libelle}</td>
                      <td className="px-4 py-3 text-slate-600">{cat.capacite} pers.</td>
                      <td className="px-4 py-3 font-medium text-[#1d9a8a]">{formatMoney(cat.tarif_nuit)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                          {cat.nb_chambres} chambre(s)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{cat.description || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setModalForm({ type: 'categorie', data: cat })}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setModalDelete(cat)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══ Modal Formulaire ══ */}
      <Modal
        isOpen={!!modalForm}
        onClose={() => setModalForm(null)}
        title={
          modalForm?.type === 'chambre'
            ? modalForm.data ? 'Modifier la chambre' : 'Nouvelle chambre'
            : modalForm?.data ? 'Modifier la catégorie' : 'Nouvelle catégorie'
        }>
        {modalForm?.type === 'chambre' && (
          <ChambreForm
            initial={modalForm.data}
            categories={categories}
            onSave={handleSaveChambre}
            onCancel={() => setModalForm(null)}
            loading={formLoading} />
        )}
        {modalForm?.type === 'categorie' && (
          <CategorieForm
            initial={modalForm.data}
            onSave={handleSaveCategorie}
            onCancel={() => setModalForm(null)}
            loading={formLoading} />
        )}
      </Modal>

      {/* ══ Modal Vue détail ══ */}
      <Modal isOpen={!!modalView} onClose={() => setModalView(null)}
        title={`Chambre ${modalView?.numero_chambre}`} maxWidth="max-w-lg">
        {modalView && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <EtatBadge etat={modalView.etat_physique} />
              <span className="text-sm text-slate-500">Étage {modalView.etage}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-0.5">Catégorie</div>
                <div className="font-semibold text-slate-800">{modalView.categorie_detail?.libelle}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-0.5">Capacité</div>
                <div className="font-semibold text-slate-800">{modalView.categorie_detail?.capacite} personne(s)</div>
              </div>
              <div className="bg-teal-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-0.5">Tarif / nuit</div>
                <div className="font-bold text-[#1d9a8a] text-base">{formatMoney(modalView.categorie_detail?.tarif_nuit)}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-0.5">ID Chambre</div>
                <div className="font-semibold text-slate-800">#{modalView.id_chambre}</div>
              </div>
            </div>
            {modalView.description && (
              <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Description</div>
                {modalView.description}
              </div>
            )}
            <DisponibiliteChecker chambreId={modalView.id_chambre} />
          </div>
        )}
      </Modal>

      {/* ══ Confirm suppression ══ */}
      <ConfirmDialog
        isOpen={!!modalDelete}
        onClose={() => setModalDelete(null)}
        onConfirm={tab === 'categories' ? handleDeleteCategorie : handleDeleteChambre}
        title="Confirmer la suppression"
        message={
          modalDelete
            ? tab === 'categories'
              ? `Supprimer la catégorie « ${modalDelete.libelle} » ? Cette action est irréversible.`
              : `Supprimer la chambre ${modalDelete.numero_chambre} ? Cette action est irréversible.`
            : ''
        }
        confirmText="Supprimer"
        type="danger"
        isLoading={formLoading} />
    </div>
  )
}

export default ChambresPage
