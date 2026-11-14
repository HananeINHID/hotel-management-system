import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, Filter, Edit2, Trash2, Sparkles, AlertCircle } from 'lucide-react'
import { servicesApi } from '../api'
import { useToast } from '../hooks/useToast'
import { formatMoney, TYPE_SERVICE_LABELS } from '../utils/formatters'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Pagination } from '../components/common/Pagination'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Alert } from '../components/common/Alert'

function ServicesPage() {
  const toast = useToast()
  const [services, setServices] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtres
  const [selectedType, setSelectedType] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, service: null, isDeleting: false })

  // Formulaire react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      nom: '',
      type_service: 'RESTAURATION',
      prix_unitaire: '',
      description: '',
    },
  })

  // Chargement des services
  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const params = {
        page: currentPage,
        page_size: pageSize,
      }
      if (selectedType) params.type_service = selectedType
      if (searchQuery.trim()) params.search = searchQuery.trim()

      const res = await servicesApi.getAll(params)
      if (res.data?.results) {
        setServices(res.data.results)
        setTotalCount(res.data.count)
      } else if (Array.isArray(res.data)) {
        setServices(res.data)
        setTotalCount(res.data.length)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, selectedType, searchQuery])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  // Ouvrir modal création
  const handleOpenCreate = () => {
    setEditingService(null)
    reset({
      nom: '',
      type_service: 'RESTAURATION',
      prix_unitaire: '',
      description: '',
    })
    setIsModalOpen(true)
  }

  // Ouvrir modal édition
  const handleOpenEdit = (service) => {
    setEditingService(service)
    reset({
      nom: service.nom,
      type_service: service.type_service,
      prix_unitaire: service.prix_unitaire,
      description: service.description || '',
    })
    setIsModalOpen(true)
  }

  // Soumission formulaire
  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        prix_unitaire: parseFloat(data.prix_unitaire).toFixed(2),
      }

      if (editingService) {
        await servicesApi.update(editingService.id_service, payload)
        toast.success(`Le service '${data.nom}' a été mis à jour avec succès.`)
      } else {
        await servicesApi.create(payload)
        toast.success(`Le service '${data.nom}' a été créé avec succès.`)
      }

      setIsModalOpen(false)
      loadServices()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Suppression
  const confirmDelete = async () => {
    if (!deleteConfirm.service) return
    try {
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }))
      await servicesApi.delete(deleteConfirm.service.id_service)
      toast.success(`Service '${deleteConfirm.service.nom}' supprimé.`)
      setDeleteConfirm({ isOpen: false, service: null, isDeleting: false })
      loadServices()
    } catch (err) {
      // Gérer l'erreur 409 spécifique
      toast.error(err.message)
      setDeleteConfirm({ isOpen: false, service: null, isDeleting: false })
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#1d9a8a]" />
            <h1 className="text-2xl font-bold text-slate-800">Catalogue des Services</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Gérez les prestations et tarifs de l'établissement (Restauration, Spa, Blanchisserie, Transport, etc.)
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1d9a8a] hover:bg-[#167d70] text-white font-medium rounded-xl shadow-sm transition-colors text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouveau Service
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
            placeholder="Rechercher par nom ou description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
          />
        </div>

        {/* Filtre par type */}
        <div className="flex items-center gap-2 w-full md:w-64">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
          >
            <option value="">Tous les types de service</option>
            {Object.entries(TYPE_SERVICE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau des services */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner full text="Chargement des services..." />
        ) : services.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Sparkles className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">Aucun service trouvé</p>
            <p className="text-sm text-slate-500 mt-1">
              Modifiez vos filtres ou ajoutez votre premier service au catalogue.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Nom du service</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Prix unitaire</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Consommations</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((service) => (
                  <tr key={service.id_service} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {service.nom}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {service.type_service_display || TYPE_SERVICE_LABELS[service.type_service] || service.type_service}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      {formatMoney(service.prix_unitaire)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {service.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                        {service.nb_consommations || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(service)}
                        className="p-1.5 text-slate-500 hover:text-[#1d9a8a] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Modifier le service"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            isOpen: true,
                            service,
                            isDeleting: false,
                          })
                        }
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Supprimer le service"
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

      {/* Modal Création / Édition de Service */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Modifier le service' : 'Ajouter un nouveau service'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nom du service *
            </label>
            <input
              type="text"
              {...register('nom', { required: 'Le nom du service est obligatoire' })}
              placeholder="Ex: Séance Hammam Traditionnel"
              className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
            />
            {errors.nom && <span className="text-xs text-rose-600 mt-1">{errors.nom.message}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Catégorie *
              </label>
              <select
                {...register('type_service', { required: 'Le type de service est obligatoire' })}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              >
                {Object.entries(TYPE_SERVICE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Prix unitaire (MAD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('prix_unitaire', {
                  required: 'Le prix unitaire est obligatoire',
                  min: { value: 0, message: 'Le prix doit être positif ou nul' },
                })}
                placeholder="Ex: 250.00"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              />
              {errors.prix_unitaire && (
                <span className="text-xs text-rose-600 mt-1">{errors.prix_unitaire.message}</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Détails de la prestation, conditions particulières..."
              className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
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
              className="px-5 py-2 text-sm font-medium bg-[#1d9a8a] hover:bg-[#167d70] text-white rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {editingService ? 'Enregistrer les modifications' : 'Créer le service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Suppression Service */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, service: null, isDeleting: false })}
        onConfirm={confirmDelete}
        title="Supprimer ce service ?"
        message={
          deleteConfirm.service?.nb_consommations > 0 ? (
            <div className="space-y-2">
              <span className="font-semibold text-rose-600">Attention (Règle métier) :</span>
              <p>
                Ce service compte déjà {deleteConfirm.service.nb_consommations} consommation(s) enregistrée(s).
                La suppression sera rejetée par l'API avec un code 409 (Conflit).
              </p>
            </div>
          ) : (
            `Êtes-vous sûr de vouloir supprimer définitivement le service "${deleteConfirm.service?.nom}" ? Cette action est irréversible.`
          )
        }
        confirmText="Confirmer la suppression"
        type="danger"
        isLoading={deleteConfirm.isDeleting}
      />
    </div>
  )
}

export default ServicesPage
