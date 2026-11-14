import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Banknote,
  Search,
  CheckCircle,
  AlertCircle,
  Receipt,
  CreditCard,
  Calendar,
  Clock,
  Printer,
  FileCheck,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import { sejoursApi } from '../api'
import { useToast } from '../hooks/useToast'
import { formatDate, formatMoney, MODE_PAIEMENT_LABELS } from '../utils/formatters'
import { StatusBadge } from '../components/common/Badge'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Alert } from '../components/common/Alert'

function ResumeFinancierPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [sejourIdInput, setSejourIdInput] = useState(id || '1')
  const [activeSejourId, setActiveSejourId] = useState(id || '1')
  const [resume, setResume] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadResume = useCallback(async (sejourId) => {
    if (!sejourId) return
    try {
      setIsLoading(true)
      setError(null)
      const res = await sejoursApi.getResumeFinancier(sejourId)
      setResume(res.data)
    } catch (err) {
      setError(err.message)
      setResume(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) {
      setSejourIdInput(id)
      setActiveSejourId(id)
    }
  }, [id])

  useEffect(() => {
    loadResume(activeSejourId)
  }, [activeSejourId, loadResume])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!sejourIdInput.trim()) return
    setActiveSejourId(sejourIdInput.trim())
    navigate(`/sejours/${sejourIdInput.trim()}/finance`)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Banknote className="w-6 h-6 text-[#1d9a8a]" />
            <h1 className="text-2xl font-bold text-slate-800">Résumé Financier du Séjour</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Bilan financier consolidé : prestations consommées, versements encaissés et reste à régler.
          </p>
        </div>

        {/* Barre de recherche directe de séjour */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="number"
              min="1"
              value={sejourIdInput}
              onChange={(e) => setSejourIdInput(e.target.value)}
              placeholder="N° séjour..."
              className="pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d9a8a]/20 focus:border-[#1d9a8a] w-36"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1d9a8a] hover:bg-[#167d70] text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
          >
            Consulter
          </button>
          {resume && (
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
              title="Imprimer la facture récapitulative"
            >
              <Printer className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>

      {error && (
        <Alert
          type="error"
          title="Séjour introuvable"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {isLoading ? (
        <LoadingSpinner full text="Calcul du solde financier du séjour..." />
      ) : resume ? (
        <div className="space-y-6">
          {/* Bannière de synthèse financière */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Statut Séjour */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Séjour & Statut</span>
              <div className="my-2">
                <div className="text-xl font-black text-slate-900">Séjour #{resume.sejour_id}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    resume.statut_sejour === 'EN_COURS'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {resume.statut_sejour}
                  </span>
                  {resume.est_archive && (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                      Archivé
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Arrivée : {formatDate(resume.arrivee_reelle, true)}
              </div>
            </div>

            {/* Total Dû */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Prestations Dues</span>
              <div className="text-2xl font-black text-slate-800 mt-2 mb-1">
                {formatMoney(resume.total_du)}
              </div>
              <div className="text-xs text-slate-500">
                {resume.nombre_consommations} ligne(s) de consommation
              </div>
            </div>

            {/* Total Payé */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Encaissé Validé</span>
              <div className="text-2xl font-black text-emerald-700 mt-2 mb-1">
                {formatMoney(resume.total_paye)}
              </div>
              <div className="text-xs text-slate-500">
                {resume.nombre_paiements} versement(s) enregistré(s)
              </div>
            </div>

            {/* Reste à Payer */}
            <div className={`p-5 rounded-2xl border shadow-sm ${
              parseFloat(resume.reste_a_payer) === 0
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/80 border-amber-300 text-amber-950'
            }`}>
              <span className="text-xs font-bold uppercase tracking-wider opacity-75">Reste à Régler</span>
              <div className="text-2xl font-black mt-2 mb-1">
                {formatMoney(resume.reste_a_payer)}
              </div>
              <div className="text-xs font-semibold flex items-center gap-1.5 mt-1">
                {parseFloat(resume.reste_a_payer) === 0 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Séjour intégralement soldé</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-800">Solde débiteur à régler</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tableaux détaillés (Consommations + Paiements) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Détail Consommations */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#1d9a8a]" />
                  <h3 className="font-bold text-slate-800">Prestations Consommées ({resume.consommations.length})</h3>
                </div>
                <span className="text-xs font-bold text-slate-600">
                  Total : {formatMoney(resume.total_consommations)}
                </span>
              </div>

              {resume.consommations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Aucune consommation de service enregistrée pour ce séjour.
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Service</th>
                        <th className="py-2.5 px-4 text-center">Qté</th>
                        <th className="py-2.5 px-4 text-right">P.U</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resume.consommations.map((c) => (
                        <tr key={c.id_consommation} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-slate-800">{c.service_nom}</div>
                            <div className="text-[11px] text-slate-400">
                              {formatDate(c.date_consommation, true)}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-center font-bold">x{c.quantite}</td>
                          <td className="py-2.5 px-4 text-right text-slate-600">
                            {formatMoney(c.prix_applique)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#1d9a8a]">
                            {formatMoney(c.montant_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Détail Règlements */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#1d9a8a]" />
                  <h3 className="font-bold text-slate-800">Historique des Règlements ({resume.paiements.length})</h3>
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  Total validé : {formatMoney(resume.total_paye)}
                </span>
              </div>

              {resume.paiements.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Aucun versement enregistré pour ce séjour.
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Réf.</th>
                        <th className="py-2.5 px-4">Mode</th>
                        <th className="py-2.5 px-4">Statut</th>
                        <th className="py-2.5 px-4 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resume.paiements.map((p) => (
                        <tr key={p.id_paiement} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4">
                            <div className="font-mono font-bold text-xs text-slate-800">
                              {p.reference_paiement}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {formatDate(p.date_paiement, true)}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-700">
                            {p.mode_paiement_display || MODE_PAIEMENT_LABELS[p.mode_paiement] || p.mode_paiement}
                          </td>
                          <td className="py-2.5 px-4">
                            <StatusBadge status={p.statut} type="paiement" />
                          </td>
                          <td className="py-2.5 px-4 text-right font-extrabold text-slate-900">
                            {formatMoney(p.montant)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ResumeFinancierPage
