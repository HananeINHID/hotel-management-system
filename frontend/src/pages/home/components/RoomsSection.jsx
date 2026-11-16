import { useEffect, useState } from 'react'
import { useInView } from '../../../hooks/useInView'
import { categoriesChambresAPI } from '../../../services/chambresMaintenances'
import { ZelligeBand, SectionOrnament, ZelligeDivider, MoroccanStar } from './MoroccanDecorations'
import { Users, ChevronRight, X, Sparkles, Bed, Bath, Wifi, Coffee } from 'lucide-react'

// Skeleton card
function RoomCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sable">
      <div className="skeleton h-52 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-8 w-1/2 mt-4" />
      </div>
    </div>
  )
}

// Images libres d'utilisation
const ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=75&auto=format&fit=crop',
]

function RoomCard({ category, index, onSelect }) {
  const imgSrc = ROOM_IMAGES[index % ROOM_IMAGES.length]

  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-sable/60 hover:shadow-xl hover:border-dore/40 transition-all duration-400 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={imgSrc}
          alt={`Chambre catégorie ${category.nom}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-vert-profond/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />

        {/* Badge prix */}
        {category.prix_par_nuit && (
          <div className="absolute top-3 right-3 bg-vert-profond/90 backdrop-blur-sm text-dore px-3 py-1 rounded-full text-xs font-semibold">
            {Number(category.prix_par_nuit).toLocaleString('fr-MA')} MAD / nuit
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-xl font-semibold text-vert-profond mb-2 leading-snug">
          {category.nom}
        </h3>

        {/* Description */}
        {category.description && (
          <p className="text-sm text-vert-profond/65 leading-relaxed line-clamp-3 mb-4 flex-1">
            {category.description}
          </p>
        )}

        {/* Capacité */}
        {category.capacite && (
          <div className="flex items-center gap-1.5 text-xs text-vert-profond/50 mb-4">
            <Users size={13} aria-hidden="true" />
            <span>Capacité : {category.capacite} personne{category.capacite > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* CTA Découvrir */}
        <button
          type="button"
          onClick={() => onSelect(category, imgSrc)}
          className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-terracotta hover:text-vert-profond transition-colors group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta rounded"
          aria-label={`Découvrir la catégorie ${category.nom}`}
        >
          Découvrir
          <ChevronRight
            size={16}
            className="transition-transform group-hover/btn:translate-x-1"
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  )
}

function RoomsSection() {
  const [ref, isInView] = useInView()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)

  useEffect(() => {
    categoriesChambresAPI
      .list()
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.results ?? [])
        setCategories(items)
      })
      .catch((err) => {
        console.error('RoomsSection API error:', err)
        setError('Impossible de charger les catégories de chambres.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section
      id="chambres"
      ref={ref}
      className={`py-20 md:py-28 bg-sable section-animate ${isInView ? 'is-visible' : ''}`}
      aria-labelledby="rooms-title"
    >
      <ZelligeBand />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* En-tete */}
        <div className="text-center mb-14">
          <SectionOrnament className="mb-4" />
          <p className="text-xs tracking-[0.25em] text-terracotta uppercase font-medium mb-3">
            Hébergement
          </p>
          <h2
            id="rooms-title"
            className="font-display text-4xl md:text-5xl font-light text-vert-profond mb-4"
          >
            Nos chambres &amp;{' '}
            <span className="italic text-terracotta">suites</span>
          </h2>
          <ZelligeDivider className="max-w-xs mx-auto mb-4" />
          <p className="font-sans text-sm md:text-base text-vert-profond/65 max-w-xl mx-auto leading-relaxed">
            Chaque espace a été conçu pour offrir une immersion totale dans l&#39;élégance
            marocaine, avec le confort contemporain que vous méritez.
          </p>
        </div>

        {/* Grille */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <RoomCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-vert-profond/50">
            <div className="text-4xl mb-3" aria-hidden="true">🏨</div>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-1 opacity-60">Vérifiez que le serveur Django est démarré.</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-vert-profond/50">
            <div className="text-4xl mb-3" aria-hidden="true">🏨</div>
            <p className="text-base font-display italic">Aucune catégorie de chambre configurée pour le moment.</p>
            <p className="text-xs mt-2 opacity-60">Les chambres seront présentées dès leur enregistrement dans la base.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <RoomCard
                key={cat.id || cat.id_categorie || idx}
                category={cat}
                index={idx}
                onSelect={(category, image) => setSelectedRoom({ ...category, image })}
              />
            ))}
          </div>
        )}
      </div>

      <ZelligeBand className="mt-12" />

      {/* Modal Détails Catégorie */}
      {selectedRoom && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="room-modal-title"
          onClick={() => setSelectedRoom(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-creme rounded-3xl overflow-hidden shadow-2xl border border-dore/40 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header image */}
            <div className="relative h-60 w-full overflow-hidden flex-shrink-0">
              <img
                src={selectedRoom.image}
                alt={selectedRoom.nom}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-vert-profond/80 via-transparent to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dore"
                aria-label="Fermer la vue détaillée"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-dore font-semibold">
                    RIAD ATLAS &middot; SUITE &amp; CHAMBRE
                  </span>
                  <h3 id="room-modal-title" className="font-display text-3xl font-semibold text-creme">
                    {selectedRoom.nom}
                  </h3>
                </div>
                {selectedRoom.prix_par_nuit && (
                  <div className="text-right">
                    <span className="text-xs text-creme/70 block">Tarif</span>
                    <span className="text-xl font-bold text-dore">
                      {Number(selectedRoom.prix_par_nuit).toLocaleString('fr-MA')} MAD
                    </span>
                    <span className="text-xs text-creme/70 block">par nuit</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contenu modal */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Description */}
              {selectedRoom.description ? (
                <div>
                  <h4 className="text-xs tracking-wider uppercase text-terracotta font-semibold mb-2">
                    Description de la chambre
                  </h4>
                  <p className="text-sm text-vert-profond/80 leading-relaxed font-sans">
                    {selectedRoom.description}
                  </p>
                </div>
              ) : null}

              {/* Prestations / Aménagements */}
              <div>
                <h4 className="text-xs tracking-wider uppercase text-terracotta font-semibold mb-3">
                  Prestations &amp; Confort
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-vert-profond/80">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-dore/20">
                    <Bed size={16} className="text-terracotta" />
                    <span>Literie artisanale haut de gamme</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-dore/20">
                    <Bath size={16} className="text-terracotta" />
                    <span>Salle de bain en tadelakt traditionnel</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-dore/20">
                    <Wifi size={16} className="text-terracotta" />
                    <span>Connexion Wi-Fi haut débit</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-dore/20">
                    <Coffee size={16} className="text-terracotta" />
                    <span>Plateau de bienvenue thé à la menthe</span>
                  </div>
                </div>
              </div>

              {/* Capacité et note */}
              {selectedRoom.capacite && (
                <div className="flex items-center gap-2 text-xs text-vert-profond/65 bg-sable/60 p-3 rounded-xl border border-dore/30">
                  <Users size={16} className="text-vert-profond" />
                  <span>Capacité d&#39;accueil : jusqu&#39;à {selectedRoom.capacite} personne{selectedRoom.capacite > 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Pied de modal */}
              <div className="pt-2 border-t border-dore/20 flex items-center justify-between">
                <span className="text-xs text-vert-profond/50 italic">
                  Réservation gérée par la réception de l&#39;hôtel
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="px-6 py-2.5 rounded-full bg-vert-profond text-creme text-xs font-semibold hover:bg-terracotta transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default RoomsSection
