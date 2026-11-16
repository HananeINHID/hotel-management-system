import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import { ToastProvider } from '../hooks/useToast.jsx'

// Landing page publique
import HomePage from '../pages/home/HomePage.jsx'

// Pages de Karima
import Dashboard from '../pages/Dashboard.jsx'
import ServicesPage from '../pages/ServicesPage.jsx'
import ConsommationsPage from '../pages/ConsommationsPage.jsx'
import PaiementsPage from '../pages/PaiementsPage.jsx'
import EmployesPage from '../pages/EmployesPage.jsx'
import ResumeFinancierPage from '../pages/ResumeFinancierPage.jsx'

// Pages des autres membres de l'équipe (Safae, Hanane, Salma, Hmza)
import ClientsPage from '../pages/ClientsPage.jsx'
import AvisPage from '../pages/AvisPage.jsx'
import ChambresPage from '../pages/ChambresPage.jsx'
import ReservationsPage from '../pages/ReservationsPage.jsx'
import SejoursPage from '../pages/SejoursPage.jsx'
import MaintenancesPage from '../pages/MaintenancesPage.jsx'

function AppRouter() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* ─── Page d'accueil publique — sans Layout de gestion ─── */}
          <Route path="/" element={<HomePage />} />

          {/* ─── Espace de gestion — avec Layout (Sidebar + Navbar) ─── */}
          <Route element={<Layout />}>
            {/* Tableau de bord accessible via /app ou /dashboard */}
            <Route path="/app" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/app/dashboard" element={<Dashboard />} />

            {/* Routes directes existantes (compatibilité intégrale) */}
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/consommations" element={<ConsommationsPage />} />
            <Route path="/paiements" element={<PaiementsPage />} />
            <Route path="/employes" element={<EmployesPage />} />
            <Route path="/resume-financier" element={<ResumeFinancierPage />} />
            <Route path="/sejours/:id/finance" element={<ResumeFinancierPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/avis" element={<AvisPage />} />
            <Route path="/chambres" element={<ChambresPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/sejours" element={<SejoursPage />} />
            <Route path="/maintenances" element={<MaintenancesPage />} />

            {/* Routes préfixées /app/... (compatibilité miroir) */}
            <Route path="/app/services" element={<ServicesPage />} />
            <Route path="/app/consommations" element={<ConsommationsPage />} />
            <Route path="/app/paiements" element={<PaiementsPage />} />
            <Route path="/app/employes" element={<EmployesPage />} />
            <Route path="/app/resume-financier" element={<ResumeFinancierPage />} />
            <Route path="/app/sejours/:id/finance" element={<ResumeFinancierPage />} />
            <Route path="/app/clients" element={<ClientsPage />} />
            <Route path="/app/avis" element={<AvisPage />} />
            <Route path="/app/chambres" element={<ChambresPage />} />
            <Route path="/app/reservations" element={<ReservationsPage />} />
            <Route path="/app/sejours" element={<SejoursPage />} />
            <Route path="/app/maintenances" element={<MaintenancesPage />} />
          </Route>

          {/* Redirection fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default AppRouter
