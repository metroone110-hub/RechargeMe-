import React, { useState } from 'react';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import { PaymentProvider, UserAccount } from '../types';
import { PROVIDERS, fmtCFA, digits } from '../data/catalog';
import { ProviderLogo } from '../data/logos';

interface RechargeViewProps {
  user: UserAccount;
  onBack: () => void;
  onConfirmRecharge: (provider: PaymentProvider, amount: number) => void;
}

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

export const RechargeView: React.FC<RechargeViewProps> = ({ user, onBack, onConfirmRecharge }) => {
  const [provider, setProvider] = useState<PaymentProvider>('Wave');
  const [amount, setAmount] = useState<number>(2000);
  const [customAmount, setCustomAmount] = useState<string>('');

  const currentAmount = customAmount ? parseInt(customAmount, 10) || 0 : amount;
  const isValid = currentAmount >= 100;
  const newBalance = user.balance + (isValid ? currentAmount : 0);

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = digits(e.target.value);
    setCustomAmount(raw);
    const num = parseInt(raw, 10);
    if (num >= 100) {
      setAmount(num);
    }
  };

  const handlePresetSelect = (a: number) => {
    setAmount(a);
    setCustomAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onConfirmRecharge(provider, currentAmount);
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Top back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="min-h-[40px] min-w-[40px] rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recharger mon compte
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Alimentez votre solde RechargeMe via Mobile Money ou Wave.
          </p>
        </div>
      </div>

      {/* Provider selection */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 space-y-3 shadow-xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          Moyen de rechargement
        </label>

        <div className="grid grid-cols-2 gap-2.5">
          {PROVIDERS.map((p) => {
            const isSelected = provider === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p as PaymentProvider)}
                className={`min-h-[58px] p-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ProviderLogo provider={p as PaymentProvider} size={28} className="rounded-lg shadow-none" />
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {p}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount selection */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Montant à créditer
          </label>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            Min. 100 F
          </span>
        </div>

        {/* Preset chips */}
        <div className="grid grid-cols-3 gap-2.5">
          {PRESET_AMOUNTS.map((amt) => {
            const isSelected = amount === amt && !customAmount;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => handlePresetSelect(amt)}
                className={`min-h-[50px] rounded-2xl border text-sm font-extrabold num-tabular transition-all ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:border-slate-300'
                }`}
              >
                {fmtCFA(amt)}
              </button>
            );
          })}
        </div>

        {/* Custom amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
            Ou montant libre (F CFA)
          </label>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="Ex. 15000"
            value={customAmount}
            onChange={handleCustomInput}
            className="w-full bg-slate-50 dark:bg-zinc-800/80 border-2 border-slate-200 dark:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-2xl px-4 py-3 text-base font-bold text-slate-900 dark:text-white num-tabular outline-none"
          />
        </div>

        {/* Balance Preview Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 space-y-2">
          <div className="flex justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Solde actuel</span>
            <span className="font-bold text-slate-700 dark:text-zinc-300 num-tabular">
              {fmtCFA(user.balance)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-1 border-t border-slate-200/80 dark:border-zinc-700">
            <span>Nouveau solde estimé</span>
            <span className="text-emerald-600 dark:text-emerald-400 num-tabular">
              {fmtCFA(newBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 text-xs">
        <ShieldCheck className="w-5 h-5 shrink-0" />
        <span>
          Paiement sécurisé par agrégation mobile money officielle. Aucun frais additionnel.
        </span>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-zinc-950 dark:via-zinc-950/95 pointer-events-none z-30">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            type="button"
            disabled={!isValid}
            onClick={handleSubmit}
            className="w-full min-h-[52px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-30 disabled:cursor-not-allowed text-white font-extrabold text-base flex items-center justify-between px-6 shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all"
          >
            <span>Recharger avec {provider}</span>
            {isValid && (
              <span className="num-tabular font-black bg-white/20 px-3 py-1 rounded-xl text-sm">
                {fmtCFA(currentAmount)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
