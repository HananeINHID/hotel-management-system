/**
 * Utilitaires de formatage : dates (JJ/MM/AAAA), devise (MAD) et badges.
 */

export function formatDate(dateString, includeTime = false) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  if (!includeTime) {
    return `${day}/${month}/${year}`
  }

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} à ${hours}:${minutes}`
}

export function formatMoney(amount) {
  if (amount === null || amount === undefined || amount === '') return '0,00 MAD'
  const num = typeof amount === 'number' ? amount : parseFloat(amount)
  if (isNaN(num)) return '0,00 MAD'
  return `${num.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MAD`
}

export const STATUT_PAIEMENT_CONFIG = {
  VALIDE: {
    label: 'Validé',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
  },
  EN_ATTENTE: {
    label: 'En attente',
    bg: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
  },
  REFUSE: {
    label: 'Refusé',
    bg: 'bg-rose-100 text-rose-800 border-rose-300',
    dot: 'bg-rose-500',
  },
  REMBOURSE: {
    label: 'Remboursé',
    bg: 'bg-purple-100 text-purple-800 border-purple-300',
    dot: 'bg-purple-500',
  },
}

export const MODE_PAIEMENT_LABELS = {
  ESPECES: 'Espèces',
  CARTE_BANCAIRE: 'Carte bancaire',
  VIREMENT: 'Virement',
  CHEQUE: 'Chèque',
}

export const STATUT_EMPLOYE_CONFIG = {
  ACTIF: {
    label: 'Actif',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
  },
  EN_CONGE: {
    label: 'En congé',
    bg: 'bg-sky-100 text-sky-800 border-sky-300',
    dot: 'bg-sky-500',
  },
  INACTIF: {
    label: 'Inactif',
    bg: 'bg-slate-100 text-slate-800 border-slate-300',
    dot: 'bg-slate-400',
  },
}

export const POSTE_EMPLOYE_LABELS = {
  RECEPTIONNISTE: 'Réceptionniste',
  FEMME_DE_CHAMBRE: 'Femme de chambre',
  MAINTENANCE: 'Maintenance',
  RESTAURATION: 'Restauration',
  MANAGER: 'Manager',
  COMPTABLE: 'Comptable',
  AUTRE: 'Autre',
}

export const TYPE_SERVICE_LABELS = {
  RESTAURATION: 'Restauration',
  SPA: 'Spa & Bien-être',
  BLANCHISSERIE: 'Blanchisserie',
  TRANSPORT: 'Transport',
  MINIBAR: 'Minibar',
  AUTRE: 'Autre service',
}
