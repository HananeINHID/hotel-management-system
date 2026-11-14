import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Banknote,
  Clock,
  Sparkles,
  CreditCard,
  Receipt,
  UserRound,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Activity,
} from 'lucide-react'
import { dashboardApi } from '../api'
import { formatMoney, formatDate, MODE_PAIEMENT_LABELS } from '../utils/formatters'
import { StatusBadge } from '../components/common/Badge'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Alert } from '../components/common/Alert'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((res) => {
        setStats(res.data)
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Bannière de Bienvenue */}
      <div className="bg-gradient-to-r from-[#0f3d3e] to-[#165456] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-emerald-300 border border-white/10 mb-3">
            <Activity className="w-3.5 h-3.5" />
            Finances, Services & Équipe
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Tableau de Bord Financier & Opérationnel
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Supervisez les recettes journalières, régularisez les paiements en attente et suivez l'utilisation des services de l'hôtel.
          </p>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          title="Connexion API"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {isLoading ? (
        <LoadingSpinner full text="Calcul des métriques du jour..." />
      ) : stats ? (
        <>
          {/* Cartes métriques clés (§7 : Total encaissé jour, paiements en attente, etc.) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recettes du jour */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Encaissé aujourd'hui
                </span>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <Banknote className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-emerald-700">
                  {formatMoney(stats.total_encaisse_jour)}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Règlements validés ce jour
                </div>
              </div>
            </div>

            {/* Paiements en attente */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Paiements en attente
                </span>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-amber-700">
                  {stats.paiements_en_attente_count}
                </div>
                <Link
                  to="/paiements"
                  className="text-xs font-semibold text-amber-800 hover:underline mt-1 inline-flex items-center gap-1"
                >
                  À valider dans Paiements <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Total Encaissé Global */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recettes totales validées
                </span>
                <div className="p-2.5 rounded-xl bg-teal-50 text-[#1d9a8a]">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-slate-800">
                  {formatMoney(stats.total_encaisse_global)}
                </div>
                <div className="text-xs text-slate-500 mt-1">Cumul global des encaissements</div>
              </div>
            </div>

            {/* Actions Rapides */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Accès Express
              </span>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Link
                  to="/paiements"
                  className="p-2 text-center text-xs font-semibold bg-slate-50 hover:bg-[#1d9a8a] hover:text-white rounded-xl text-slate-700 border border-slate-200 transition-colors"
                >
                  Paiements
                </Link>
                <Link
                  to="/consommations"
                  className="p-2 text-center text-xs font-semibold bg-slate-50 hover:bg-[#1d9a8a] hover:text-white rounded-xl text-slate-700 border border-slate-200 transition-colors"
                >
                  Consommations
                </Link>
                <Link
                  to="/services"
                  className="p-2 text-center text-xs font-semibold bg-slate-50 hover:bg-[#1d9a8a] hover:text-white rounded-xl text-slate-700 border border-slate-200 transition-colors"
                >
                  Services
                </Link>
                <Link
                  to="/employes"
                  className="p-2 text-center text-xs font-semibold bg-slate-50 hover:bg-[#1d9a8a] hover:text-white rounded-xl text-slate-700 border border-slate-200 transition-colors"
                >
                  Employés
                </Link>
              </div>
            </div>
          </div>

          {/* Section centrale : Services les plus consommés + Dernières transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Services les plus consommés */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#1d9a8a]" />
                  <h3 className="font-bold text-slate-800">Services les plus consommés</h3>
                </div>
                <Link
                  to="/services"
                  className="text-xs font-semibold text-[#1d9a8a] hover:underline flex items-center gap-1"
                >
                  Catalogue complet <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {stats.top_services?.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">
                  Aucune consommation enregistrée pour l'instant.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.top_services.map((item, idx) => (
                    <div
                      key={item.id_service}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/75 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#0f3d3e] text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-sm text-slate-800">{item.nom}</div>
                          <span className="text-xs text-slate-500">
                            {formatMoney(item.prix_unitaire)} / unité
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-100 text-teal-800">
                          {item.total_quantite} consommés
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dernières transactions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-[#1d9a8a]" />
                    <h3 className="font-bold text-slate-800">Dernières transactions</h3>
                  </div>
                  <Link
                    to="/paiements"
                    className="text-xs font-semibold text-[#1d9a8a] hover:underline flex items-center gap-1"
                  >
                    Voir tout <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {stats.dernieres_transactions?.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">
                    Aucun paiement enregistré pour l'instant.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {stats.dernieres_transactions.map((t) => (
                      <div
                        key={t.id_paiement}
                        className="py-3 flex items-center justify-between text-xs sm:text-sm"
                      >
                        <div>
                          <div className="font-mono font-bold text-slate-800">{t.reference_paiement}</div>
                          <div className="text-slate-500 text-xs mt-0.5">
                            Séjour #{t.sejour} • {formatDate(t.date_paiement, true)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={t.statut} type="paiement" />
                          <span className="font-black text-slate-900 text-sm sm:text-base">
                            {formatMoney(t.montant)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <Link
                  to="/resume-financier"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  <Banknote className="w-4 h-4 text-[#1d9a8a]" />
                  Consulter le bilan complet d'un séjour
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default Dashboard
