import apiClient from './client'

// Module Safae : Clients & Avis
export const clientsApi = {
  getAll: (params = {}) => apiClient.get('/clients/', { params }),
  get: (id) => apiClient.get(`/clients/${id}/`),
  create: (data) => apiClient.post('/clients/', data),
  update: (id, data) => apiClient.put(`/clients/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/clients/${id}/`, data),
  delete: (id) => apiClient.delete(`/clients/${id}/`),
  getHistorique: (id) => apiClient.get(`/clients/${id}/historique/`),
}

export const avisApi = {
  getAll: (params = {}) => apiClient.get('/avis/', { params }),
  get: (id) => apiClient.get(`/avis/${id}/`),
  create: (data) => apiClient.post('/avis/', data),
  update: (id, data) => apiClient.put(`/avis/${id}/`, data),
  partialUpdate: (id, data) => apiClient.patch(`/avis/${id}/`, data),
  delete: (id) => apiClient.delete(`/avis/${id}/`),
  getStatistiques: () => apiClient.get('/avis/statistiques/'),
}
