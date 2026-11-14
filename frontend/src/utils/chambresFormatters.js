/**
 * Configurations de badges de statut pour chambres et maintenances.
 * Ajoutées à formatters.js (sans écraser l'existant).
 */

export const ETAT_CHAMBRE_CONFIG = {
  disponible: {
    label: 'Disponible',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
    icon: '✓',
  },
  en_maintenance: {
    label: 'En maintenance',
    bg: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
    icon: '⚙',
  },
  hors_service: {
    label: 'Hors service',
    bg: 'bg-rose-100 text-rose-800 border-rose-300',
    dot: 'bg-rose-500',
    icon: '✕',
  },
}

export const STATUT_MAINTENANCE_CONFIG = {
  planifiee: {
    label: 'Planifiée',
    bg: 'bg-sky-100 text-sky-800 border-sky-300',
    dot: 'bg-sky-500',
  },
  en_cours: {
    label: 'En cours',
    bg: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
  },
  terminee: {
    label: 'Terminée',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
  },
  annulee: {
    label: 'Annulée',
    bg: 'bg-slate-100 text-slate-600 border-slate-300',
    dot: 'bg-slate-400',
  },
}

export const TYPE_MAINTENANCE_LABELS = {
  preventive: 'Préventive',
  corrective: 'Corrective',
}
