import { useEffect, useState } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { reservationsApi } from '../../api'
import { aujourdhui, formatMAD, nbNuits } from '../../utils/reservations'

// Une ligne de l'association CONCERNER : chambre + ses propres dates, occupants et tarif.
// La liste des chambres se recharge dès que les dates ou le nombre d'occupants changent.
export default function LigneChambre({
  ligne, index, idsDejaChoisis, reservationId, onChange, onRemove, peutSupprimer,
}) {
  const [chambres, setChambres] = useState([])
  const [chargement, setChargement] = useState(false)

  const { date_arrivee_prevue: arrivee, date_depart_prevue: depart, nb_occupants: occ } = ligne
  const datesValides = Boolean(arrivee && depart && depart > arrivee)

  useEffect(() => {
    if (!datesValides) {
      setChambres([])
      return undefined
    }
    let annule = false
    setChargement(true)
    const t = setTimeout(async () => {
      try {
        const { data } = await reservationsApi.getDisponibilites({
          date_debut: arrivee,
          date_fin: depart,
          ...(occ > 0 ? { nb_occupants: occ } : {}),
          ...(reservationId ? { exclure_reservation: reservationId } : {}),
        })
        if (!annule) setChambres(data.results || [])
      } catch {
        if (!annule) setChambres([])
      } finally {
        if (!annule) setChargement(false)
      }
    }, 300)
    return () => { annule = true; clearTimeout(t) }
  }, [arrivee, depart, occ, reservationId, datesValides])

  const choisie = chambres.find((c) => String(c.id_chambre) === String(ligne.chambre))
  const tarifCategorie = choisie?.categorie_detail?.tarif_nuit
  const tarif = ligne.tarif_nuit_applique !== '' ? ligne.tarif_nuit_applique : tarifCategorie
  const nuits = nbNuits(arrivee, depart)
  const sousTotal = Number(tarif || 0) * nuits

  const maj = (champ, valeur) => onChange({ ...ligne, [champ]: valeur })
  const champ = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">Chambre {index + 1}</h4>
        {peutSupprimer && (
          <button type="button" onClick={onRemove} aria-label={`Retirer la chambre ${index + 1}`}
            className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <label className="block text-xs font-medium text-slate-600">
          Arrivée
          <input type="date" min={aujourdhui()} value={arrivee} className={`${champ} mt-1`}
            onChange={(e) => maj('date_arrivee_prevue', e.target.value)} />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Départ
          <input type="date" min={arrivee || aujourdhui()} value={depart} className={`${champ} mt-1`}
            onChange={(e) => maj('date_depart_prevue', e.target.value)} />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Occupants
          <input type="number" min="1" value={occ} className={`${champ} mt-1`}
            onChange={(e) => maj('nb_occupants', Number(e.target.value))} />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Tarif / nuit (MAD)
          <input type="number" min="0" step="0.01" value={ligne.tarif_nuit_applique}
            placeholder={tarifCategorie ? String(tarifCategorie) : 'Catégorie'}
            className={`${champ} mt-1`}
            onChange={(e) => maj('tarif_nuit_applique', e.target.value)} />
        </label>
      </div>

      <label className="mt-3 block text-xs font-medium text-slate-600">
        Chambre {datesValides && !chargement && (
          <span className="font-normal text-slate-400">
            ({chambres.filter((c) => c.disponible).length} disponible(s) sur cette période)
          </span>
        )}
        <select value={ligne.chambre} disabled={!datesValides} className={`${champ} mt-1 disabled:bg-slate-100`}
          onChange={(e) => maj('chambre', e.target.value)}>
          <option value="">
            {datesValides ? (chargement ? 'Chargement…' : 'Choisir une chambre') : 'Renseignez d\'abord les dates'}
          </option>
          {chambres.map((c) => {
            const prisAilleurs = idsDejaChoisis.includes(String(c.id_chambre))
            return (
              <option key={c.id_chambre} value={c.id_chambre}
                disabled={(!c.disponible || prisAilleurs) && String(c.id_chambre) !== String(ligne.chambre)}>
                {c.numero_chambre} — {c.categorie_detail?.libelle} ({c.categorie_detail?.capacite} pers.)
                {!c.disponible ? ' — indisponible' : prisAilleurs ? ' — déjà choisie' : ''}
              </option>
            )
          })}
        </select>
      </label>

      {choisie && !choisie.disponible && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-rose-600">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {choisie.raison}
        </p>
      )}

      {datesValides && ligne.chambre && (
        <p className="mt-2 text-right text-xs text-slate-500">
          {nuits} nuit(s) × {formatMAD(tarif || 0)} = <strong className="text-slate-800">{formatMAD(sousTotal)}</strong>
        </p>
      )}
    </div>
  )
}
