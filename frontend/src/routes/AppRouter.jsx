import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import { ToastProvider } from '../hooks/useToast.jsx'

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
          <Route element={<Layout />}>
            {/* Tableau de bord */}
            <Route path="/" element={<Dashboard />} />

            {/* Pages de Karima */}
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/consommations" element={<ConsommationsPage />} />
            <Route path="/paiements" element={<PaiementsPage />} />
            <Route path="/employes" element={<EmployesPage />} />
            <Route path="/resume-financier" element={<ResumeFinancierPage />} />
            <Route path="/sejours/:id/finance" element={<ResumeFinancierPage />} />

            {/* Pages des autres membres */}
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/avis" element={<AvisPage />} />
            <Route path="/chambres" element={<ChambresPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/sejours" element={<SejoursPage />} />
            <Route path="/maintenances" element={<MaintenancesPage />} />

            {/* Redirection fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default AppRouter
