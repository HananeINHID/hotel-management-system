/**
 * Service API pour les modules Chambres et Maintenances.
 * Consomme les endpoints Django REST Framework.
 */
import apiClient from '../api/client.js'

// ─────────────────────────────────────────
// CATÉGORIES DE CHAMBRES
// ─────────────────────────────────────────

export const categoriesChambresAPI = {
  /** Liste toutes les catégories (avec search et ordering). */
  list: (params = {}) =>
    apiClient.get('/categories-chambres/', { params }).then((r) => r.data),

  /** Récupère une catégorie par son ID. */
  get: (id) => apiClient.get(`/categories-chambres/${id}/`).then((r) => r.data),

  /** Crée une nouvelle catégorie. */
  create: (data) => apiClient.post('/categories-chambres/', data).then((r) => r.data),

  /** Met à jour une catégorie (PUT complet). */
  update: (id, data) =>
    apiClient.put(`/categories-chambres/${id}/`, data).then((r) => r.data),

  /** Mise à jour partielle d'une catégorie (PATCH). */
  patch: (id, data) =>
    apiClient.patch(`/categories-chambres/${id}/`, data).then((r) => r.data),

  /** Supprime une catégorie. */
  delete: (id) => apiClient.delete(`/categories-chambres/${id}/`).then((r) => r.data),
}

// ─────────────────────────────────────────
// CHAMBRES
// ─────────────────────────────────────────

export const chambresAPI = {
  /**
   * Liste les chambres avec filtres et pagination.
   * Params supportés : page, search, categorie, etage, etat_physique, ordering
   */
  list: (params = {}) =>
    apiClient.get('/chambres/', { params }).then((r) => r.data),

  /** Récupère une chambre par son ID. */
  get: (id) => apiClient.get(`/chambres/${id}/`).then((r) => r.data),

  /** Crée une nouvelle chambre. */
  create: (data) => apiClient.post('/chambres/', data).then((r) => r.data),

  /** Met à jour une chambre (PUT complet). */
  update: (id, data) => apiClient.put(`/chambres/${id}/`, data).then((r) => r.data),

  /** Mise à jour partielle d'une chambre. */
  patch: (id, data) => apiClient.patch(`/chambres/${id}/`, data).then((r) => r.data),

  /** Supprime une chambre. */
  delete: (id) => apiClient.delete(`/chambres/${id}/`).then((r) => r.data),

  /**
   * Change l'état physique d'une chambre.
   * @param {number} id
   * @param {'disponible'|'en_maintenance'|'hors_service'} etat
   */
  changerEtat: (id, etat) =>
    apiClient
      .patch(`/chambres/${id}/changer-etat/`, { etat_physique: etat })
      .then((r) => r.data),

  /**
   * Vérifie la disponibilité d'une chambre sur une période.
   * @param {number} id
   * @param {string} dateDebut - format YYYY-MM-DD
   * @param {string} dateFin   - format YYYY-MM-DD
   */
  verifierDisponibilite: (id, dateDebut, dateFin) =>
    apiClient
      .get(`/chambres/${id}/disponibilite/`, {
        params: { date_debut: dateDebut, date_fin: dateFin },
      })
      .then((r) => r.data),

  /**
   * Retourne toutes les chambres disponibles sur une période.
   * @param {string} dateDebut - format YYYY-MM-DD
   * @param {string} dateFin   - format YYYY-MM-DD
   */
  listerDisponibles: (dateDebut, dateFin) =>
    apiClient
      .get('/chambres/disponibles/', {
        params: { date_debut: dateDebut, date_fin: dateFin },
      })
      .then((r) => r.data),
}

// ─────────────────────────────────────────
// MAINTENANCES
// ─────────────────────────────────────────

export const maintenancesAPI = {
  /**
   * Liste les maintenances avec filtres et pagination.
   * Params supportés : page, search, chambre, statut, type, bloquante,
   *                    employe, debut_apres, debut_avant, ordering
   */
  list: (params = {}) =>
    apiClient.get('/maintenances/', { params }).then((r) => r.data),

  /** Récupère une maintenance par son ID. */
  get: (id) => apiClient.get(`/maintenances/${id}/`).then((r) => r.data),

  /** Crée une nouvelle maintenance. */
  create: (data) => apiClient.post('/maintenances/', data).then((r) => r.data),

  /** Met à jour une maintenance (PUT complet). */
  update: (id, data) =>
    apiClient.put(`/maintenances/${id}/`, data).then((r) => r.data),

  /** Mise à jour partielle d'une maintenance. */
  patch: (id, data) =>
    apiClient.patch(`/maintenances/${id}/`, data).then((r) => r.data),

  /** Supprime une maintenance (uniquement si ANNULEE ou PLANIFIEE). */
  delete: (id) => apiClient.delete(`/maintenances/${id}/`).then((r) => r.data),

  /**
   * Change le statut d'une maintenance.
   * @param {number} id
   * @param {'planifiee'|'en_cours'|'terminee'|'annulee'} statut
   */
  changerStatut: (id, statut) =>
    apiClient
      .patch(`/maintenances/${id}/changer-statut/`, { statut })
      .then((r) => r.data),

  /**
   * Récupère l'historique des maintenances pour une chambre donnée.
   * @param {number} chambreId
   */
  historiqueChambre: (chambreId) =>
    apiClient
      .get(`/maintenances/chambre/${chambreId}/historique/`)
      .then((r) => r.data),
}
