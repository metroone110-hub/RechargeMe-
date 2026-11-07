import React, { useState, useMemo } from 'react';
import {
  Loader2,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  RefreshCw,
  Wifi,
  PhoneCall,
  Search,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  digits,
  prettyPhone,
  getOperator,
  isValidPhone,
  CATALOG,
  SUPPORT,
  getCatalogPlans,
  fmtCFA,
} from '../data/catalog';
import { OperatorLogo } from '../data/logos';
import { API } from '../services/api';
import { Operator, Plan, PlanKind, UserAccount } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount, preselectedPlan?: Plan) => void;
  onOpenSupport: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onOpenSupport }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Landing catalog explorer state
  const [selectedOp, setSelectedOp] = useState<Operator>('Orange');
  const [selectedKind, setSelectedKind] = useState<PlanKind>('internet');
  const [catalogSearch, setCatalogSearch] = useState('');

  const clean = digits(phone);
  const operator = getOperator(clean);
  const isComplete = isValidPhone(clean);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = digits(e.target.value);
    setPhone(raw);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;

    setLoading(true);
    setError(null);

    const res = await API.login(clean);
    setLoading(false);

    if (res.ok && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.error || 'Impossible de se connecter.');
    }
  };

  // Instant 1-click demo login for reviewers and auditors (like DEX Pay)
  const handleDemoLogin = async (prePlan?: Plan) => {
    setDemoLoading(true);
    const demoPhone = prePlan ? (prePlan.operator === 'MTN' ? '0501020304' : prePlan.operator === 'Moov' ? '0102030405' : '0708091011') : '0708091011';
    const res = await API.login(demoPhone);
    setDemoLoading(false);
    if (res.ok && res.user) {
      onLoginSuccess(res.user, prePlan);
    }
  };

  const totalPlans = (op: keyof typeof CATALOG) =>
    CATALOG[op].internet.length + CATALOG[op].appels.length;

  // Real plans for the landing explorer
  const visiblePlans = useMemo(() => {
    const all = getCatalogPlans(selectedOp, selectedKind);
    if (!catalogSearch) return all.slice(0, 8); // show top 8
    const q = catalogSearch.toLowerCase();
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.valid.toLowerCase().includes(q) ||
        p.price.toString().includes(q)
    );
  }, [selectedOp, selectedKind, catalogSearch]);

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-4xl mx-auto px-4 py-8">
      {/* Top Banner for DEX Pay / Reviewers */}
      <div className="mb-6 p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 text-center sm:text-left">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            <strong>Visiteur ou Partenaire (DEX Pay) ?</strong> Vous pouvez tester la cabine et les offres en 1 clic sans inscription.
          </span>
        </div>
        <button
          onClick={() => handleDemoLogin()}
          disabled={demoLoading}
          className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
        >
          {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
          <span>Accéder en mode Démo</span>
        </button>
      </div>

      {/* Login Card Header */}
      <div className="max-w-md mx-auto w-full pt-2 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <span className="font-extrabold text-base tracking-tighter">RM</span>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white block leading-tight">
                RechargeMe
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                Cabine de rechargement en ligne
              </span>
            </div>
          </div>

          <div className="flex items-center -space-x-2">
            <div className="p-0.5 rounded-xl bg-white dark:bg-zinc-900 shadow-xs">
              <OperatorLogo operator="Orange" size={26} className="rounded-lg" />
            </div>
            <div className="p-0.5 rounded-xl bg-white dark:bg-zinc-900 shadow-xs">
              <OperatorLogo operator="MTN" size={26} className="rounded-lg" />
            </div>
            <div className="p-0.5 rounded-xl bg-white dark:bg-zinc-900 shadow-xs">
              <OperatorLogo operator="Moov" size={26} className="rounded-lg" />
            </div>
          </div>
        </div>

        {/* Hero title */}
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
            Unités et data, en quelques secondes.
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Rechargez n’importe quel numéro ivoirien sans changer d’application.
          </p>
        </div>

        {/* Form Box */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4"
        >
          <div>
            <label
              htmlFor="login-phone"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2"
            >
              Votre numéro de téléphone
            </label>
            <div className="relative">
              <input
                id="login-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Ex. 07 08 09 10 11"
                value={prettyPhone(phone)}
                onChange={handlePhoneChange}
                className="w-full bg-slate-50 dark:bg-zinc-800/80 border-2 border-slate-200 dark:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-lg font-bold text-slate-900 dark:text-white num-tabular outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
              />

              {operator && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <OperatorLogo operator={operator} size={24} className="rounded-md" />
                  <span className="text-xs font-extrabold text-slate-700 dark:text-zinc-200 pr-1">
                    {operator}
                  </span>
                </div>
              )}
            </div>

            {/* Validation helper */}
            <div className="mt-2 min-h-[20px]">
              {clean.length >= 2 && !operator ? (
                <p className="text-xs font-medium text-rose-500">
                  Préfixe non reconnu. Utilisez un numéro ivoirien (Moov: 01-03, MTN: 04-06, Orange: 07-09).
                </p>
              ) : clean.length > 0 && !isComplete ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  {10 - clean.length} chiffre{10 - clean.length > 1 ? 's' : ''} restant{10 - clean.length > 1 ? 's' : ''}
                </p>
              ) : isComplete ? (
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Numéro valide ({operator})
                </p>
              ) : null}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isComplete || loading}
            className="w-full min-h-[50px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connexion sécurisée...</span>
              </>
            ) : (
              <>
                <span>Ouvrir ma cabine</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Quick Demo Access Button */}
          <button
            type="button"
            onClick={() => handleDemoLogin()}
            disabled={demoLoading}
            className="w-full min-h-[44px] rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800/60 active:scale-95 transition-all"
          >
            {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
            <span>Ou tester la démo avec 7 000 F CFA de solde</span>
          </button>
        </form>
      </div>

      {/* =========================================================================
          NOUVEAU : CATALOGUE COMPLET ET OFFRES EN DIRECT DIRECTEMENT SUR L'ACCUEIL
          ========================================================================= */}
      <div className="my-8 border-t border-slate-200/80 dark:border-zinc-800/80 pt-8 space-y-6">
        <div className="text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Catalogue officiel en ligne</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Consultez les forfaits et offres en direct
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Tous les pass Internet et Appels pour Orange, MTN et Moov avec leurs tarifs réels.
          </p>
        </div>

        {/* Operator Selector Tabs */}
        <div className="bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-2xl grid grid-cols-3 gap-1 max-w-md mx-auto">
          {(['Orange', 'MTN', 'Moov'] as const).map((op) => (
            <button
              key={op}
              onClick={() => setSelectedOp(op)}
              className={`min-h-[44px] rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                selectedOp === op
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              <OperatorLogo operator={op} size={20} className="rounded-md" />
              <span>{op}</span>
            </button>
          ))}
        </div>

        {/* Kind Toggle (Internet vs Appels) & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-xl mx-auto">
          <div className="bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
            <button
              onClick={() => setSelectedKind('internet')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                selectedKind === 'internet'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Internet ({CATALOG[selectedOp].internet.length})</span>
            </button>

            <button
              onClick={() => setSelectedKind('appels')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                selectedKind === 'appels'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Appels ({CATALOG[selectedOp].appels.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Rechercher un pass (ex: 1.5 Go)..."
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Grid of Plan Cards directly on the Landing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {visiblePlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                    {plan.valid}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1.5 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {plan.name}
                  </h4>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-base text-slate-900 dark:text-white num-tabular block">
                    {plan.price.toLocaleString('fr-FR')} F
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">CFA</span>
                </div>
              </div>

              <button
                onClick={() => handleDemoLogin(plan)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
              >
                <span>Prendre ce pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 pt-1">
          Affichage des forfaits officiels {selectedOp} Côte d'Ivoire. Choisissez un pass pour lancer l'achat immédiat.
        </p>
      </div>

      {/* Feature Section & Trust */}
      <div className="border-t border-slate-200/80 dark:border-zinc-800/80 pt-8 pb-6 space-y-12">
        {/* 3 Operators summary */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center mb-6">
            Tous les opérateurs réunis au même endroit
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto">
            {(['Orange', 'MTN', 'Moov'] as const).map((op) => (
              <div
                key={op}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200/70 dark:border-zinc-800 flex flex-col items-center text-center shadow-xs"
              >
                <OperatorLogo operator={op} size={40} className="rounded-xl mb-2" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{op}</span>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  {totalPlans(op)} forfaits
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center mb-6">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-base flex items-center justify-center">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Entrez votre numéro
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Votre opérateur est reconnu automatiquement. Accédez instantanément à votre cabine.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-base flex items-center justify-center">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Choisissez votre pass
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Unités simples, pass internet (Mo/Go) ou forfaits appels selon vos besoins et votre budget.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-base flex items-center justify-center">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Payez en toute liberté
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Réglez via Wave, Orange Money, MTN MoMo, Moov Money ou votre solde RechargeMe. Reçu instantané.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="max-w-md">
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">
              Pourquoi choisir RechargeMe ?
            </h2>
            <p className="text-xs text-indigo-200 leading-relaxed">
              La solution ivoirienne pensée pour vous faire gagner du temps sans frais cachés.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Sécurité & Fiabilité</h4>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Chaque transaction génère une référence unique vérifiable auprès des opérateurs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Rechargement Éclair</h4>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Activation du forfait en quelques secondes directement sur votre ligne SIM.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Transfert 0% de Frais</h4>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Envoyez de l’argent entre comptes RechargeMe gratuitement et sans limite.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Recharger pour autrui</h4>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Offrez des unités ou des pass internet à vos proches, collègues et amis en 1 clic.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 dark:text-zinc-500 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 RechargeMe · Abidjan, Côte d'Ivoire</span>
          <button
            onClick={onOpenSupport}
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            Assistance WhatsApp : +{SUPPORT}
          </button>
        </div>
      </div>
    </div>
  );
};
