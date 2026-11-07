import React, { useState } from 'react';
import { Check, Copy, CheckCheck, Share2, X, ExternalLink } from 'lucide-react';
import { fmtCFA } from '../data/catalog';

export interface ReceiptRow {
  label: string;
  value: string;
}

interface ReceiptModalProps {
  title: string;
  rows: ReceiptRow[];
  refCode: string;
  redirectUrl?: string;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  title,
  rows,
  refCode,
  redirectUrl,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(refCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = () => {
    const summary = `${title}\nRéférence: ${refCode}\n` + rows.map((r) => `${r.label}: ${r.value}`).join('\n');
    if (navigator.share) {
      navigator.share({ title: 'Reçu RechargeMe', text: summary }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-zinc-800 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        {/* Grab bar */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/30">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <h3 className="text-xl font-extrabold text-center text-slate-900 dark:text-white tracking-tight mb-1">
          {title}
        </h3>
        <p className="text-xs text-center text-slate-500 dark:text-zinc-400 mb-5">
          Opération validée · Commande en cours de livraison
        </p>

        {/* Jeko Direct Payment Link if present */}
        {redirectUrl && (
          <div className="mb-5 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 block mb-2">
              Lien de paiement sécurisé Jeko généré
            </span>
            <a
              href={redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 active:scale-95 transition-all w-full"
            >
              <span>Accéder au paiement Jeko</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Details Table */}
        <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-zinc-700/60 space-y-3 mb-5">
          {rows.map((row, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm gap-2">
              <span className="text-slate-500 dark:text-zinc-400">{row.label}</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 text-right num-tabular">
                {row.value}
              </span>
            </div>
          ))}

          <div className="pt-3 border-t border-slate-200 dark:border-zinc-700 flex justify-between items-center text-sm">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Référence</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md text-xs">
              {refCode}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={handleCopy}
            className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-zinc-700 font-bold text-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <CheckCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copier réf</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-zinc-700 font-bold text-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Partager</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full min-h-[48px] rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Terminer
        </button>
      </div>
    </div>
  );
};

