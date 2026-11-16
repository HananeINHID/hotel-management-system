import { Link } from 'react-router-dom'
import { ZelligeBand, MoroccanStar } from './MoroccanDecorations'

function HeroSection() {
  const handleScroll = (href) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="accueil"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Section principale — Riad Atlas"
    >
      {/* Image de fond — patio marocain via Unsplash (libre d'utilisation) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1920&q=80&auto=format&fit=crop')`,
        }}
        role="img"
        aria-label="Patio d'un riad marocain traditionnel avec fontaine et zellige"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 hero-overlay" aria-hidden="true" />

      {/* Décoration zellige en haut */}
      <div className="absolute top-0 left-0 right-0" aria-hidden="true">
        <ZelligeBand />
      </div>

      {/* Motifs décoratifs flottants */}
      <div className="absolute top-1/4 left-6 md:left-16 opacity-20" aria-hidden="true">
        <MoroccanStar size={64} color="#D7B882" className="animate-float" />
      </div>
      <div className="absolute bottom-1/4 right-6 md:right-16 opacity-15" aria-hidden="true">
        <MoroccanStar size={48} color="#D7B882" className="animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Contenu hero */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge subtil */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-dore/40 bg-dore/10 backdrop-blur-sm mb-6 animate-fade-in"
          style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}
        >
          <MoroccanStar size={12} color="#D7B882" aria-hidden="true" />
          <span className="text-xs tracking-[0.2em] text-dore uppercase font-medium">
            Marrakech · Médina
          </span>
          <MoroccanStar size={12} color="#D7B882" aria-hidden="true" />
        </div>

        {/* Titre principal */}
        <h1
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-creme leading-tight mb-4 animate-fade-up"
          style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}
        >
          RIAD{' '}
          <span className="italic text-dore">ATLAS</span>
        </h1>

        {/* Slogan */}
        <p
          className="font-display text-lg sm:text-xl md:text-2xl italic text-creme/90 mb-4 tracking-wide animate-fade-up"
          style={{ animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}
        >
          « L'âme du Maroc, l'art de vous accueillir. »
        </p>

        {/* Sous-titre */}
        <p
          className="font-sans text-sm sm:text-base text-creme/70 max-w-xl mx-auto leading-relaxed mb-10 animate-fade-up"
          style={{ animationDelay: '0.8s', opacity: 0, animationFillMode: 'forwards' }}
        >
          Découvrez une expérience unique où l'élégance traditionnelle marocaine
          rencontre le confort contemporain, au cœur de Marrakech.
        </p>

        {/* CTA Boutons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: '1s', opacity: 0, animationFillMode: 'forwards' }}
        >
          <button
            type="button"
            onClick={() => handleScroll('#chambres')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-dore text-vert-profond font-semibold text-sm hover:bg-dore/90 hover:shadow-lg hover:shadow-dore/30 transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dore focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            Découvrir nos chambres
          </button>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-creme/50 text-creme font-medium text-sm hover:border-dore hover:text-dore hover:bg-white/5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dore"
          >
            Entrer dans l'espace de gestion
          </Link>
        </div>
      </div>

      {/* Flèche de scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <button
          type="button"
          onClick={() => handleScroll('#notre-riad')}
          className="text-creme/60 hover:text-dore transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dore rounded"
          aria-label="Faire défiler vers le bas"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Bande zellige en bas */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
        <ZelligeBand />
      </div>
    </section>
  )
}

export default HeroSection
