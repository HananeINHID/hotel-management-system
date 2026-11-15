import apiClient from './client'

export const servicesApi = {
  getAll: (params = {}) => apiClient.get('/services/', { params }),
  get: (id) => apiClient.get(`/services/${id}/`),
  create: (data) => apiClient.post('/services/', data),
  update: (id, data) => apiClient.put(`/services/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/services/${id}/`, data),
  delete: (id) => apiClient.delete(`/services/${id}/`),
}

export const consommationsApi = {
  getAll: (params = {}) => apiClient.get('/consommations/', { params }),
  get: (id) => apiClient.get(`/consommations/${id}/`),
  create: (data) => apiClient.post('/consommations/', data),
  update: (id, data) => apiClient.put(`/consommations/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/consommations/${id}/`, data),
  delete: (id) => apiClient.delete(`/consommations/${id}/`),
}

export const paiementsApi = {
  getAll: (params = {}) => apiClient.get('/paiements/', { params }),
  get: (id) => apiClient.get(`/paiements/${id}/`),
  create: (data) => apiClient.post('/paiements/', data),
  update: (id, data) => apiClient.put(`/paiements/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/paiements/${id}/`, data),
  delete: (id) => apiClient.delete(`/paiements/${id}/`),
  valider: (id, data = {}) => apiClient.post(`/paiements/${id}/valider/`, data),
  rembourser: (id, data = {}) => apiClient.post(`/paiements/${id}/rembourser/`, data),
}

export const employesApi = {
  getAll: (params = {}) => apiClient.get('/employes/', { params }),
  get: (id) => apiClient.get(`/employes/${id}/`),
  create: (data) => apiClient.post('/employes/', data),
  update: (id, data) => apiClient.put(`/employes/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/employes/${id}/`, data),
  delete: (id) => apiClient.delete(`/employes/${id}/`),
  changerStatut: (id, statut) => apiClient.post(`/employes/${id}/changer-statut/`, { statut }),
}


export const sejoursApi = {
  getAll: (params = {}) => apiClient.get('/sejours/', { params }),

  get: (id) => apiClient.get(`/sejours/${id}/`),

  // Réservations confirmées et chambres disponibles pour le check-in
  getArrivees: (params = {}) =>
    apiClient.get('/sejours/arrivees/', { params }),

  // Création du séjour à partir d'une association réservation-chambre
  checkIn: (data) => apiClient.post('/sejours/check-in/', data),

  // Enregistrement du départ réel
  checkOut: (id) =>
    apiClient.post(`/sejours/${id}/check-out/`),

  // Archivage d'un séjour terminé
  archive: (id) =>
    apiClient.post(`/sejours/${id}/archiver/`),

  // Restauration d'un séjour archivé
  unarchive: (id) =>
    apiClient.post(`/sejours/${id}/desarchiver/`),

  getResumeFinancier: (id) =>
    apiClient.get(`/sejours/${id}/resume-financier/`),
}
export const reservationsApi = {
  getAll: (params = {}) => apiClient.get('/reservations/', { params }),
  get: (id) => apiClient.get(`/reservations/${id}/`),
  create: (data) => apiClient.post('/reservations/', data),
  update: (id, data) => apiClient.patch(`/reservations/${id}/`, data),
  delete: (id) => apiClient.delete(`/reservations/${id}/`),
  confirmer: (id) => apiClient.post(`/reservations/${id}/confirmer/`),
  annuler: (id) => apiClient.post(`/reservations/${id}/annuler/`),
  terminer: (id) => apiClient.post(`/reservations/${id}/terminer/`),
  getDisponibilites: (params = {}) =>
    apiClient.get('/reservations/disponibilites/', { params }),
}
export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats/'),
}

// Module Membre 2 : Chambres & Maintenances
export {
  categoriesChambresAPI,
  chambresAPI,
  maintenancesAPI,
} from '../services/chambresMaintenances'

// Module Safae : Clients & Avis
export { clientsApi, avisApi } from './clientsAvis'
