import { Menu, Home } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { navItems } from './navItems.js'

function Navbar({ onMenuClick }) {
  const location = useLocation()
  const current = navItems.find((item) => {
    if (item.path === '/app') {
      return (
        location.pathname === '/app' ||
        location.pathname === '/dashboard' ||
        location.pathname === '/app/dashboard'
      )
    }
    return (
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`) ||
      location.pathname === `/app${item.path}` ||
      location.pathname.startsWith(`/app${item.path}/`)
    )
  })

  return (
    <header className="navbar">
      <button type="button" className="menu-button" onClick={onMenuClick} aria-label="Ouvrir le menu">
        <Menu size={20} />
      </button>
      <div className="flex-1">
        <p className="navbar-kicker">Riad Atlas — Espace de gestion</p>
        <h2>{current?.label || 'Tableau de bord'}</h2>
      </div>
      {/* Lien retour vers l'accueil public */}
      <Link
        to="/"
        className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-vert-profond bg-sable hover:bg-dore/30 border border-dore/50 transition-colors"
        title="Retourner à l'accueil public"
      >
        <Home size={14} />
        Accueil public
      </Link>
    </header>
  )
}

export default Navbar
