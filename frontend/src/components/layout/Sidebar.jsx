import { Hotel } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navItems } from './navItems.js'

function Sidebar({ open, onNavigate }) {
  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <div className="sidebar-brand">
        <Hotel size={22} />
        <div>
          <strong>Hotel MS</strong>
          <span>Gestion hoteliere</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-link${isActive ? ' is-active' : ''}`
              }
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
