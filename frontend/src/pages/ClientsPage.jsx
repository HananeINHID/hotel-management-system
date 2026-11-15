import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, Edit2, Trash2, Users, History } from 'lucide-react'
import { clientsApi } from '../api'
import { useToast } from '../hooks/useToast'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Pagination } from '../components/common/Pagination'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Alert } from '../components/common/Alert'
import { ClientHistoryModal } from '../components/clients/ClientHistoryModal'

const EMPTY = { nom: '', prenom: '', piece_identite: '', telephone: '', email: '', nationalite: '' }
const INPUT = 'w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]'
const LABEL = 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1'

function ClientsPage() {
  const toast = useToast()
  const [clients, setClients] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [historyId, setHistoryId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, client: null, isDeleting: false })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY })

  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const params = { page: currentPage }
      if (searchQuery.trim()) params.search = searchQuery.trim()
      const res = await clientsApi.getAll(params)
      if (res.data?.results) {
        setClients(res.data.results)
        setTotalCount(res.data.count)
      } else if (Array.isArray(res.data)) {
        setClients(res.data)
        setTotalCount(res.data.length)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery])

  useEffect(() => {
    const t = setTimeout(loadClients, 250) // évite un appel API à chaque frappe
    return () => clearTimeout(t)
  }, [loadClients])

  const handleOpenCreate = () => {
    setEditingClient(null)
    reset(EMPTY)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (client) => {
    setEditingClient(client)
    reset({
      nom: client.nom,
      prenom: client.prenom,
      piece_identite: client.piece_identite,
      telephone: client.telephone || '',
      email: client.email || '',
      nationalite: client.nationalite || '',
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      if (editingClient) {
        await clientsApi.update(editingClient.id_client, data)
        toast.success(`Le client ${data.prenom} ${data.nom} a été mis à jour.`)
      } else {
        await clientsApi.create(data)
        toast.success(`Le client ${data.prenom} ${data.nom} a été créé.`)
      }
      setIsModalOpen(false)
      loadClients()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.client) return
    try {
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }))
      await clientsApi.delete(deleteConfirm.client.id_client)
      toast.success(`Client ${deleteConfirm.client.nom_complet} supprimé.`)
      setDeleteConfirm({ isOpen: false, client: null, isDeleting: false })
      loadClients()
    } catch (err) {
      toast.error(err.message) // ex. 409 : le client a des avis
      setDeleteConfirm({ isOpen: false, client: null, isDeleting: false })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#1d9a8a]" />
            <h1 className="text-2xl font-bold text-slate-800">Clients</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Gérez les fiches clients de l'hôtel et consultez l'historique de chacun.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1d9a8a] hover:bg-[#167d70] text-white font-medium rounded-xl shadow-sm transition-colors text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouveau client
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, pièce d'identité, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner full text="Chargement des clients..." />
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">Aucun client trouvé</p>
            <p className="text-sm mt-1">Modifiez votre recherche ou ajoutez un premier client.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Pièce d'identité</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Nationalité</th>
                  <th className="py-3.5 px-4 text-center">Avis</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((c) => (
                  <tr key={c.id_client} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">{c.nom_complet}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.piece_identite}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{c.telephone || '—'}</div>
                      <div className="text-xs text-slate-400">{c.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{c.nationalite || '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                        {c.nb_avis}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setHistoryId(c.id_client)}
                        className="p-1.5 text-slate-500 hover:text-[#1d9a8a] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Voir l'historique"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-500 hover:text-[#1d9a8a] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Modifier le client"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ isOpen: true, client: c, isDeleting: false })}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Supprimer le client"
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
        title={editingClient ? 'Modifier le client' : 'Ajouter un nouveau client'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Nom *</label>
              <input type="text" {...register('nom', { required: 'Le nom est obligatoire' })} className={INPUT} />
              {errors.nom && <span className="text-xs text-rose-600 mt-1">{errors.nom.message}</span>}
            </div>
            <div>
              <label className={LABEL}>Prénom *</label>
              <input type="text" {...register('prenom', { required: 'Le prénom est obligatoire' })} className={INPUT} />
              {errors.prenom && <span className="text-xs text-rose-600 mt-1">{errors.prenom.message}</span>}
            </div>
          </div>

          <div>
            <label className={LABEL}>Pièce d'identité (CIN / passeport) *</label>
            <input
              type="text"
              {...register('piece_identite', { required: "La pièce d'identité est obligatoire" })}
              placeholder="Ex: AB123456"
              className={INPUT}
            />
            {errors.piece_identite && (
              <span className="text-xs text-rose-600 mt-1">{errors.piece_identite.message}</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Téléphone *</label>
              <input
                type="text"
                {...register('telephone', {
                  required: 'Le téléphone est obligatoire',
                  pattern: { value: /^\+?[0-9 .\-()]{6,20}$|^$/, message: 'Numéro invalide' },
                })}
                placeholder="+212 6 12 34 56 78"
                className={INPUT}
              />
              {errors.telephone && <span className="text-xs text-rose-600 mt-1">{errors.telephone.message}</span>}
            </div>
            <div>
              <label className={LABEL}>Email</label>
              <input
                type="email"
                {...register('email')}
                placeholder="nom@exemple.com"
                className={INPUT}
              />
            </div>
          </div>

          <div>
            <label className={LABEL}>Nationalité</label>
            <input type="text" {...register('nationalite')} placeholder="Ex: Marocaine" className={INPUT} />
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
              {editingClient ? 'Enregistrer les modifications' : 'Créer le client'}
            </button>
          </div>
        </form>
      </Modal>

      <ClientHistoryModal clientId={historyId} onClose={() => setHistoryId(null)} />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, client: null, isDeleting: false })}
        onConfirm={confirmDelete}
        title="Supprimer ce client ?"
        message={
          deleteConfirm.client?.nb_avis > 0
            ? `${deleteConfirm.client.nom_complet} a déposé ${deleteConfirm.client.nb_avis} avis : la suppression sera refusée par l'API (409). Supprimez d'abord ses avis.`
            : `Voulez-vous vraiment supprimer définitivement ${deleteConfirm.client?.nom_complet} ? Cette action est irréversible.`
        }
        confirmText="Confirmer la suppression"
        type="danger"
        isLoading={deleteConfirm.isDeleting}
      />
    </div>
  )
}

export default ClientsPage
