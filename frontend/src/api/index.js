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
  getResumeFinancier: (id) => apiClient.get(`/sejours/${id}/resume-financier/`),
}

export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats/'),
}
