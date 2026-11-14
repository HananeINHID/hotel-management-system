import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  RotateCcw,
  CreditCard,
  Lock,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { paiementsApi, employesApi, sejoursApi } from '../api'
import { useToast } from '../hooks/useToast'
import {
  formatDate,
  formatMoney,
  MODE_PAIEMENT_LABELS,
  STATUT_PAIEMENT_CONFIG,
} from '../utils/formatters'
import { StatusBadge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Pagination } from '../components/common/Pagination'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Alert } from '../components/common/Alert'

function PaiementsPage() {
  const toast = useToast()
  const [paiements, setPaiements] = useState([])
  const [employesList, setEmployesList] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtres & Recherche
  const [filterStatut, setFilterStatut] = useState('')
  const [filterMode, setFilterMode] = useState('')
  const [filterSejour, setFilterSejour] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPaiement, setEditingPaiement] = useState(null)
  const [actionConfirm, setActionConfirm] = useState({
    isOpen: false,
    action: null, // 'valider', 'rembourser', 'supprimer'
    paiement: null,
    isLoading: false,
  })

  // Informations sur le séjour en cours de saisie
  const [sejourResume, setSejourResume] = useState(null)
  const [isLoadingSejour, setIsLoadingSejour] = useState(false)

  // Formulaire react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      sejour: '',
      employe: '',
      montant: '',
      mode_paiement: 'CARTE_BANCAIRE',
      statut: 'EN_ATTENTE',
      reference_paiement: '',
      date_paiement: new Date().toISOString().slice(0, 16),
    },
  })

  const watchedSejourId = watch('sejour')

  // Charger la liste des employés actifs pour le select
  useEffect(() => {
    employesApi
      .getAll({ page_size: 100 })
      .then((res) => {
        const list = res.data?.results || res.data || []
        setEmployesList(list)
      })
      .catch((err) => console.error("Erreur chargement employés:", err))
  }, [])

  // Récupérer le reste à payer du séjour lors de la saisie
  useEffect(() => {
    if (watchedSejourId && isModalOpen) {
      setIsLoadingSejour(true)
      sejoursApi
        .getResumeFinancier(watchedSejourId)
        .then((res) => {
          setSejourResume(res.data)
          // Si on est en création et qu'un montant n'est pas encore tapé, suggérer le reste à payer
          if (!editingPaiement && parseFloat(res.data.reste_a_payer) > 0) {
            setValue('montant', res.data.reste_a_payer)
          }
        })
        .catch(() => {
          setSejourResume(null)
        })
        .finally(() => setIsLoadingSejour(false))
    } else {
      setSejourResume(null)
    }
  }, [watchedSejourId, isModalOpen, editingPaiement, setValue])

  // Chargement des paiements
  const loadPaiements = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const params = {
        page: currentPage,
        page_size: pageSize,
      }
      if (filterStatut) params.statut = filterStatut
      if (filterMode) params.mode_paiement = filterMode
      if (filterSejour.trim()) params.sejour = filterSejour.trim()
      if (searchQuery.trim()) params.search = searchQuery.trim()

      const res = await paiementsApi.getAll(params)
      if (res.data?.results) {
        setPaiements(res.data.results)
        setTotalCount(res.data.count)
      } else if (Array.isArray(res.data)) {
        setPaiements(res.data)
        setTotalCount(res.data.length)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, filterStatut, filterMode, filterSejour, searchQuery])

  useEffect(() => {
    loadPaiements()
  }, [loadPaiements])

  // Ouvrir modal création
  const handleOpenCreate = () => {
    setEditingPaiement(null)
    setSejourResume(null)
    const premierActif = employesList.find((e) => e.statut === 'ACTIF')
    reset({
      sejour: filterSejour || '1',
      employe: premierActif ? premierActif.id_employe : '',
      montant: '',
      mode_paiement: 'CARTE_BANCAIRE',
      statut: 'EN_ATTENTE',
      reference_paiement: '',
      date_paiement: new Date().toISOString().slice(0, 16),
    })
    setIsModalOpen(true)
  }

  // Ouvrir modal édition (uniquement si NON VALIDE)
  const handleOpenEdit = (paiement) => {
    if (paiement.statut === 'VALIDE') {
      toast.warning("Un paiement validé ne peut pas être modifié. Seul un remboursement est autorisé.")
      return
    }
    setEditingPaiement(paiement)
    const dateFormatted = paiement.date_paiement
      ? new Date(paiement.date_paiement).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)

    reset({
      sejour: paiement.sejour,
      employe: paiement.employe,
      montant: paiement.montant,
      mode_paiement: paiement.mode_paiement,
      statut: paiement.statut,
      reference_paiement: paiement.reference_paiement || '',
      date_paiement: dateFormatted,
    })
    setIsModalOpen(true)
  }

  // Soumission
  const onSubmit = async (data) => {
    try {
      const payload = {
        sejour: parseInt(data.sejour, 10),
        employe: parseInt(data.employe, 10),
        montant: parseFloat(data.montant).toFixed(2),
        mode_paiement: data.mode_paiement,
        statut: data.statut,
        date_paiement: data.date_paiement ? new Date(data.date_paiement).toISOString() : new Date().toISOString(),
      }
      if (data.reference_paiement && data.reference_paiement.trim()) {
        payload.reference_paiement = data.reference_paiement.trim()
      }

      if (editingPaiement) {
        await paiementsApi.update(editingPaiement.id_paiement, payload)
        toast.success(`Le paiement ${editingPaiement.reference_paiement} a été mis à jour.`)
      } else {
        const res = await paiementsApi.create(payload)
        toast.success(`Paiement enregistré avec succès (${res.data.reference_paiement}).`)
      }

      setIsModalOpen(false)
      loadPaiements()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Exécution d'actions (Valider / Rembourser / Supprimer)
  const handleExecuteAction = async () => {
    const { action, paiement } = actionConfirm
    if (!action || !paiement) return

    try {
      setActionConfirm((prev) => ({ ...prev, isLoading: true }))

      if (action === 'valider') {
        await paiementsApi.valider(paiement.id_paiement)
        toast.success(`Le paiement ${paiement.reference_paiement} (${formatMoney(paiement.montant)}) a été VALIDÉ.`)
      } else if (action === 'rembourser') {
        await paiementsApi.rembourser(paiement.id_paiement)
        toast.success(`Le paiement ${paiement.reference_paiement} a été REMBOURSÉ.`)
      } else if (action === 'supprimer') {
        await paiementsApi.delete(paiement.id_paiement)
        toast.success(`Paiement ${paiement.reference_paiement} supprimé.`)
      }

      setActionConfirm({ isOpen: false, action: null, paiement: null, isLoading: false })
      loadPaiements()
    } catch (err) {
      toast.error(err.message)
      setActionConfirm({ isOpen: false, action: null, paiement: null, isLoading: false })
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#1d9a8a]" />
            <h1 className="text-2xl font-bold text-slate-800">Gestion des Paiements</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Enregistrez les règlements des séjours, validez les encaissements ou traitez les remboursements.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1d9a8a] hover:bg-[#167d70] text-white font-medium rounded-xl shadow-sm transition-colors text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Encaisser un Paiement
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Recherche par référence ou nom employé */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par référence (PAY-...) ou employé..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
          />
        </div>

        {/* Filtre Statut */}
        <div className="w-full md:w-48">
          <select
            value={filterStatut}
            onChange={(e) => {
              setFilterStatut(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUT_PAIEMENT_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Mode de paiement */}
        <div className="w-full md:w-48">
          <select
            value={filterMode}
            onChange={(e) => {
              setFilterMode(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
          >
            <option value="">Tous les modes</option>
            {Object.entries(MODE_PAIEMENT_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Séjour */}
        <div className="w-full md:w-36">
          <input
            type="number"
            placeholder="Séjour #..."
            value={filterSejour}
            onChange={(e) => {
              setFilterSejour(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
          />
        </div>

        {(filterStatut || filterMode || filterSejour || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setFilterStatut('')
              setFilterMode('')
              setFilterSejour('')
              setSearchQuery('')
              setCurrentPage(1)
            }}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-end md:self-auto"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Tableau des paiements */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner full text="Chargement des paiements..." />
        ) : paiements.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">Aucun paiement trouvé</p>
            <p className="text-sm text-slate-500 mt-1">
              Modifiez vos critères de recherche ou enregistrez un premier paiement.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Référence</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Séjour</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4 text-right">Montant</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4">Enregistré par</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paiements.map((p) => {
                  const isValide = p.statut === 'VALIDE'
                  const isEnAttente = p.statut === 'EN_ATTENTE'

                  return (
                    <tr key={p.id_paiement} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-xs">
                        {p.reference_paiement}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(p.date_paiement, true)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          Séjour #{p.sejour}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {p.mode_paiement_display || MODE_PAIEMENT_LABELS[p.mode_paiement] || p.mode_paiement}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-base">
                        {formatMoney(p.montant)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={p.statut} type="paiement" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {p.employe_nom_complet || `Employé #${p.employe}`}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                        {/* Bouton Valider pour paiement en attente */}
                        {isEnAttente && (
                          <button
                            type="button"
                            onClick={() =>
                              setActionConfirm({
                                isOpen: true,
                                action: 'valider',
                                paiement: p,
                                isLoading: false,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                            title="Valider l'encaissement"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Valider
                          </button>
                        )}

                        {/* Bouton Rembourser pour paiement validé */}
                        {isValide && (
                          <button
                            type="button"
                            onClick={() =>
                              setActionConfirm({
                                isOpen: true,
                                action: 'rembourser',
                                paiement: p,
                                isLoading: false,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                            title="Rembourser ce montant"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Rembourser
                          </button>
                        )}

                        {/* Si validé, afficher un cadenas indiquant non modifiable */}
                        {isValide ? (
                          <span
                            className="inline-block p-1 text-slate-300"
                            title="Paiement validé (verrouillé contre modification/suppression)"
                          >
                            <Lock className="w-4 h-4 inline" />
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-slate-500 hover:text-[#1d9a8a] hover:bg-slate-100 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setActionConfirm({
                                  isOpen: true,
                                  action: 'supprimer',
                                  paiement: p,
                                  isLoading: false,
                                })
                              }
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
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

      {/* Modal Formulaire Paiement */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPaiement ? `Modifier le paiement ${editingPaiement.reference_paiement}` : 'Enregistrer un nouveau paiement'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Numéro Séjour *
              </label>
              <input
                type="number"
                min="1"
                {...register('sejour', { required: 'Le numéro du séjour est obligatoire' })}
                placeholder="Ex: 1"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              />
              {errors.sejour && <span className="text-xs text-rose-600 mt-1">{errors.sejour.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Employé encaisseur *
              </label>
              <select
                {...register('employe', { required: 'L\'employé est obligatoire' })}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              >
                <option value="">Sélectionner un employé...</option>
                {employesList.map((e) => (
                  <option
                    key={e.id_employe}
                    value={e.id_employe}
                    disabled={e.statut !== 'ACTIF'}
                  >
                    {e.nom} {e.prenom} ({e.poste_display || e.poste}) {e.statut !== 'ACTIF' ? `— [${e.statut_display}]` : ''}
                  </option>
                ))}
              </select>
              {errors.employe && <span className="text-xs text-rose-600 mt-1">{errors.employe.message}</span>}
            </div>
          </div>

          {/* Carte récapitulative du reste à payer du séjour */}
          {isLoadingSejour ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              Calcul du solde du séjour #{watchedSejourId}...
            </div>
          ) : sejourResume ? (
            <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 text-xs text-teal-900 flex justify-between items-center">
              <div>
                <span className="font-semibold">Situation du Séjour #{sejourResume.sejour_id} :</span>
                <div>Total prestations : {formatMoney(sejourResume.total_du)} | Déjà réglé : {formatMoney(sejourResume.total_paye)}</div>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase font-bold text-teal-700">Reste à payer :</span>
                <div className="text-base font-extrabold text-teal-800">
                  {formatMoney(sejourResume.reste_a_payer)}
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Montant du versement (MAD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...register('montant', {
                  required: 'Le montant est obligatoire',
                  min: { value: 0.01, message: 'Le montant doit être > 0 MAD' },
                })}
                placeholder="Ex: 500.00"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              />
              {errors.montant && <span className="text-xs text-rose-600 mt-1">{errors.montant.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Moyen de paiement *
              </label>
              <select
                {...register('mode_paiement', { required: 'Le mode de paiement est obligatoire' })}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              >
                {Object.entries(MODE_PAIEMENT_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Statut initial
              </label>
              <select
                {...register('statut')}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              >
                <option value="EN_ATTENTE">En attente</option>
                <option value="VALIDE">Validé immédiatement</option>
                <option value="REFUSE">Refusé</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Référence transactionnelle
              </label>
              <input
                type="text"
                {...register('reference_paiement')}
                placeholder="Auto-générée si laissée vide"
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Format auto : PAY-AAAAMMJJ-XXXX</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Date & Heure d'encaissement
            </label>
            <input
              type="datetime-local"
              {...register('date_paiement')}
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
              {editingPaiement ? 'Mettre à jour' : 'Enregistrer le paiement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation des Actions (Valider, Rembourser, Supprimer) */}
      <ConfirmDialog
        isOpen={actionConfirm.isOpen}
        onClose={() => setActionConfirm({ isOpen: false, action: null, paiement: null, isLoading: false })}
        onConfirm={handleExecuteAction}
        title={
          actionConfirm.action === 'valider'
            ? 'Valider le paiement ?'
            : actionConfirm.action === 'rembourser'
            ? 'Rembourser ce paiement ?'
            : 'Supprimer ce paiement ?'
        }
        message={
          actionConfirm.action === 'valider' ? (
            `Confirmez-vous la validation de l'encaissement ${actionConfirm.paiement?.reference_paiement} d'un montant de ${formatMoney(actionConfirm.paiement?.montant)} pour le Séjour #${actionConfirm.paiement?.sejour} ? Une fois validé, il ne pourra plus être modifié.`
          ) : actionConfirm.action === 'rembourser' ? (
            `Confirmez-vous le REMBOURSEMENT du paiement ${actionConfirm.paiement?.reference_paiement} (${formatMoney(actionConfirm.paiement?.montant)}) ? Ce montant sera réintégré dans le reste à payer du Séjour #${actionConfirm.paiement?.sejour}.`
          ) : (
            `Confirmez-vous la suppression du paiement ${actionConfirm.paiement?.reference_paiement} ?`
          )
        }
        confirmText={
          actionConfirm.action === 'valider'
            ? 'Valider le paiement'
            : actionConfirm.action === 'rembourser'
            ? 'Confirmer le remboursement'
            : 'Supprimer'
        }
        type={actionConfirm.action === 'valider' ? 'success' : actionConfirm.action === 'rembourser' ? 'warning' : 'danger'}
        isLoading={actionConfirm.isLoading}
      />
    </div>
  )
}

export default PaiementsPage
