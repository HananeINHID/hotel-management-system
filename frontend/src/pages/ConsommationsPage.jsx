import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Plus, Filter, Edit2, Trash2, Receipt, Calendar, User, Clock, AlertTriangle } from 'lucide-react'
import { consommationsApi, servicesApi } from '../api'
import { useToast } from '../hooks/useToast'
import { formatDate, formatMoney } from '../utils/formatters'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Pagination } from '../components/common/Pagination'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Alert } from '../components/common/Alert'

function ConsommationsPage() {
  const toast = useToast()
  const [consommations, setConsommations] = useState([])
  const [servicesList, setServicesList] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtres
  const [filterSejour, setFilterSejour] = useState('')
  const [filterService, setFilterService] = useState('')

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingConso, setEditingConso] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, conso: null, isDeleting: false })

  // Formulaire react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      sejour: '',
      service: '',
      quantite: 1,
      prix_applique: '',
      date_consommation: new Date().toISOString().slice(0, 16),
    },
  })

  // Surveillance en temps réel pour le calcul dynamique du total de la ligne
  const watchedServiceId = useWatch({ control, name: 'service' })
  const watchedQuantite = useWatch({ control, name: 'quantite' })
  const watchedPrixApplique = useWatch({ control, name: 'prix_applique' })

  // Chargement des services pour le select
  useEffect(() => {
    servicesApi
      .getAll({ page_size: 100 })
      .then((res) => {
        const list = res.data?.results || res.data || []
        setServicesList(list)
      })
      .catch((err) => console.error("Erreur chargement services:", err))
  }, [])

  // Règle UI : Prix unitaire auto-affiché à la sélection du service
  useEffect(() => {
    if (watchedServiceId && servicesList.length > 0) {
      const selected = servicesList.find((s) => String(s.id_service) === String(watchedServiceId))
      if (selected) {
        setValue('prix_applique', selected.prix_unitaire)
      }
    }
  }, [watchedServiceId, servicesList, setValue])

  // Calcul dynamique du total de la ligne en direct
  const computedTotalLigne = useMemo(() => {
    const q = parseInt(watchedQuantite, 10) || 0
    const p = parseFloat(watchedPrixApplique) || 0
    return q * p
  }, [watchedQuantite, watchedPrixApplique])

  // Chargement des consommations
  const loadConsommations = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const params = {
        page: currentPage,
        page_size: pageSize,
      }
      if (filterSejour.trim()) params.sejour = filterSejour.trim()
      if (filterService) params.service = filterService

      const res = await consommationsApi.getAll(params)
      if (res.data?.results) {
        setConsommations(res.data.results)
        setTotalCount(res.data.count)
      } else if (Array.isArray(res.data)) {
        setConsommations(res.data)
        setTotalCount(res.data.length)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, filterSejour, filterService])

  useEffect(() => {
    loadConsommations()
  }, [loadConsommations])

  // Ouvrir modal création
  const handleOpenCreate = () => {
    setEditingConso(null)
    reset({
      sejour: filterSejour || '1',
      service: servicesList[0]?.id_service || '',
      quantite: 1,
      prix_applique: servicesList[0]?.prix_unitaire || '',
      date_consommation: new Date().toISOString().slice(0, 16),
    })
    setIsModalOpen(true)
  }

  // Ouvrir modal édition
  const handleOpenEdit = (conso) => {
    setEditingConso(conso)
    const dateFormatted = conso.date_consommation
      ? new Date(conso.date_consommation).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)

    reset({
      sejour: conso.sejour,
      service: conso.service,
      quantite: conso.quantite,
      prix_applique: conso.prix_applique,
      date_consommation: dateFormatted,
    })
    setIsModalOpen(true)
  }

  // Soumission
  const onSubmit = async (data) => {
    try {
      const payload = {
        sejour: parseInt(data.sejour, 10),
        service: parseInt(data.service, 10),
        quantite: parseInt(data.quantite, 10),
        prix_applique: parseFloat(data.prix_applique).toFixed(2),
        date_consommation: data.date_consommation ? new Date(data.date_consommation).toISOString() : new Date().toISOString(),
      }

      if (editingConso) {
        await consommationsApi.update(editingConso.id_consommation, payload)
        toast.success("Consommation modifiée avec succès.")
      } else {
        await consommationsApi.create(payload)
        toast.success("Consommation de service enregistrée avec succès.")
      }

      setIsModalOpen(false)
      loadConsommations()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Suppression
  const confirmDelete = async () => {
    if (!deleteConfirm.conso) return
    try {
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }))
      await consommationsApi.delete(deleteConfirm.conso.id_consommation)
      toast.success("Consommation supprimée.")
      setDeleteConfirm({ isOpen: false, conso: null, isDeleting: false })
      loadConsommations()
    } catch (err) {
      toast.error(err.message)
      setDeleteConfirm({ isOpen: false, conso: null, isDeleting: false })
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#1d9a8a]" />
            <h1 className="text-2xl font-bold text-slate-800">Consommations de Services</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Enregistrez les prestations consommées par les clients durant leur séjour (tarification automatique et règles d'archivage).
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1d9a8a] hover:bg-[#167d70] text-white font-medium rounded-xl shadow-sm transition-colors text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Ajouter une Consommation
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Filtre Séjour */}
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs font-semibold text-slate-600 uppercase">Séjour :</label>
          <input
            type="number"
            placeholder="Numéro du séjour (ex: 1, 2)..."
            value={filterSejour}
            onChange={(e) => {
              setFilterSejour(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
          />
        </div>

        {/* Filtre Service */}
        <div className="flex items-center gap-2 w-full md:w-72">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterService}
            onChange={(e) => {
              setFilterService(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
          >
            <option value="">Tous les services</option>
            {servicesList.map((s) => (
              <option key={s.id_service} value={s.id_service}>
                {s.nom} ({formatMoney(s.prix_unitaire)})
              </option>
            ))}
          </select>
        </div>

        {(filterSejour || filterService) && (
          <button
            type="button"
            onClick={() => {
              setFilterSejour('')
              setFilterService('')
              setCurrentPage(1)
            }}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-end md:self-auto"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Tableau des consommations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner full text="Chargement des consommations..." />
        ) : consommations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">Aucune consommation trouvée</p>
            <p className="text-sm text-slate-500 mt-1">
              {filterSejour || filterService
                ? 'Aucun résultat ne correspond à ces critères.'
                : 'Enregistrez la première prestation consommée par un client.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Date & Heure</th>
                  <th className="py-3.5 px-4">Séjour concerné</th>
                  <th className="py-3.5 px-4">Service consommé</th>
                  <th className="py-3.5 px-4 text-center">Quantité</th>
                  <th className="py-3.5 px-4 text-right">Prix appliqué</th>
                  <th className="py-3.5 px-4 text-right font-bold">Total ligne</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consommations.map((conso) => (
                  <tr key={conso.id_consommation} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {formatDate(conso.date_consommation, true)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                        Séjour #{conso.sejour}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{conso.service_nom}</div>
                      <span className="text-xs text-slate-500">{conso.service_type_display || conso.service_type}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                      x {conso.quantite}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      {formatMoney(conso.prix_applique)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#1d9a8a]">
                      {formatMoney(conso.montant_total)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(conso)}
                        className="p-1.5 text-slate-500 hover:text-[#1d9a8a] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Modifier la consommation"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            isOpen: true,
                            conso,
                            isDeleting: false,
                          })
                        }
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Supprimer la consommation"
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

      {/* Modal Formulaire Consommation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingConso ? 'Modifier la consommation' : 'Enregistrer une consommation de service'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Règle métier importante :</strong> Les consommations ne peuvent être imputées que sur un séjour en cours. Tout séjour archivé ou clôturé sera automatiquement rejeté.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Identifiant Séjour *
              </label>
              <input
                type="number"
                min="1"
                {...register('sejour', { required: 'Le numéro de séjour est obligatoire' })}
                placeholder="Ex: 1"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              />
              {errors.sejour && <span className="text-xs text-rose-600 mt-1">{errors.sejour.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Date & Heure de prestation
              </label>
              <input
                type="datetime-local"
                {...register('date_consommation')}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Service consommé *
            </label>
            <select
              {...register('service', { required: 'Veuillez sélectionner un service' })}
              className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
            >
              <option value="">Sélectionner un service...</option>
              {servicesList.map((s) => (
                <option key={s.id_service} value={s.id_service}>
                  {s.nom} — {formatMoney(s.prix_unitaire)} ({s.type_service_display || s.type_service})
                </option>
              ))}
            </select>
            {errors.service && <span className="text-xs text-rose-600 mt-1">{errors.service.message}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Quantité *
              </label>
              <input
                type="number"
                min="1"
                {...register('quantite', {
                  required: 'La quantité est obligatoire',
                  min: { value: 1, message: 'Minimum 1 requis' },
                })}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              />
              {errors.quantite && <span className="text-xs text-rose-600 mt-1">{errors.quantite.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Prix unitaire appliqué (MAD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('prix_applique', {
                  required: 'Le prix unitaire est requis',
                  min: { value: 0, message: 'Le prix ne peut être négatif' },
                })}
                placeholder="Auto-rempli à la sélection"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              />
              {errors.prix_applique && (
                <span className="text-xs text-rose-600 mt-1">{errors.prix_applique.message}</span>
              )}
            </div>
          </div>

          {/* Règle UI : Calcul dynamique en direct du total de ligne */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Total calculé en direct :</span>
            <span className="text-xl font-extrabold text-[#1d9a8a]">
              {formatMoney(computedTotalLigne)}
            </span>
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
              {editingConso ? 'Enregistrer les modifications' : 'Enregistrer la consommation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Suppression */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, conso: null, isDeleting: false })}
        onConfirm={confirmDelete}
        title="Supprimer cette consommation ?"
        message={`Confirmez-vous la suppression de la prestation "${deleteConfirm.conso?.service_nom}" (x${deleteConfirm.conso?.quantite}) pour le Séjour #${deleteConfirm.conso?.sejour} ? Le montant sera retiré du total dû.`}
        confirmText="Supprimer"
        type="danger"
        isLoading={deleteConfirm.isDeleting}
      />
    </div>
  )
}

export default ConsommationsPage
