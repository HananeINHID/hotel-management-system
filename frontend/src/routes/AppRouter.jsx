import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import AvisPage from '../pages/AvisPage.jsx'
import ChambresPage from '../pages/ChambresPage.jsx'
import ClientsPage from '../pages/ClientsPage.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import EmployesPage from '../pages/EmployesPage.jsx'
import MaintenancesPage from '../pages/MaintenancesPage.jsx'
import PaiementsPage from '../pages/PaiementsPage.jsx'
import ReservationsPage from '../pages/ReservationsPage.jsx'
import SejoursPage from '../pages/SejoursPage.jsx'
import ServicesPage from '../pages/ServicesPage.jsx'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/avis" element={<AvisPage />} />
          <Route path="/chambres" element={<ChambresPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/sejours" element={<SejoursPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/paiements" element={<PaiementsPage />} />
          <Route path="/employes" element={<EmployesPage />} />
          <Route path="/maintenances" element={<MaintenancesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
