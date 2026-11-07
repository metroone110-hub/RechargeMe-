import React, { useState, useMemo } from 'react';
import { Search, ArrowDownLeft, ArrowUpRight, Wifi, PhoneCall, Filter } from 'lucide-react';
import { Transaction, UserAccount } from '../types';
import { fmtCFA } from '../data/catalog';

interface HistoryViewProps {
  user: UserAccount;
  onViewReceipt: (tx: Transaction) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ user, onViewReceipt }) => {
  const [filter, setFilter] = useState<'all' | 'out' | 'in'>('all');
  const [search, setSearch] = useState('');

  // Monthly statistics
  const { spentThisMonth, reloadedThisMonth } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let spent = 0;
    let inAmt = 0;

    user.tx.forEach((t) => {
      const d = new Date(t.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (t.amount < 0) {
          spent += Math.abs(t.amount);
        } else {
          inAmt += t.amount;
        }
      }
    });

    return { spentThisMonth: spent, reloadedThisMonth: inAmt };
  }, [user.tx]);

  // Filtered transactions
  const filteredTx = useMemo(() => {
    return user.tx.filter((t) => {
      // type filter
      if (filter === 'in' && t.amount <= 0) return false;
      if (filter === 'out' && t.amount >= 0) return false;

      // search filter
      if (search) {
        const q = search.toLowerCase();
        const matchRef = t.ref.toLowerCase().includes(q);
        const matchLabel = t.label.toLowerCase().includes(q);
        const matchSub = t.sub.toLowerCase().includes(q);
        const matchPhone = t.phone ? t.phone.includes(q) : false;
        if (!matchRef && !matchLabel && !matchSub && !matchPhone) return false;
      }

      return true;
    });
  }, [user.tx, filter, search]);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Historique des opérations
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Suivi de toutes vos recharges, achats de forfaits et transferts.
        </p>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
            Dépensé ce mois
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white num-tabular">
            {fmtCFA(spentThisMonth)}
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
            Rechargé ce mois
          </span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 num-tabular">
            {fmtCFA(reloadedThisMonth)}
          </span>
        </div>
      </div>

      {/* Controls: Search + Filter Chips */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par référence, numéro ou forfait..."
            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Toutes les opérations' },
            { id: 'out', label: 'Dépenses & Achats' },
            { id: 'in', label: 'Recharges du compte' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`min-h-[36px] px-3.5 rounded-full text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden shadow-xs">
        {filteredTx.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            Aucune opération ne correspond à vos critères de recherche.
          </div>
        ) : (
          filteredTx.map((tx) => {
            const isPositive = tx.amount > 0;
            const dateObj = new Date(tx.date);
            const dateFormatted = dateObj.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <button
                key={tx.id}
                onClick={() => onViewReceipt(tx)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors gap-3 group"
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
                    <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
                    {tx.ref}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
