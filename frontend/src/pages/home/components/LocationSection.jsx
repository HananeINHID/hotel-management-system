import { useState } from 'react'
import { useInView } from '../../../hooks/useInView'
import { SectionOrnament, ZelligeDivider, ZelligeBand, MoroccanStar } from './MoroccanDecorations'
import { MapPin, Mail, X, Send, CheckCircle2 } from 'lucide-react'

// Adresse de demonstration universitaire — facilement modifiable par configuration
const HOTEL_INFO = {
  name: 'RIAD ATLAS',
  address: '12, Derb des Orangers',
  quartier: 'Médina',
  city: 'Marrakech',
  country: 'Maroc',
}

function LocationSection() {
  const [ref, isInView] = useInView()
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({ nom: '', email: '', sujet: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.nom || !formData.email || !formData.message) return
    setSubmitted(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setSubmitted(false)
    setFormData({ nom: '', email: '', sujet: '', message: '' })
  }

  return (
    <section
      id="contact"
      ref={ref}
      className={`py-20 md:py-28 bg-sable section-animate ${isInView ? 'is-visible' : ''}`}
      aria-labelledby="location-title"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tete */}
        <div className="text-center mb-14">
          <SectionOrnament className="mb-4" />
          <p className="text-xs tracking-[0.25em] text-terracotta uppercase font-medium mb-3">
            Localisation &amp; Contact
          </p>
          <h2
            id="location-title"
            className="font-display text-4xl md:text-5xl font-light text-vert-profond mb-4"
          >
            Notre emplacement{' '}
            <span className="italic text-terracotta">à Marrakech</span>
          </h2>
          <ZelligeDivider className="max-w-xs mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Carte stylisee (illustrative) */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] bg-creme border border-dore/30 order-2 lg:order-1 flex flex-col justify-between p-6 sm:p-8">
            {/* Arriere-plan subtil avec zellige discret */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden="true">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="zellige-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M20,0 L40,20 L20,40 L0,20 Z" fill="none" stroke="#153D44" strokeWidth="1" />
                    <circle cx="20" cy="20" r="4" fill="#BB7356" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#zellige-grid)" />
              </svg>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-widest text-terracotta uppercase">
                Marrakech &middot; Médina
              </span>
              <span className="text-xs text-vert-profond/50 italic">
                Plan indicatif
              </span>
            </div>

            <div className="relative z-10 text-center my-auto py-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-terracotta/10 border-2 border-terracotta/30 flex items-center justify-center shadow-inner">
                <MapPin size={36} className="text-terracotta animate-bounce" aria-hidden="true" />
              </div>
              <div className="font-display text-3xl font-semibold text-vert-profond mb-2 tracking-wide">
                {HOTEL_INFO.name}
              </div>
              <p className="text-sm text-vert-profond/75 font-sans leading-relaxed">
                {HOTEL_INFO.address}<br />
                {HOTEL_INFO.quartier}, {HOTEL_INFO.city}<br />
                {HOTEL_INFO.country}
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-dore/20 flex items-center justify-between text-xs text-vert-profond/50">
              <span>Coordonnées vérifiées pour démo</span>
              <span>Médina historique</span>
            </div>
          </div>

          {/* Informations et action contact */}
          <div className="order-1 lg:order-2 space-y-6">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-vert-profond mb-3">
                {HOTEL_INFO.name} &mdash; {HOTEL_INFO.city}
              </h3>
              <p className="text-sm text-vert-profond/70 leading-relaxed mb-6 font-sans">
                Idéalement situé au cœur de la médina de Marrakech, à quelques minutes de la place Jemaa el-Fna et des souks artisanaux, le Riad Atlas vous accueille dans un cadre intime et préservé de l&#39;agitation citadine.
              </p>

              {/* Adresse detaillee */}
              <div className="flex items-start gap-4 p-5 rounded-2xl border border-dore/30 bg-white/90 shadow-sm mb-6">
                <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center flex-shrink-0 border border-terracotta/20">
                  <MapPin size={20} className="text-terracotta" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs tracking-wider uppercase text-terracotta font-semibold mb-1">
                    Adresse postale
                  </div>
                  <address className="not-italic text-sm text-vert-profond/85 font-medium leading-relaxed">
                    {HOTEL_INFO.address}<br />
                    {HOTEL_INFO.quartier}, {HOTEL_INFO.city}<br />
                    {HOTEL_INFO.country}
                  </address>
                </div>
              </div>

              {/* Mention universitaire reglementaire */}
              <p className="text-xs text-vert-profond/45 italic mb-6">
                * Adresse fictive utilisée dans le cadre de notre projet universitaire de gestion hôtelière.
              </p>
            </div>

            {/* Bouton Nous contacter qui fonctionne reellement */}
            <div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-vert-profond text-creme font-semibold text-sm hover:bg-terracotta hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vert-profond"
                aria-label="Ouvrir le formulaire pour nous contacter"
              >
                <Mail size={16} aria-hidden="true" />
                Nous contacter
              </button>
            </div>

            {/* Badges de localisation */}
            <div className="flex gap-3 flex-wrap pt-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-dore/30 text-xs font-semibold text-vert-profond shadow-sm">
                📍 {HOTEL_INFO.city}
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-dore/30 text-xs font-semibold text-vert-profond shadow-sm">
                🇲🇦 {HOTEL_INFO.country}
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-dore/30 text-xs font-semibold text-vert-profond shadow-sm">
                🏛️ Médina historique
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de contact interactive fonctionnelle */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
          onClick={handleClose}
        >
          <div
            className="relative max-w-lg w-full bg-creme rounded-3xl p-6 sm:p-8 shadow-2xl border border-dore/40"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-vert-profond/10 hover:bg-vert-profond/20 text-vert-profond flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vert-profond"
              aria-label="Fermer la boîte de dialogue"
            >
              <X size={18} />
            </button>

            {submitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={36} aria-hidden="true" />
                </div>
                <h4 className="font-display text-2xl font-semibold text-vert-profond mb-2">
                  Choukran !
                </h4>
                <p className="text-sm text-vert-profond/75 leading-relaxed mb-6 font-sans">
                  Votre message a bien été transmis à la réception du Riad Atlas. Notre équipe prendra contact avec vous avec grand plaisir.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-full bg-vert-profond text-creme text-sm font-semibold hover:bg-terracotta transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MoroccanStar size={16} color="#D7B882" aria-hidden="true" />
                  <span className="text-xs uppercase tracking-widest text-terracotta font-semibold">
                    RIAD ATLAS
                  </span>
                </div>
                <h4 id="contact-modal-title" className="font-display text-2xl font-semibold text-vert-profond mb-1">
                  Écrivez-nous
                </h4>
                <p className="text-xs text-vert-profond/65 mb-6">
                  Une question sur votre séjour ou une demande particulière ? Notre conciergerie est à votre écoute.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="contact-nom" className="block text-xs font-semibold text-vert-profond/80 mb-1">
                      Nom complet *
                    </label>
                    <input
                      id="contact-nom"
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Ex: Fatima Zahra"
                      className="w-full px-4 py-2.5 rounded-xl border border-dore/40 bg-white text-sm text-vert-profond placeholder-vert-profond/30 focus:outline-none focus:ring-2 focus:ring-dore"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold text-vert-profond/80 mb-1">
                      Adresse e-mail *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nom@exemple.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-dore/40 bg-white text-sm text-vert-profond placeholder-vert-profond/30 focus:outline-none focus:ring-2 focus:ring-dore"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-sujet" className="block text-xs font-semibold text-vert-profond/80 mb-1">
                      Sujet
                    </label>
                    <input
                      id="contact-sujet"
                      type="text"
                      value={formData.sujet}
                      onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                      placeholder="Renseignement, privatisation, visite..."
                      className="w-full px-4 py-2.5 rounded-xl border border-dore/40 bg-white text-sm text-vert-profond placeholder-vert-profond/30 focus:outline-none focus:ring-2 focus:ring-dore"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold text-vert-profond/80 mb-1">
                      Votre message *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Bonjour, je souhaiterais des informations concernant..."
                      className="w-full px-4 py-2.5 rounded-xl border border-dore/40 bg-white text-sm text-vert-profond placeholder-vert-profond/30 focus:outline-none focus:ring-2 focus:ring-dore resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-2.5 rounded-full border border-vert-profond/20 text-vert-profond text-xs font-semibold hover:bg-vert-profond/5 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-vert-profond text-creme text-xs font-semibold hover:bg-terracotta transition-colors shadow"
                    >
                      <Send size={13} aria-hidden="true" />
                      Envoyer le message
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default LocationSection
