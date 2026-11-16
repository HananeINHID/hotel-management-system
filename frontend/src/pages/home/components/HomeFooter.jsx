import { Link } from 'react-router-dom'
import { Hotel } from 'lucide-react'
import { ZelligeBand, MoroccanStar } from './MoroccanDecorations'

const QUICK_LINKS = [
  { label: 'Accueil', href: '#accueil' },
  { label: 'Notre Riad', href: '#notre-riad' },
  { label: 'Chambres & Suites', href: '#chambres' },
  { label: 'Expérience marocaine', href: '#services' },
  { label: 'Galerie', href: '#galerie' },
  { label: 'Localisation', href: '#contact' },
]

const handleNavClick = (href) => {
  const el = document.querySelector(href)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function HomeFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-vert-profond text-creme" role="contentinfo">
      <ZelligeBand />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {/* Colonne 1 — Logo & Slogan */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-dore/15 border border-dore/30 flex items-center justify-center">
                <Hotel size={18} className="text-dore" aria-hidden="true" />
              </div>
              <div>
                <div className="font-display text-xl font-semibold tracking-wide text-creme">
                  RIAD ATLAS
                </div>
                <div className="text-[9px] tracking-[0.2em] text-dore/70 uppercase font-sans">
                  Marrakech · Maroc
                </div>
              </div>
            </div>

            <p className="font-display italic text-creme/70 text-sm leading-relaxed">
              « L'âme du Maroc, l'art de vous accueillir. »
            </p>

            <div className="flex gap-2" aria-hidden="true">
              <MoroccanStar size={16} color="#D7B882" />
              <MoroccanStar size={16} color="#D7B882" className="opacity-60" />
              <MoroccanStar size={16} color="#D7B882" className="opacity-30" />
            </div>
          </div>

          {/* Colonne 2 — Navigation rapide */}
          <nav aria-label="Navigation rapide du footer">
            <h3 className="text-xs tracking-[0.2em] uppercase font-semibold text-dore/80 mb-5">
              Navigation
            </h3>
            <ul className="space-y-2.5" role="list">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); handleNavClick(link.href) }}
                    className="text-sm text-creme/60 hover:text-dore transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-dore rounded"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/app"
                  className="text-sm text-dore/80 hover:text-dore font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-dore rounded"
                >
                  → Espace de gestion
                </Link>
              </li>
            </ul>
          </nav>

          {/* Colonne 3 — Adresse */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase font-semibold text-dore/80 mb-5">
              Localisation
            </h3>
            <address className="not-italic space-y-1.5 text-sm text-creme/60 leading-relaxed">
              <p>12, Derb des Orangers</p>
              <p>Médina, Marrakech</p>
              <p>Maroc 🇲🇦</p>
            </address>
            <p className="text-xs text-creme/30 italic mt-4">
              Adresse de démonstration uniquement.
            </p>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-white/8 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-creme/35">
          <p>
            &copy; {year} Riad Atlas. Tous droits réservés.
          </p>
          <p className="italic">
            Projet universitaire — Données de démonstration
          </p>
        </div>
      </div>

      <ZelligeBand />
    </footer>
  )
}

export default HomeFooter
