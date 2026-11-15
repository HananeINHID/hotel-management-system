// Utilitaires du module Réservations (Salma)

export const STATUTS_RESERVATION = {
  EN_ATTENTE: { label: 'En attente', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMEE: { label: 'Confirmée', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ANNULEE: { label: 'Annulée', classes: 'bg-rose-50 text-rose-700 border-rose-200' },
  TERMINEE: { label: 'Terminée', classes: 'bg-slate-100 text-slate-700 border-slate-200' },
}

// Date du jour au format YYYY-MM-DD (fuseau local)
export function aujourdhui() {
  return new Date().toLocaleDateString('sv-SE')
}

export function ajouterJours(iso, n) {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('sv-SE')
}

// 'YYYY-MM-DD' -> 'JJ/MM/AAAA' sans passer par Date (évite les décalages de fuseau)
export function formatJour(iso) {
  if (!iso) return '—'
  const [y, m, d] = String(iso).slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export function nbNuits(arrivee, depart) {
  if (!arrivee || !depart) return 0
  const ms = new Date(`${depart}T00:00:00`) - new Date(`${arrivee}T00:00:00`)
  return Math.max(0, Math.round(ms / 86400000))
}

export function formatMAD(valeur) {
  const n = Number(valeur)
  if (Number.isNaN(n)) return '0,00 MAD'
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`
}

export function getList(data) {
  if (Array.isArray(data)) return data
  return data?.results || []
}

// Charge toutes les pages d'une liste paginée DRF
export async function fetchAll(apiFn, params = {}) {
  let page = 1
  let tout = []
  while (page < 50) {
    const { data } = await apiFn({ ...params, page })
    tout = tout.concat(getList(data))
    if (!data?.next) break
    page += 1
  }
  return tout
}

// Toutes les erreurs renvoyées par l'API (une par ligne de chambre, etc.)
export function messagesErreur(err) {
  const errors = err?.data?.errors
  const liste = []
  if (errors && typeof errors === 'object') {
    Object.values(errors).forEach((v) => {
      if (Array.isArray(v)) liste.push(...v.map(String))
      else if (v && typeof v === 'object') liste.push(...Object.values(v).flat().map(String))
      else if (v) liste.push(String(v))
    })
  }
  return liste.length ? liste : [err?.message || 'Une erreur est survenue.']
}
