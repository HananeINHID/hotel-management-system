import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Hotel } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Accueil', href: '#accueil' },
  { label: 'Notre Riad', href: '#notre-riad' },
  { label: 'Chambres', href: '#chambres' },
  { label: 'Services', href: '#services' },
  { label: 'Galerie', href: '#galerie' },
  { label: 'Contact', href: '#contact' },
]

function HomeNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fermer menu mobile si on clique un lien
  const handleNavClick = (href) => {
    setMobileOpen(false)
    // Scroll fluide vers la section
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-vert-profond/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
      role="banner"
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20"
        aria-label="Navigation principale"
      >
        {/* Logo */}
        <a
          href="#accueil"
          onClick={(e) => { e.preventDefault(); handleNavClick('#accueil') }}
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dore rounded"
          aria-label="Riad Atlas — Retour à l'accueil"
        >
          <div className="w-8 h-8 rounded-full bg-dore/20 border border-dore/40 flex items-center justify-center group-hover:bg-dore/30 transition-colors">
            <Hotel size={16} className="text-dore" aria-hidden="true" />
          </div>
          <div className="leading-none">
            <span className="font-display text-xl font-semibold text-creme tracking-wide block">
              RIAD ATLAS
            </span>
            <span className="text-[9px] tracking-[0.2em] text-dore/80 uppercase block font-sans">
              Marrakech
            </span>
          </div>
        </a>

        {/* Liens desktop */}
        <ul className="hidden md:flex items-center gap-6" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href) }}
                className="text-sm font-medium text-creme/80 hover:text-dore transition-colors tracking-wide relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dore rounded"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-dore group-hover:w-full transition-all duration-300" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>

        {/* Bouton Espace de gestion */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border border-dore text-dore hover:bg-dore hover:text-vert-profond transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dore"
          >
            Espace de gestion
          </Link>
        </div>

        {/* Burger mobile */}
        <button
          type="button"
          className="md:hidden text-creme hover:text-dore transition-colors p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dore rounded"
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Menu mobile */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-vert-profond/98 backdrop-blur-md border-t border-dore/20"
          role="dialog"
          aria-modal="true"
          aria-label="Menu mobile"
        >
          <ul className="flex flex-col py-4 px-6 gap-1" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href) }}
                  className="block py-3 text-creme/90 hover:text-dore text-base font-medium border-b border-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dore rounded"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-3">
              <Link
                to="/app"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-5 py-2.5 rounded-full text-sm font-semibold border border-dore text-dore hover:bg-dore hover:text-vert-profond transition-all duration-300"
              >
                Espace de gestion
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

export default HomeNavbar
