import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { UserAccount } from '../types';
import { getOperator, isValidPhone, prettyPhone, digits, fmtCFA } from '../data/catalog';
import { OperatorLogo } from '../data/logos';

interface TransferViewProps {
  user: UserAccount;
  onConfirmTransfer: (to: string, amount: number) => void;
}

export const TransferView: React.FC<TransferViewProps> = ({ user, onConfirmTransfer }) => {
  const [toPhone, setToPhone] = useState('');
  const [amountStr, setAmountStr] = useState('1000');

  const cleanTo = digits(toPhone);
  const operator = getOperator(cleanTo);
  const isSelf = cleanTo === user.phone;
  const isPhoneValid = isValidPhone(cleanTo) && !isSelf;

  const amount = parseInt(digits(amountStr), 10) || 0;
  const hasEnoughBalance = user.balance >= amount;
  const isAmountValid = amount >= 100 && hasEnoughBalance;

  const canSubmit = isPhoneValid && isAmountValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onConfirmTransfer(cleanTo, amount);
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Envoyer de l'argent
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Transfert gratuit et instantané vers un autre compte RechargeMe.
        </p>
      </div>

      {/* Main Transfer Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 space-y-4 shadow-xs"
      >
        {/* Recipient Input */}
        <div>
          <label
            htmlFor="transfer-to"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2"
          >
            Numéro du destinataire
          </label>

          <div className="relative">
            <input
              id="transfer-to"
              type="tel"
              inputMode="numeric"
              value={prettyPhone(toPhone)}
              onChange={(e) => setToPhone(e.target.value)}
              placeholder="05 00 00 00 00"
              className="w-full bg-slate-50 dark:bg-zinc-800/80 border-2 border-slate-200 dark:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-base font-bold text-slate-900 dark:text-white num-tabular outline-none transition-all"
            />

            {operator && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 animate-in fade-in duration-200">
                <OperatorLogo operator={operator} size={24} className="rounded-md" />
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                  {operator}
                </span>
              </div>
            )}
          </div>

          {/* Validation notices */}
          <div className="mt-2 min-h-[20px]">
            {isSelf ? (
              <p className="text-xs font-medium text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Vous ne pouvez pas vous envoyer de l’argent à vous-même.
              </p>
            ) : cleanTo.length >= 2 && !operator ? (
              <p className="text-xs font-medium text-rose-500">
                Numéro ivoirien invalide (MTN, Orange ou Moov).
              </p>
            ) : isPhoneValid ? (
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Destinataire vérifié ({operator})
              </p>
            ) : null}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="transfer-amount"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Montant à transférer (F CFA)
            </label>
            <span className="text-xs text-slate-400">Min. 100 F</span>
          </div>

          <input
            id="transfer-amount"
            type="tel"
            inputMode="numeric"
            value={amountStr}
            onChange={(e) => setAmountStr(digits(e.target.value))}
            placeholder="Ex. 2000"
            className="w-full bg-slate-50 dark:bg-zinc-800/80 border-2 border-slate-200 dark:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-lg font-bold text-slate-900 dark:text-white num-tabular outline-none transition-all"
          />

          <div className="flex items-center justify-between text-xs mt-2">
            <span className="text-slate-500 dark:text-zinc-400">
              Solde disponible : <strong className="num-tabular text-slate-800 dark:text-zinc-200">{fmtCFA(user.balance)}</strong>
            </span>
            {!hasEnoughBalance && (
              <span className="text-rose-500 font-bold">Solde insuffisant</span>
            )}
          </div>
        </div>

        {/* Fee guarantee banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200 block">
                Frais de transfert
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                100% gratuit entre utilisateurs
              </span>
            </div>
          </div>
          <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-300 bg-white dark:bg-zinc-900 px-3 py-1 rounded-full shadow-xs">
            0 F CFA
          </span>
        </div>
      </form>

      {/* Sticky Bottom Bar CTA */}
      <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-zinc-950 dark:via-zinc-950/95 pointer-events-none z-30">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full min-h-[52px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-30 disabled:cursor-not-allowed text-white font-extrabold text-base flex items-center justify-between px-6 shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all"
          >
            <span>Envoyer maintenant</span>
            {amount > 0 && (
              <span className="num-tabular font-black bg-white/20 px-3 py-1 rounded-xl text-sm">
                {fmtCFA(amount)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
