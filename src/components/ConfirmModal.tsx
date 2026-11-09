import React, { useState } from 'react';
import { Loader2, X, AlertCircle } from 'lucide-react';
import { PaymentProvider } from '../types';
import { ProviderLogo } from '../data/logos';
import { fmtCFA, prettyPhone, digits, isValidPhone, getOperator } from '../data/catalog';

interface ConfirmModalProps {
  title: string;
  rows: { label: string; value: string }[];
  total: number;
  userBalance?: number;
  userPhone: string;
  enablePaymentSelection?: boolean;
  onConfirm: (provider: PaymentProvider, payerPhone: string) => Promise<void>;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  rows,
  total,
  userBalance = 0,
  userPhone,
  enablePaymentSelection = true,
  onConfirm,
  onCancel,
}) => {
  const canUseBalance = userBalance >= total;
  const [provider, setProvider] = useState<PaymentProvider>(canUseBalance ? 'Solde RechargeMe' : 'Wave');
  const [payerPhone, setPayerPhone] = useState(userPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentOptions: PaymentProvider[] = [
    'Solde RechargeMe',
    'Wave',
    'MTN Money',
    'Orange Money',
    'Moov Money',
  ];

  const handlePayerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = digits(e.target.value);
    setPayerPhone(raw);
  };

  const handleAction = async () => {
    setError(null);
    if (provider !== 'Solde RechargeMe' && !isValidPhone(payerPhone)) {
      setError('Veuillez renseigner un numéro de paiement ivoirien valide à 10 chiffres.');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(provider, payerPhone);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'opération.");
      setLoading(false);
    }
  };

  const isPayerValid = provider === 'Solde RechargeMe' || isValidPhone(payerPhone);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}
    >
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-zinc-800 animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto">
        {/* Grab bar */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <button
            disabled={loading}
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Table */}
        <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-zinc-700/60 space-y-2.5 mb-5">
          {rows.map((row, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm gap-2">
              <span className="text-slate-500 dark:text-zinc-400">{row.label}</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 text-right num-tabular">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Payment Provider Selection */}
        {enablePaymentSelection && (
          <div className="mb-5 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Payer avec
            </label>

            <div className="grid grid-cols-1 gap-2">
              {paymentOptions.map((opt) => {
                const isSelected = provider === opt;
                const isSolde = opt === 'Solde RechargeMe';
                const isInsufficient = isSolde && !canUseBalance;

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isInsufficient || loading}
                    onClick={() => setProvider(opt)}
                    className={`w-full min-h-[50px] px-3.5 py-2.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                        : isInsufficient
                        ? 'border-slate-200 dark:border-zinc-800 opacity-40 cursor-not-allowed bg-slate-50 dark:bg-zinc-900/50'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ProviderLogo provider={opt} size={28} className="rounded-lg shadow-none" />
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-zinc-100 block">
                          {opt}
                        </span>
                        {isSolde && (
                          <span
                            className={`text-xs ${
                              isInsufficient ? 'text-rose-500 font-semibold' : 'text-slate-500 dark:text-zinc-400'
                            }`}
                          >
                            {isInsufficient ? `Solde insuffisant (${fmtCFA(userBalance)})` : `Disponible : ${fmtCFA(userBalance)}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-500 dark:bg-indigo-500'
                          : 'border-slate-300 dark:border-zinc-700'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Payer Phone if external provider */}
            {provider !== 'Solde RechargeMe' && (
              <div className="pt-2 animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                  Numéro {provider} à débiter
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="numeric"
                    disabled={loading}
                    value={prettyPhone(payerPhone)}
                    onChange={handlePayerChange}
                    placeholder="07 00 00 00 00"
                    className="w-full bg-slate-100 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-3 text-base font-bold text-slate-900 dark:text-white num-tabular outline-none transition-all"
                  />
                  {getOperator(payerPhone) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 shadow-xs">
                      {getOperator(payerPhone)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error notice */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* CTA */}
        <div className="space-y-2">
          <button
            type="button"
            disabled={loading || !isPayerValid}
            onClick={handleAction}
            className="w-full min-h-[50px] rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{provider === 'Solde RechargeMe' ? 'Traitement en cours...' : `Redirection vers ${provider}...`}</span>
              </>
            ) : (
              <span>{provider === 'Solde RechargeMe' ? `Payer ${fmtCFA(total)}` : `Payer via ${provider} (${fmtCFA(total)})`}</span>
            )}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};
