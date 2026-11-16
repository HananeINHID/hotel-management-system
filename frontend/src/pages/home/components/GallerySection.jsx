import { useState } from 'react'
import { useInView } from '../../../hooks/useInView'
import { SectionOrnament, ZelligeDivider, ZelligeBand } from './MoroccanDecorations'
import { X } from 'lucide-react'

// Photos libres de droits (Unsplash — licence libre)
const GALLERY_ITEMS = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&q=75&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400&q=70&auto=format&fit=crop',
    alt: 'Patio marocain avec fontaine en zellige et orangers',
    label: 'Patio',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=75&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=70&auto=format&fit=crop',
    alt: 'Mosaïque de zellige marocain aux couleurs vives',
    label: 'Zellige',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=75&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=70&auto=format&fit=crop',
    alt: "Suite luxueuse au décor marocain avec lit baldaquin",
    label: 'Suite',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=75&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&q=70&auto=format&fit=crop',
    alt: 'Terrasse avec vue panoramique sur les toits de Marrakech',
    label: 'Terrasse',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1553444836-bc6c8d340181?w=800&q=75&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1553444836-bc6c8d340181?w=400&q=70&auto=format&fit=crop',
    alt: 'Fontaine en marbre blanc au centre du patio',
    label: 'Fontaine',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800&q=75&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=400&q=70&auto=format&fit=crop',
    alt: 'Architecture marocaine traditionnelle avec arches et sculptures en stuc',
    label: 'Architecture',
  },
]

function GallerySection() {
  const [ref, isInView] = useInView()
  const [lightbox, setLightbox] = useState(null)

  const openLightbox = (item) => setLightbox(item)
  const closeLightbox = () => setLightbox(null)

  return (
    <section
      id="galerie"
      ref={ref}
      className={`py-20 md:py-28 bg-creme section-animate ${isInView ? 'is-visible' : ''}`}
      aria-labelledby="gallery-title"
    >
      <ZelligeBand />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* En-tête */}
        <div className="text-center mb-12">
          <SectionOrnament className="mb-4" />
          <p className="text-xs tracking-[0.25em] text-terracotta uppercase font-medium mb-3">
            Galerie
          </p>
          <h2
            id="gallery-title"
            className="font-display text-4xl md:text-5xl font-light text-vert-profond mb-4"
          >
            L'âme de notre{' '}
            <span className="italic text-terracotta">riad</span>
          </h2>
          <ZelligeDivider className="max-w-xs mx-auto" />
        </div>

        {/* Grille masonry-like */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {GALLERY_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openLightbox(item)}
              className={`relative overflow-hidden rounded-xl group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dore focus-visible:ring-offset-2 ${
                idx === 0 ? 'row-span-2 md:row-span-1' : ''
              } ${idx === 3 ? 'md:col-span-2' : ''}`}
              aria-label={`Agrandir la photo : ${item.alt}`}
            >
              <div className={`w-full overflow-hidden ${idx === 0 ? 'h-64 md:h-56' : 'h-44 md:h-48'}`}>
                <img
                  src={item.thumb}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                  loading="lazy"
                />
              </div>
              {/* Overlay hover */}
              <div className="absolute inset-0 bg-vert-profond/0 group-hover:bg-vert-profond/40 transition-all duration-300 flex items-end" aria-hidden="true">
                <span className="w-full text-center text-creme text-xs font-semibold tracking-wider uppercase py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-vert-profond/70 to-transparent">
                  {item.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <ZelligeBand className="mt-12" />

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo agrandie : ${lightbox.alt}`}
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="w-full h-full object-contain rounded-xl max-h-[80vh]"
            />
            <p className="text-center text-creme/70 text-sm mt-3 font-display italic">
              {lightbox.alt}
            </p>
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute -top-3 -right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center text-vert-profond hover:bg-creme transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dore"
              aria-label="Fermer la photo"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default GallerySection
