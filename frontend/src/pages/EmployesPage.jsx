import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import {
  Plus,
  Search,
  Filter,
  UserRound,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { employesApi } from '../api'
import { useToast } from '../hooks/useToast'
import {
  formatDate,
  POSTE_EMPLOYE_LABELS,
  STATUT_EMPLOYE_CONFIG,
} from '../utils/formatters'
import { StatusBadge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Pagination } from '../components/common/Pagination'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Alert } from '../components/common/Alert'

function EmployesPage() {
  const toast = useToast()
  const [employes, setEmployes] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtres
  const [filterStatut, setFilterStatut] = useState('')
  const [filterPoste, setFilterPoste] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmploye, setEditingEmploye] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    employe: null,
    isDeleting: false,
  })

  // Formulaire react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      nom: '',
      prenom: '',
      poste: 'RECEPTIONNISTE',
      email: '',
      telephone: '',
      date_embauche: new Date().toISOString().slice(0, 10),
      statut: 'ACTIF',
    },
  })

  // Chargement des employés
  const loadEmployes = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const params = {
        page: currentPage,
        page_size: pageSize,
      }
      if (filterStatut) params.statut = filterStatut
      if (filterPoste) params.poste = filterPoste
      if (searchQuery.trim()) params.search = searchQuery.trim()

      const res = await employesApi.getAll(params)
      if (res.data?.results) {
        setEmployes(res.data.results)
        setTotalCount(res.data.count)
      } else if (Array.isArray(res.data)) {
        setEmployes(res.data)
        setTotalCount(res.data.length)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, filterStatut, filterPoste, searchQuery])

  useEffect(() => {
    loadEmployes()
  }, [loadEmployes])

  // Ouvrir modal création
  const handleOpenCreate = () => {
    setEditingEmploye(null)
    reset({
      nom: '',
      prenom: '',
      poste: 'RECEPTIONNISTE',
      email: '',
      telephone: '',
      date_embauche: new Date().toISOString().slice(0, 10),
      statut: 'ACTIF',
    })
    setIsModalOpen(true)
  }

  // Ouvrir modal édition
  const handleOpenEdit = (emp) => {
    setEditingEmploye(emp)
    reset({
      nom: emp.nom,
      prenom: emp.prenom,
      poste: emp.poste,
      email: emp.email,
      telephone: emp.telephone || '',
      date_embauche: emp.date_embauche || new Date().toISOString().slice(0, 10),
      statut: emp.statut,
    })
    setIsModalOpen(true)
  }

  // Soumission
  const onSubmit = async (data) => {
    try {
      if (editingEmploye) {
        await employesApi.update(editingEmploye.id_employe, data)
        toast.success(`Fiche de ${data.nom} ${data.prenom} mise à jour.`)
      } else {
        await employesApi.create(data)
        toast.success(`Nouvel employé ${data.nom} ${data.prenom} ajouté avec succès.`)
      }

      setIsModalOpen(false)
      loadEmployes()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Changement rapide de statut (ACTIF / EN_CONGE / INACTIF)
  const handleQuickStatusChange = async (employe, nouveauStatut) => {
    if (employe.statut === nouveauStatut) return
    try {
      await employesApi.changerStatut(employe.id_employe, nouveauStatut)
      toast.success(
        `Statut de ${employe.nom} ${employe.prenom} passé à ${STATUT_EMPLOYE_CONFIG[nouveauStatut]?.label}.`
      )
      loadEmployes()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Suppression
  const confirmDelete = async () => {
    if (!deleteConfirm.employe) return
    try {
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }))
      const res = await employesApi.delete(deleteConfirm.employe.id_employe)

      // Le backend gère la règle métier : si l'employé a des paiements, il renvoie 200 avec message
      if (res?.data?.statut === 'INACTIF') {
        toast.info(res.data.detail || "L'employé a des paiements enregistrés : son statut a été passé à INACTIF.")
      } else {
        toast.success(`Employé ${deleteConfirm.employe.nom} ${deleteConfirm.employe.prenom} supprimé.`)
      }

      setDeleteConfirm({ isOpen: false, employe: null, isDeleting: false })
      loadEmployes()
    } catch (err) {
      toast.error(err.message)
      setDeleteConfirm({ isOpen: false, employe: null, isDeleting: false })
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <UserRound className="w-6 h-6 text-[#1d9a8a]" />
            <h1 className="text-2xl font-bold text-slate-800">Gestion des Employés</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Personnel de l'hôtel, habilitations d'encaissement et suivi d'activité (règles de non-suppression si paiements rattachés).
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1d9a8a] hover:bg-[#167d70] text-white font-medium rounded-xl shadow-sm transition-colors text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Employé
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Barre de filtres et recherche */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Recherche */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
          />
        </div>

        {/* Filtre Poste */}
        <div className="w-full md:w-56">
          <select
            value={filterPoste}
            onChange={(e) => {
              setFilterPoste(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
          >
            <option value="">Tous les postes</option>
            {Object.entries(POSTE_EMPLOYE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Statut */}
        <div className="w-full md:w-44">
          <select
            value={filterStatut}
            onChange={(e) => {
              setFilterStatut(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUT_EMPLOYE_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>

        {(filterPoste || filterStatut || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setFilterPoste('')
              setFilterStatut('')
              setSearchQuery('')
              setCurrentPage(1)
            }}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-end md:self-auto"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Tableau des employés */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner full text="Chargement des employés..." />
        ) : employes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <UserRound className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">Aucun employé trouvé</p>
            <p className="text-sm text-slate-500 mt-1">
              Modifiez vos critères ou enregistrez un premier employé.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Employé</th>
                  <th className="py-3.5 px-4">Poste</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Date embauche</th>
                  <th className="py-3.5 px-4">Statut d'activité</th>
                  <th className="py-3.5 px-4 text-center">Paiements encaissés</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employes.map((emp) => (
                  <tr key={emp.id_employe} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {emp.nom} {emp.prenom}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">ID #{emp.id_employe}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {emp.poste_display || POSTE_EMPLOYE_LABELS[emp.poste] || emp.poste}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 text-xs">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.email}</span>
                      </div>
                      {emp.telephone && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{emp.telephone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-xs">
                      {formatDate(emp.date_embauche)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {/* Sélecteur de changement rapide de statut */}
                      <div className="flex items-center gap-2">
                        <StatusBadge status={emp.statut} type="employe" />
                        <select
                          value={emp.statut}
                          onChange={(e) => handleQuickStatusChange(emp, e.target.value)}
                          className="text-xs bg-slate-50 border border-slate-200 rounded-md py-1 px-1.5 text-slate-600 hover:border-slate-300 focus:outline-none cursor-pointer"
                          title="Changement rapide de statut"
                        >
                          <option value="ACTIF">Actif</option>
                          <option value="EN_CONGE">En congé</option>
                          <option value="INACTIF">Inactif</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {emp.nb_paiements_enregistres || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 text-slate-500 hover:text-[#1d9a8a] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Modifier l'employé"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            isOpen: true,
                            employe: emp,
                            isDeleting: false,
                          })
                        }
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Supprimer ou archiver"
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

        <Pagination
          count={totalCount}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Formulaire Employé */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmploye ? `Modifier ${editingEmploye.nom} ${editingEmploye.prenom}` : 'Ajouter un nouvel employé'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nom *
              </label>
              <input
                type="text"
                {...register('nom', { required: 'Le nom est obligatoire' })}
                placeholder="Ex: Bennani"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              />
              {errors.nom && <span className="text-xs text-rose-600 mt-1">{errors.nom.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Prénom *
              </label>
              <input
                type="text"
                {...register('prenom', { required: 'Le prénom est obligatoire' })}
                placeholder="Ex: Karima"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              />
              {errors.prenom && <span className="text-xs text-rose-600 mt-1">{errors.prenom.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Poste occupé *
              </label>
              <select
                {...register('poste', { required: 'Le poste est obligatoire' })}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              >
                {Object.entries(POSTE_EMPLOYE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Statut initial
              </label>
              <select
                {...register('statut')}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              >
                <option value="ACTIF">Actif</option>
                <option value="EN_CONGE">En congé</option>
                <option value="INACTIF">Inactif</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email professionnel (unique) *
              </label>
              <input
                type="email"
                {...register('email', {
                  required: "L'email est obligatoire",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Format email invalide',
                  },
                })}
                placeholder="Ex: karima.b@hotel.ma"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              />
              {errors.email && <span className="text-xs text-rose-600 mt-1">{errors.email.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                {...register('telephone')}
                placeholder="Ex: +212 661 000000"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Date d'embauche *
            </label>
            <input
              type="date"
              {...register('date_embauche', { required: "La date d'embauche est obligatoire" })}
              className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
            />
            {errors.date_embauche && (
              <span className="text-xs text-rose-600 mt-1">{errors.date_embauche.message}</span>
            )}
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
              className="px-5 py-2 text-sm font-medium bg-[#1d9a8a] hover:bg-[#167d70] text-white rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {editingEmploye ? 'Enregistrer les modifications' : 'Créer l’employé'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Suppression */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, employe: null, isDeleting: false })}
        onConfirm={confirmDelete}
        title="Supprimer cet employé ?"
        message={
          deleteConfirm.employe?.nb_paiements_enregistres > 0 ? (
            <div className="space-y-2">
              <span className="font-semibold text-amber-700">Règle de traçabilité financière :</span>
              <p>
                Cet employé a déjà enregistré{' '}
                <strong>{deleteConfirm.employe.nb_paiements_enregistres} paiement(s)</strong>.
                Pour préserver l'historique comptable, il ne sera pas supprimé physiquement mais son statut passera automatiquement à{' '}
                <span className="font-semibold text-slate-800">INACTIF</span>.
              </p>
            </div>
          ) : (
            `Confirmez-vous la suppression définitive de ${deleteConfirm.employe?.nom} ${deleteConfirm.employe?.prenom} ?`
          )
        }
        confirmText={
          deleteConfirm.employe?.nb_paiements_enregistres > 0
            ? 'Passer à Inactif'
            : 'Confirmer la suppression'
        }
        type={deleteConfirm.employe?.nb_paiements_enregistres > 0 ? 'warning' : 'danger'}
        isLoading={deleteConfirm.isDeleting}
      />
    </div>
  )
}

export default EmployesPage
