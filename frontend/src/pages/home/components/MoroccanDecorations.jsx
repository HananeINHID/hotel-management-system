// Éléments décoratifs SVG inspirés du zellige marocain
// Réutilisables dans toute la landing page

// Séparateur géométrique zellige
export function ZelligeDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dore/50 to-transparent" />
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="14" y="0" width="4" height="4" fill="#D7B882" transform="rotate(45 16 16)" />
        <rect x="14" y="0" width="4" height="4" fill="#2447A6" transform="rotate(45 16 16) translate(0 8)" />
        <rect x="14" y="0" width="4" height="4" fill="#BB7356" transform="rotate(45 16 16) translate(0 -8)" />
        <rect x="14" y="0" width="4" height="4" fill="#D7B882" transform="rotate(45 16 16) translate(8 0)" />
        <rect x="14" y="0" width="4" height="4" fill="#D7B882" transform="rotate(45 16 16) translate(-8 0)" />
      </svg>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dore/50 to-transparent" />
    </div>
  )
}

// Étoile marocaine à 8 branches
export function MoroccanStar({ size = 48, color = '#D7B882', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <polygon
        points="24,2 28,20 46,24 28,28 24,46 20,28 2,24 20,20"
        fill={color}
        opacity="0.9"
      />
      <polygon
        points="24,8 27,21 40,24 27,27 24,40 21,27 8,24 21,21"
        fill="none"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.5"
      />
    </svg>
  )
}

// Motif de bordure zellige (bande horizontale colorée)
export function ZelligeBand({ className = '' }) {
  return (
    <div
      className={`h-1 w-full ${className}`}
      aria-hidden="true"
      style={{
        background: 'repeating-linear-gradient(90deg, #2447A6 0px, #2447A6 8px, #D7B882 8px, #D7B882 16px, #BB7356 16px, #BB7356 24px, #153D44 24px, #153D44 32px)',
      }}
    />
  )
}

// SVG arche marocaine (cadre décoratif)
export function MoroccanArchFrame({ children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 200 240"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          d="M10,240 L10,100 Q10,10 100,10 Q190,10 190,100 L190,240 Z"
          fill="none"
          stroke="#D7B882"
          strokeWidth="2"
          opacity="0.6"
        />
        <path
          d="M20,240 L20,105 Q20,25 100,25 Q180,25 180,105 L180,240 Z"
          fill="none"
          stroke="#D7B882"
          strokeWidth="0.5"
          opacity="0.3"
        />
      </svg>
      {children}
    </div>
  )
}

// Petit ornement géométrique pour les titres de section
export function SectionOrnament({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} aria-hidden="true">
      <div className="w-8 h-px bg-dore/60" />
      <MoroccanStar size={16} color="#D7B882" />
      <div className="w-8 h-px bg-dore/60" />
    </div>
  )
}
