import React, { useState, useMemo } from 'react';
import { MessageCircle, Phone, LogOut, ChevronDown, ChevronUp, ShieldCheck, UserCheck, HelpCircle, Cpu } from 'lucide-react';
import { UserAccount } from '../types';
import { getOperator, prettyPhone, fmtCFA, SUPPORT } from '../data/catalog';
import { OperatorLogo } from '../data/logos';

interface AccountViewProps {
  user: UserAccount;
  onLogout: () => void;
  onOpenSupport: () => void;
  onOpenArch?: () => void;
}

const FAQ_ITEMS = [
  {
    q: 'Quels moyens de paiement sont supportés ?',
    a: 'Wave, MTN Mobile Money, Orange Money, Moov Money, ou directement le solde de votre compte RechargeMe.',
  },
  {
    q: 'En combien de temps mon pass ou mes unités sont livrés ?',
    a: 'En quelques secondes seulement. La livraison est automatique et confirmée par SMS de votre opérateur.',
  },
  {
    q: 'Puis-je recharger le numéro d’un proche ?',
    a: 'Oui, sans aucune restriction. Dans l’onglet Acheter, entrez simplement le numéro du destinataire : l’opérateur est détecté automatiquement.',
  },
  {
    q: 'Mon achat n’est pas arrivé, que faire ?',
    a: `Contactez immédiatement notre support WhatsApp au +${SUPPORT} avec la référence indiquée sur votre reçu.`,
  },
  {
    q: 'Y a-t-il des frais sur les transferts entre membres ?',
    a: 'Aucun frais. Les transferts d’argent entre comptes RechargeMe sont 100% gratuits.',
  },
];

export const AccountView: React.FC<AccountViewProps> = ({
  user,
  onLogout,
  onOpenSupport,
  onOpenArch,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const operator = getOperator(user.phone) || 'Orange';

  const totalSpent = useMemo(() => {
    return user.tx
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [user.tx]);

  const whatsappMessage = encodeURIComponent(
    `Bonjour RechargeMe, j'ai une question concernant mon compte client (${prettyPhone(
      user.phone
    )}).`
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Mon Compte
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Informations de votre ligne, assistance et paramètres.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <OperatorLogo operator={operator} size={48} className="rounded-2xl" />
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white num-tabular">
              {prettyPhone(user.phone)}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                Opérateur {operator}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                Vérifié
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">Solde actuel</span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white num-tabular">
            {fmtCFA(user.balance)}
          </span>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
            Opérations effectuées
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white num-tabular">
            {user.tx.length}
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
            Volume total d’achats
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white num-tabular">
            {fmtCFA(totalSpent)}
          </span>
        </div>
      </div>

      {/* Customer Support direct contact */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-lg shadow-indigo-950/20">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block mb-1">
            Besoin d’aide ?
          </span>
          <h3 className="text-lg font-extrabold tracking-tight">
            Support client 24h/24 & 7j/7
          </h3>
          <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
            Notre équipe à Abidjan est disponible pour vérifier vos transactions ou répondre à vos questions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href={`https://wa.me/${SUPPORT}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[46px] px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Écrire sur WhatsApp (+{SUPPORT})</span>
          </a>

          <a
            href={`tel:+${SUPPORT}`}
            className="min-h-[46px] px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
          >
            <Phone className="w-4 h-4" />
            <span>Appel direct</span>
          </a>
        </div>
      </div>

      {/* Backend & Telecom Architecture Explanation Trigger */}
      {onOpenArch && (
        <button
          onClick={onOpenArch}
          className="w-full p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-left flex items-center justify-between gap-3 group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                Comment fonctionne le backend (Style TransfertCI)
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Passerelles USSD, Puces Master revendeur et APIs télécoms
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
            Explorer →
          </span>
        </button>
      )}

      {/* FAQ Accordion */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          Foire aux questions
        </h3>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
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
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-100 dark:border-zinc-800/60 bg-slate-50/30 dark:bg-zinc-800/20">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout button */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full min-h-[48px] rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter de ce numéro</span>
        </button>
      </div>
    </div>
  );
};
