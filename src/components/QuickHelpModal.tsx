import React, { useState } from 'react';
import { X, MessageCircle, Phone, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { SUPPORT, prettyPhone } from '../data/catalog';

interface QuickHelpModalProps {
  userPhone?: string;
  onClose: () => void;
}

const FAQ_ITEMS = [
  {
    q: 'Quels sont les moyens de paiement acceptés ?',
    a: 'Vous pouvez payer avec Wave, MTN Money, Orange Money, Moov Money ou directement avec votre solde RechargeMe sans frais.',
  },
  {
    q: 'En combien de temps est activé mon forfait ou mes unités ?',
    a: "L'activation est instantanée (en général entre 3 et 15 secondes selon la rapidité du réseau de l'opérateur).",
  },
  {
    q: "Puis-je recharger le numéro d'un proche ou un autre opérateur ?",
    a: "Absolument. Vous pouvez recharger n'importe quel numéro Orange, MTN ou Moov en Côte d'Ivoire. Le réseau est automatiquement détecté.",
  },
  {
    q: "Que faire en cas de retard d'activation ou de problème ?",
    a: 'Munissez-vous du code de référence (ex: FP..., UN...) présent sur votre reçu ou dans votre onglet Historique, puis écrivez directement à notre support WhatsApp.',
  },
  {
    q: 'Le transfert entre comptes RechargeMe a-t-il des frais ?',
    a: 'Non, les transferts entre membres de la communauté RechargeMe sont garantis 100% gratuits et instantanés.',
  },
];

export const QuickHelpModal: React.FC<QuickHelpModalProps> = ({ userPhone, onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const whatsappMessage = encodeURIComponent(
    `Bonjour le support RechargeMe, j'ai une question concernant mon compte${
      userPhone ? ` (${prettyPhone(userPhone)})` : ''
    }.`
  );
  const whatsappUrl = `https://wa.me/${SUPPORT}?text=${whatsappMessage}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-zinc-800 animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto">
        {/* Grab bar */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Centre d’aide & Support
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Support disponible 7j/7 pour la Côte d'Ivoire
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp & Phone Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[50px] px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-center"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Support WhatsApp</span>
          </a>

          <a
            href={`tel:+${SUPPORT}`}
            className="min-h-[50px] px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold text-sm flex items-center justify-center gap-2.5 active:scale-95 transition-all text-center"
          >
            <Phone className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
            <span>Appel direct</span>
          </a>
        </div>

        {/* FAQ Section */}
        <div className="space-y-3 mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Questions fréquentes (FAQ)
          </h4>

          <div className="space-y-2">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 font-semibold text-sm text-slate-900 dark:text-zinc-100 hover:bg-slate-50/50 dark:hover:bg-zinc-800/40"
                  >
                    <span>{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3.5 pt-1 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-100 dark:border-zinc-800/60 bg-slate-50/30 dark:bg-zinc-800/20">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full min-h-[44px] rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
