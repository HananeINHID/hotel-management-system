import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from '../pages/Dashboard.jsx'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
