import React, { useMemo } from 'react';
import { Eye, EyeOff, Plus, ShoppingBag, Send, ArrowUpRight, ArrowDownLeft, Wifi, PhoneCall, ChevronRight } from 'lucide-react';
import { UserAccount, Transaction, Plan } from '../types';
import { fmtCFA, getOperator, prettyPhone, getCatalogPlans } from '../data/catalog';
import { OperatorLogo } from '../data/logos';

interface HomeViewProps {
  user: UserAccount;
  onNavigate: (tab: 'acheter' | 'recharger' | 'transferer' | 'historique') => void;
  onSelectQuickPlan: (plan: Plan) => void;
  onViewReceipt: (tx: Transaction) => void;
  onToggleHideBalance: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  onNavigate,
  onSelectQuickPlan,
  onViewReceipt,
  onToggleHideBalance,
}) => {
  const op = getOperator(user.phone) || 'Orange';

  // Compute 7 days chart data
  const { chartDays, totalWeekSpent, maxDaily } = useMemo(() => {
    const days: { label: string; dateStr: string; amount: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const label = d.toLocaleDateString('fr-FR', { weekday: 'narrow' });

      // sum negative transactions on that day
      const spentOnDay = user.tx
        .filter((t) => t.amount < 0 && new Date(t.date).toDateString() === dateStr)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      days.push({ label, dateStr, amount: spentOnDay });
    }

    const total = days.reduce((acc, d) => acc + d.amount, 0);
    const max = Math.max(...days.map((d) => d.amount), 100);

    return { chartDays: days, totalWeekSpent: total, maxDaily: max };
  }, [user.tx]);

  // Recommended plans for user's network
  const recommendedPlans = useMemo(() => {
    const internet = getCatalogPlans(op, 'internet');
    const appels = getCatalogPlans(op, 'appels');

    // Pick top attractive plans: around 500, 1000, 1500, 2500, 5000 FCFA
    const targetPrices = [500, 1000, 1500, 2500, 5000];
    const picked: Plan[] = [];

    for (const p of targetPrices) {
      const foundInt = internet.find((x) => x.price === p);
      if (foundInt && !picked.some((x) => x.id === foundInt.id)) {
        picked.push(foundInt);
      }
    }
    const foundApp = appels.find((x) => x.price === 1000 || x.price === 500);
    if (foundApp && !picked.some((x) => x.id === foundApp.id)) {
      picked.push(foundApp);
    }

    return picked.slice(0, 5);
  }, [op]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Hero Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7 shadow-xl shadow-slate-950/20">
        {/* Subtle decorative glow */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wide">
              Solde disponible
            </span>
            <button
              onClick={onToggleHideBalance}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full text-xs font-medium text-slate-200 transition-colors"
            >
              {user.hideBalance ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Afficher</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Masquer</span>
                </>
              )}
            </button>
          </div>

          <div className="my-4">
            <div className="text-4xl sm:text-5xl font-extrabold tracking-tight num-tabular text-white flex items-baseline gap-2">
              {user.hideBalance ? '••••••' : user.balance.toLocaleString('fr-FR')}
              <span className="text-sm sm:text-base font-bold text-indigo-300">F CFA</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ligne associée : {prettyPhone(user.phone)} ({op})
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <button
              onClick={() => onNavigate('recharger')}
              className="min-h-[50px] bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span>Recharger</span>
            </button>

            <button
              onClick={() => onNavigate('acheter')}
              className="min-h-[50px] bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>Acheter</span>
            </button>

            <button
              onClick={() => onNavigate('transferer')}
              className="min-h-[50px] bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>Envoyer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Passes Carousel */}
      {recommendedPlans.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <OperatorLogo operator={op} size={22} className="rounded-md" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Offres recommandées {op}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('acheter')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Tous les forfaits
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 scroll-snap-x">
            {recommendedPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => onSelectQuickPlan(plan)}
                className="shrink-0 w-44 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-left hover:border-indigo-500 dark:hover:border-indigo-500 active:scale-95 transition-all shadow-xs group"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1.5">
                  <span className="font-semibold">{plan.kind === 'internet' ? 'Internet' : 'Appels'}</span>
                  <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
                    {plan.valid}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {plan.name}
                </h4>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white num-tabular">
                    {plan.price.toLocaleString('fr-FR')}{' '}
                    <span className="text-[11px] font-bold text-slate-400">F</span>
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                    Prendre →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Spending Analytics Chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 block font-medium">
              Dépenses (7 derniers jours)
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white num-tabular">
              {fmtCFA(totalWeekSpent)}
            </span>
          </div>
          <button
            onClick={() => onNavigate('historique')}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Détails
          </button>
        </div>

        {/* Bar chart */}
        <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4">
          {chartDays.map((d, idx) => {
            const heightPercent = d.amount > 0 ? Math.max(12, Math.round((d.amount / maxDaily) * 100)) : 6;
            const hasSpent = d.amount > 0;

            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-end h-full gap-1.5 group cursor-default"
                title={`${d.dateStr} : ${fmtCFA(d.amount)}`}
              >
                <div
                  className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                    hasSpent
                      ? 'bg-indigo-600 dark:bg-indigo-500 group-hover:bg-indigo-500'
                      : 'bg-slate-100 dark:bg-zinc-800'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dernières opérations
          </h2>
          <button
            onClick={() => onNavigate('historique')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
          >
            <span>Tout voir</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden shadow-xs">
          {user.tx.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Aucune opération enregistrée pour le moment.
            </div>
          ) : (
            user.tx.slice(0, 5).map((tx) => {
              const isPositive = tx.amount > 0;
              const dateFormatted = new Date(tx.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <button
                  key={tx.id}
                  onClick={() => onViewReceipt(tx)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isPositive
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : tx.kind === 'internet'
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                          : tx.kind === 'appels'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                      ) : tx.kind === 'internet' ? (
                        <Wifi className="w-5 h-5 stroke-[2.5]" />
                      ) : tx.kind === 'appels' ? (
                        <PhoneCall className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 line-clamp-1">
                        {tx.label}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">
                        {tx.sub} · {dateFormatted}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-extrabold text-sm num-tabular block ${
                        isPositive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-zinc-100'
                      }`}
                    >
                      {isPositive ? '+' : '−'}
                      {fmtCFA(tx.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {tx.ref.slice(0, 8)}...
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
