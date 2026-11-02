import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { navItems } from './navItems.js'

function Navbar({ onMenuClick }) {
  const location = useLocation()
  const current = navItems.find((item) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path),
  )

  return (
    <header className="navbar">
      <button type="button" className="menu-button" onClick={onMenuClick}>
        <Menu size={20} />
      </button>
      <div>
        <p className="navbar-kicker">Hotel Management System</p>
        <h2>{current?.label || 'Tableau de bord'}</h2>
      </div>
    </header>
  )
}

export default Navbar
