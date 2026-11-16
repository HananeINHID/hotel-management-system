import { Hotel } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { navItems } from './navItems.js'

function Sidebar({ open, onNavigate }) {
  const location = useLocation()

  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <div className="sidebar-brand">
        <Hotel size={22} />
        <div>
          <strong>Riad Atlas</strong>
          <span>Espace de gestion</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const isItemActive =
            item.path === '/app'
              ? location.pathname === '/app' ||
                location.pathname === '/dashboard' ||
                location.pathname === '/app/dashboard'
              : location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`) ||
                location.pathname === `/app${item.path}` ||
                location.pathname.startsWith(`/app${item.path}/`)

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-link${isItemActive ? ' is-active' : ''}`}
              onClick={onNavigate}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
