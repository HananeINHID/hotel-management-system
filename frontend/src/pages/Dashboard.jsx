import { useEffect, useState } from 'react'
import { getHealth } from '../services/api.js'

function Dashboard() {
  const [apiStatus, setApiStatus] = useState('Verification de l API...')

  useEffect(() => {
    getHealth()
      .then((data) => {
        setApiStatus(`API Django: ${data.status} - ${data.message}`)
      })
      .catch(() => {
        setApiStatus('API Django indisponible. Demarrez le backend pour tester la connexion.')
      })
  }, [])

  return (
    <section className="page-card">
      <h1>Tableau de bord</h1>
      <p>Vue d'ensemble du Hotel Management System. Les modules metier seront ajoutes ensuite.</p>
      <p className="api-status">{apiStatus}</p>
    </section>
  )
}

export default Dashboard
