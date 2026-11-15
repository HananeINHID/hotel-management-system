import { Modal } from '../common/Modal'
import StatutReservation from './StatutReservation'
import { formatJour, formatMAD } from '../../utils/reservations'

export default function ReservationDetailModal({ reservation, onClose }) {
  if (!reservation) return null
  return (
    <Modal isOpen onClose={onClose} maxWidth="max-w-2xl"
      title={`Réservation #${reservation.id_reservation}`}>
      <div className="space-y-5 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-800">{reservation.client_nom}</p>
            <p className="text-slate-500">Enregistrée par {reservation.employe_nom}</p>
          </div>
          <StatutReservation statut={reservation.statut_reservation} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2">Chambre</th>
                <th className="px-3 py-2">Séjour prévu</th>
                <th className="px-3 py-2">Occupants</th>
                <th className="px-3 py-2 text-right">Tarif / nuit</th>
                <th className="px-3 py-2 text-right">Sous-total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservation.chambres.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2">
                    <span className="font-medium text-slate-800">{c.numero_chambre}</span>
                    <span className="block text-xs text-slate-400">{c.categorie_libelle}</span>
                  </td>
                  <td className="px-3 py-2">
                    {formatJour(c.date_arrivee_prevue)} → {formatJour(c.date_depart_prevue)}
                    <span className="block text-xs text-slate-400">{c.nb_nuits} nuit(s)</span>
                  </td>
                  <td className="px-3 py-2">{c.nb_occupants}</td>
                  <td className="px-3 py-2 text-right">{formatMAD(c.tarif_nuit_applique)}</td>
                  <td className="px-3 py-2 text-right font-medium">{formatMAD(c.sous_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between border-t border-slate-100 pt-3 text-slate-600">
          <span>{reservation.nb_personnes_total} personne(s) · {reservation.nb_chambres} chambre(s)</span>
          <span>Montant estimé : <strong className="text-slate-900">{formatMAD(reservation.montant_estime)}</strong></span>
        </div>
      </div>
    </Modal>
  )
}
