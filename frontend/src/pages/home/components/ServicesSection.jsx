import { useEffect, useState } from 'react'
import { useInView } from '../../../hooks/useInView'
import { servicesApi } from '../../../api'
import { SectionOrnament, ZelligeDivider } from './MoroccanDecorations'
import { Utensils, Sparkles, TreePine, Star } from 'lucide-react'

// Icones et couleurs selon le nom/type du service
function getServiceStyle(nom) {
  const n = (nom || '').toLowerCase()
  if (n.includes('gastro') || n.includes('restaurant') || n.includes('repas') || n.includes('cuisine') || n.includes('dejeuner'))
    return { icon: Utensils, colorClass: 'bg-terracotta/10 text-terracotta border-terracotta/20' }
  if (n.includes('spa') || n.includes('bien') || n.includes('hammam') || n.includes('massage') || n.includes('detente') || n.includes('soin'))
    return { icon: Sparkles, colorClass: 'bg-majorelle/10 text-majorelle border-majorelle/20' }
  if (n.includes('jardin') || n.includes('patio') || n.includes('terrasse') || n.includes('piscine') || n.includes('exterieur'))
    return { icon: TreePine, colorClass: 'bg-vert-profond/10 text-vert-profond border-vert-profond/20' }
  return { icon: Star, colorClass: 'bg-dore/10 text-dore border-dore/20' }
}

function ServiceCard({ service }) {
  const { icon: Icon, colorClass } = getServiceStyle(service.nom)

  return (
    <article
      className={`group relative p-6 rounded-2xl border bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${colorClass} flex flex-col gap-4`}
    >
      {/* Icone */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} border`}>
        <Icon size={22} aria-hidden="true" />
      </div>

      {/* Contenu */}
      <div className="flex-1">
        <h3 className="font-display text-xl font-semibold text-vert-profond mb-2 leading-snug">
          {service.nom}
        </h3>
        {service.description && (
          <p className="text-sm text-vert-profond/65 leading-relaxed line-clamp-3">
            {service.description}
          </p>
        )}
      </div>

      {/* Prix si disponible */}
      {service.prix_unitaire && (
        <div className="text-xs font-semibold text-vert-profond/50 border-t border-current/10 pt-3">
          {`A partir de ${Number(service.prix_unitaire).toLocaleString('fr-MA')} MAD`}
        </div>
      )}
    </article>
  )
}

// Cartes illustratives si l'API ne retourne rien
const FALLBACK_SERVICES = [
  {
    id: 'f1',
    nom: 'Gastronomie marocaine',
    description: "Savourez les saveurs authentiques du Maroc : tajines, pastillas et the a la menthe prepares par nos cuisiniers.",
  },
  {
    id: 'f2',
    nom: 'Detente et bien-etre',
    description: "Hammam traditionnel, massages aux huiles d\u2019argan et soins du corps pour une relaxation complete.",
  },
  {
    id: 'f3',
    nom: 'Terrasse et jardin',
    description: "Profitez de notre terrasse panoramique avec vue sur les toits de la Medina et notre jardin fleuri.",
  },
  {
    id: 'f4',
    nom: 'Services personnalises',
    description: "Concierge dedie, transferts aeroport, excursions dans la Medina et dans les montagnes de l\u2019Atlas.",
  },
]

function ServicesSection() {
  const [ref, isInView] = useInView()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    servicesApi
      .getAll({ page_size: 8 })
      .then((res) => {
        const data = res.data
        const items = Array.isArray(data) ? data : (data?.results ?? [])
        if (items.length === 0) {
          setUseFallback(true)
        } else {
          setServices(items.slice(0, 4))
        }
      })
      .catch(() => {
        setUseFallback(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const displayed = useFallback ? FALLBACK_SERVICES : services

  return (
    <section
      id="services"
      ref={ref}
      className={`py-20 md:py-28 bg-vert-profond section-animate ${isInView ? 'is-visible' : ''}`}
      aria-labelledby="services-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tete */}
        <div className="text-center mb-14">
          <SectionOrnament className="mb-4" />
          <p className="text-xs tracking-[0.25em] text-dore/80 uppercase font-medium mb-3">
            L&#39;experience Riad Atlas
          </p>
          <h2
            id="services-title"
            className="font-display text-4xl md:text-5xl font-light text-creme mb-4"
          >
            Une experience{' '}
            <span className="italic text-dore">marocaine</span>
          </h2>
          <ZelligeDivider className="max-w-xs mx-auto mb-4" />
          <p className="font-sans text-sm md:text-base text-creme/60 max-w-xl mx-auto">
            {useFallback
              ? 'Des experiences authentiques pour vivre la magie de Marrakech.'
              : 'Les services proposes par notre etablissement, a votre disposition.'}
          </p>
          {useFallback && (
            <p className="text-xs text-dore/40 mt-1 italic">
              * Donnees illustratives &#8212; les services reels seront affiches des leur configuration
            </p>
          )}
        </div>

        {/* Grille */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-white/5 h-48 skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayed.map((service) => (
              <ServiceCard key={service.id || service.id_service} service={service} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ServicesSection
