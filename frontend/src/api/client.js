import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Intercepteur de réponse pour formater les erreurs de manière claire
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = "Une erreur imprévue est survenue."

    if (error.response) {
      const data = error.response.data
      if (typeof data === 'string') {
        friendlyMessage = data
      } else if (data?.detail) {
        friendlyMessage = data.detail
      } else if (data?.errors && typeof data.errors === 'object') {
        const firstKey = Object.keys(data.errors)[0]
        const val = data.errors[firstKey]
        friendlyMessage = Array.isArray(val) ? `${firstKey}: ${val[0]}` : `${firstKey}: ${val}`
      } else if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0]
        const val = data[firstKey]
        friendlyMessage = Array.isArray(val) ? `${firstKey}: ${val[0]}` : `${firstKey}: ${val}`
      }
    } else if (error.request) {
      friendlyMessage = "Impossible de joindre le serveur Django (127.0.0.1:8000). Vérifiez que le backend est lancé."
    }

    const enhancedError = new Error(friendlyMessage)
    enhancedError.response = error.response
    enhancedError.status = error.response?.status
    enhancedError.data = error.response?.data
    return Promise.reject(enhancedError)
  }
)

export default apiClient
