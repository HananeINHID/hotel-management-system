import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { employesApi, reservationsApi } from '../../api'
import { Alert } from '../common/Alert'
import { Modal } from '../common/Modal'
import ClientPicker from './ClientPicker'
import LigneChambre from './LigneChambre'
import {
  aujourdhui, ajouterJours, fetchAll, formatMAD, messagesErreur, nbNuits,
} from '../../utils/reservations'

let compteur = 0
const nouvelleLigne = (modele = {}) => ({
  cle: `l${compteur++}`,
  chambre: '',
  date_arrivee_prevue: modele.date_arrivee_prevue ?? aujourdhui(),
  date_depart_prevue: modele.date_depart_prevue ?? ajouterJours(aujourdhui(), 1),
  nb_occupants: 1,
  tarif_nuit_applique: '',
})

function lignesDepuis(reservation) {
  if (!reservation) return [nouvelleLigne()]
  return reservation.chambres.map((c) => ({
    cle: `l${compteur++}`,
    chambre: String(c.chambre),
    date_arrivee_prevue: c.date_arrivee_prevue,
    date_depart_prevue: c.date_depart_prevue,
    nb_occupants: c.nb_occupants,
    tarif_nuit_applique: String(c.tarif_nuit_applique),
  }))
}

// Création / modification d'une réservation multichambre
export default function ReservationFormModal({ isOpen, onClose, reservation, onSaved }) {
  const edition = Boolean(reservation)
  const [client, setClient] = useState(null)
  const [employes, setEmployes] = useState([])
  const [employeId, setEmployeId] = useState('')
  const [lignes, setLignes] = useState([nouvelleLigne()])
  const [confirmer, setConfirmer] = useState(false)
  const [erreurs, setErreurs] = useState([])
  const [envoi, setEnvoi] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setErreurs([])
    setConfirmer(false)
    setLignes(lignesDepuis(reservation))
    setEmployeId(reservation ? String(reservation.employe) : '')
    setClient(reservation
      ? { id_client: reservation.client, nom: reservation.client_nom, prenom: '', piece_identite: '' }
      : null)
    fetchAll(employesApi.getAll, { statut: 'ACTIF' }).then(setEmployes).catch(() => setEmployes([]))
  }, [isOpen, reservation])

  const idsChoisis = lignes.map((l) => String(l.chambre)).filter(Boolean)

  const total = useMemo(() => lignes.reduce(
    (s, l) => s + nbNuits(l.date_arrivee_prevue, l.date_depart_prevue) * Number(l.tarif_nuit_applique || 0), 0,
  ), [lignes])
  const totalSaisi = lignes.every((l) => l.tarif_nuit_applique !== '' || !l.chambre)

  const majLigne = (cle, nouvelle) => setLignes((ls) => ls.map((l) => (l.cle === cle ? nouvelle : l)))

  const valider = () => {
    const liste = []
    if (!client) liste.push('Choisissez un client.')
    if (!employeId) liste.push("Choisissez l'employé qui enregistre la réservation.")
    lignes.forEach((l, i) => {
      if (!l.chambre) liste.push(`Chambre ${i + 1} : choisissez une chambre.`)
      if (l.date_depart_prevue <= l.date_arrivee_prevue) liste.push(`Chambre ${i + 1} : le départ doit être après l'arrivée.`)
    })
    return liste
  }

  const soumettre = async (e) => {
    e.preventDefault()
    const invalides = valider()
    if (invalides.length) { setErreurs(invalides); return }

    const payload = {
      client: client.id_client,
      employe: Number(employeId),
      chambres: lignes.map((l) => ({
        chambre: Number(l.chambre),
        date_arrivee_prevue: l.date_arrivee_prevue,
        date_depart_prevue: l.date_depart_prevue,
        nb_occupants: Number(l.nb_occupants),
        ...(l.tarif_nuit_applique !== '' ? { tarif_nuit_applique: l.tarif_nuit_applique } : {}),
      })),
      ...(edition ? {} : { confirmer }),
    }

    setEnvoi(true)
    setErreurs([])
    try {
      const { data } = edition
        ? await reservationsApi.update(reservation.id_reservation, payload)
        : await reservationsApi.create(payload)
      onSaved(data, edition)
    } catch (err) {
      setErreurs(messagesErreur(err))
    } finally {
      setEnvoi(false)
    }
  }

  const champ = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm'

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl"
      title={edition ? `Modifier la réservation #${reservation.id_reservation}` : 'Nouvelle réservation'}>
      <form onSubmit={soumettre} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Client</span>
            <ClientPicker value={client} onChange={setClient} disabled={false} />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Enregistrée par</span>
            <select value={employeId} onChange={(e) => setEmployeId(e.target.value)} className={champ}>
              <option value="">Choisir un employé</option>
              {employes.map((emp) => (
                <option key={emp.id_employe} value={emp.id_employe}>{emp.nom} {emp.prenom}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Chambres réservées</h3>
            <button type="button"
              onClick={() => setLignes((ls) => [...ls, nouvelleLigne(ls[ls.length - 1])])}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200">
              <Plus className="h-3.5 w-3.5" /> Ajouter une chambre
            </button>
          </div>
          {lignes.map((l, i) => (
            <LigneChambre key={l.cle} ligne={l} index={i}
              idsDejaChoisis={idsChoisis.filter((id) => id !== String(l.chambre))}
              reservationId={reservation?.id_reservation}
              peutSupprimer={lignes.length > 1}
              onChange={(n) => majLigne(l.cle, n)}
              onRemove={() => setLignes((ls) => ls.filter((x) => x.cle !== l.cle))} />
          ))}
          {totalSaisi && total > 0 && (
            <p className="text-right text-sm text-slate-600">
              Montant estimé : <strong className="text-slate-900">{formatMAD(total)}</strong>
            </p>
          )}
        </div>

        {!edition && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={confirmer} onChange={(e) => setConfirmer(e.target.checked)} />
            Confirmer la réservation immédiatement
          </label>
        )}

        {erreurs.length > 0 && (
          <Alert type="error" title="La réservation n'a pas pu être enregistrée"
            message={<ul className="list-disc pl-4">{erreurs.map((m) => <li key={m}>{m}</li>)}</ul>} />
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} disabled={envoi}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200">Annuler</button>
          <button type="submit" disabled={envoi}
            className="rounded-lg bg-[#1d9a8a] px-4 py-2 text-sm font-medium text-white hover:bg-[#167d70] disabled:opacity-50">
            {envoi ? 'Enregistrement…' : edition ? 'Enregistrer les modifications' : 'Créer la réservation'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
