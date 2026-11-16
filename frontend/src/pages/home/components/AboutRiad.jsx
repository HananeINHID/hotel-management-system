import { useInView } from '../../../hooks/useInView'
import { ZelligeDivider, SectionOrnament, MoroccanArchFrame } from './MoroccanDecorations'

function AboutRiad() {
  const [ref, isInView] = useInView()

  return (
    <section
      id="notre-riad"
      ref={ref}
      className={`py-20 md:py-28 bg-creme section-animate ${isInView ? 'is-visible' : ''}`}
      aria-labelledby="about-title"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image gauche avec arche marocaine */}
          <div className="relative order-2 lg:order-1">
            {/* Décoration en arrière-plan */}
            <div
              className="absolute -top-6 -left-6 w-24 h-24 border border-dore/30 rounded-full"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-6 -right-6 w-16 h-16 border border-terracotta/30 rounded-full"
              aria-hidden="true"
            />

            {/* Image dans un cadre avec arche */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl aspect-[3/4] max-w-sm mx-auto lg:max-w-none">
              <img
                src="https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80&auto=format&fit=crop"
                alt="Patio intérieur du Riad Atlas avec fontaine en zellige et arches marocaines traditionnelles"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
              {/* Overlay léger */}
              <div className="absolute inset-0 bg-gradient-to-t from-vert-profond/20 to-transparent" aria-hidden="true" />
            </div>

            {/* Badge flottant */}
            <div className="absolute -bottom-4 -right-4 md:bottom-6 md:right-6 bg-vert-profond text-creme px-5 py-3 rounded-xl shadow-lg">
              <div className="text-2xl font-display font-semibold text-dore">Depuis</div>
              <div className="text-sm font-sans opacity-80">le cœur de la Médina</div>
            </div>
          </div>

          {/* Texte droite */}
          <div className="order-1 lg:order-2">
            {/* Ornement */}
            <SectionOrnament className="mb-6 justify-start" />

            <p className="text-xs tracking-[0.25em] text-terracotta uppercase font-medium mb-3">
              Notre histoire
            </p>

            <h2
              id="about-title"
              className="font-display text-4xl md:text-5xl font-light text-vert-profond leading-tight mb-6"
            >
              Bienvenue au{' '}
              <span className="italic text-terracotta">Riad Atlas</span>
            </h2>

            <ZelligeDivider className="mb-8" />

            <div className="space-y-5 font-sans text-vert-profond/80 leading-relaxed">
              <p className="text-base md:text-lg">
                Derrière les portes de la médina se dévoile un havre de sérénité.
                Entre mosaïques artisanales, patios baignés de lumière et hospitalité
                marocaine, le Riad Atlas célèbre l'art de vivre à Marrakech.
              </p>
              <p className="text-sm md:text-base">
                Chaque détail raconte une histoire — celle d'artisans qui ont façonné
                ces zellige millénaire par millénaire, de fontaines qui murmurent au
                rythme des jardins fleuris, d'arches qui filtrent la lumière en poésie.
              </p>
              <p className="text-sm md:text-base">
                Ici, le temps ralentit. L'hospitalité marocaine authentique prend tout
                son sens dans un cadre où tradition et modernité se fondent en une
                expérience unique.
              </p>
            </div>

            {/* Points forts */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { label: 'Architecture', detail: 'Traditionnelle préservée' },
                { label: 'Zellige', detail: 'Mosaïques artisanales' },
                { label: 'Patio', detail: 'Jardin intérieur' },
                { label: 'Terrasse', detail: 'Vue sur Marrakech' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-xl border border-dore/20 bg-sable/50 hover:border-dore/40 transition-colors"
                >
                  <div className="text-xs tracking-wider text-terracotta uppercase font-semibold">
                    {item.label}
                  </div>
                  <div className="text-sm text-vert-profond/70 mt-0.5">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutRiad
