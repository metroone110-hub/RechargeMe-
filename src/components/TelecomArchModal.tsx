import React, { useState, useEffect } from 'react';
import { X, Server, Radio, Cpu, ShieldCheck, Zap, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';
import { API } from '../services/api';
import { OperatorLogo } from '../data/logos';

interface TelecomArchModalProps {
  onClose: () => void;
}

export const TelecomArchModal: React.FC<TelecomArchModalProps> = ({ onClose }) => {
  const [statusData, setStatusData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'technique' | 'ussd' | 'apis'>('technique');

  useEffect(() => {
    API.getTelecomStatus().then((data) => setStatusData(data));
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-zinc-800 animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto">
        {/* Grab bar */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Architecture Backend & Passerelles
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Comment fonctionnent TransfertCI et RechargeMe en coulisses
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

        {/* Tab switcher */}
        <div className="bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl grid grid-cols-3 gap-1 mb-5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('technique')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'technique'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            Le Secret Technique
          </button>
          <button
            onClick={() => setActiveTab('ussd')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'ussd'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            Codes USSD Réels
          </button>
          <button
            onClick={() => setActiveTab('apis')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'apis'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            APIs B2B & Puces
          </button>
        </div>

        {/* Content based on tab */}
        {activeTab === 'technique' && (
          <div className="space-y-4 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
            <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
              <h4 className="font-extrabold text-sm mb-1 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-amber-600" />
                Est-ce qu'une personne se déplace au kiosque ?
              </h4>
              <p>
                <strong>Non, absolument personne ne se déplace !</strong> Tout est 100% automatisé
                grâce à des <strong>serveurs de cartes SIM (SIM Banks)</strong> ou des{' '}
                <strong>APIs B2B de gros</strong> connectées directement au réseau intelligent des
                opérateurs.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-zinc-700/60 space-y-3">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Les 2 méthodes utilisées en Côte d'Ivoire :
              </h4>

              <div className="space-y-2">
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/60 dark:border-zinc-800">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                    1. La méthode « SIM Bank / GSM Gateway » (utilisée par les indépendants)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Le gérant achète des puces <em>Master Revendeur</em> chez Orange, MTN et Moov
                    (avec 4% à 7% de remise grossiste). Ces puces sont insérées dans un boîtier
                    connecté au serveur (ou des téléphones Android avec une appli de pont USSD). Quand
                    vous payez sur le site, le serveur envoie automatiquement la commande USSD de
                    transfert avec le code PIN en 2 secondes.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/60 dark:border-zinc-800">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                    2. La méthode « Agrégateurs & API B2B » (utilisée à grande échelle)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Les plateformes comme CinetPay, Bizao, InTouch ou Reloadly disposent de lignes de
                    crédit et d'APIs directes avec les serveurs HLR/IN des opérateurs. L'achat est
                    validé par requête HTTP POST sécurisée en millisecondes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ussd' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Voici les commandes exactes générées par le backend RechargeMe et envoyées aux modems
              GSM pour créditer les numéros :
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 bg-slate-900 text-slate-100 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-[11px] text-amber-400 font-sans font-bold">
                  <span>Orange Côte d’Ivoire (E-Recharge / OM)</span>
                  <span className="bg-amber-400/20 px-2 py-0.5 rounded text-[10px]">USSD Master</span>
                </div>
                <div className="text-emerald-400 font-bold">*144*2*1*[NUMERO]*[MONTANT]*[PIN]#</div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Déclenche le transfert de crédit sans frais depuis le stock revendeur Orange.
                </p>
              </div>

              <div className="p-3 bg-slate-900 text-slate-100 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-[11px] text-amber-400 font-sans font-bold">
                  <span>MTN Côte d’Ivoire (Easy'n Distribution)</span>
                  <span className="bg-amber-400/20 px-2 py-0.5 rounded text-[10px]">USSD Master</span>
                </div>
                <div className="text-emerald-400 font-bold">*105*1*[NUMERO]*[MONTANT]*[PIN]#</div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Alimente instantanément le compte principal de l'abonné MTN.
                </p>
              </div>

              <div className="p-3 bg-slate-900 text-slate-100 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-[11px] text-amber-400 font-sans font-bold">
                  <span>Moov Africa CI (Flotte Revendeur)</span>
                  <span className="bg-amber-400/20 px-2 py-0.5 rounded text-[10px]">USSD Master</span>
                </div>
                <div className="text-emerald-400 font-bold">*155*2*[NUMERO]*[MONTANT]*[PIN]#</div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Transfert direct depuis la puce grossiste Moov Épargne.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'apis' && (
          <div className="space-y-4 text-xs">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
              Statut des passerelles actives sur votre serveur :
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(['Orange', 'MTN', 'Moov'] as const).map((op) => (
                <div
                  key={op}
                  className="bg-slate-50 dark:bg-zinc-800/80 p-3.5 rounded-2xl border border-slate-200/60 dark:border-zinc-700/60 text-center space-y-1"
                >
                  <OperatorLogo operator={op} size={28} className="rounded-lg mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    {op} Gateway
                  </span>
                  <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>En ligne (100%)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 text-indigo-950 dark:text-indigo-200 space-y-1.5">
              <span className="font-extrabold text-xs block">
                Comment brancher votre vraie entreprise en Côte d'Ivoire :
              </span>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-indigo-900 dark:text-indigo-300">
                <li>
                  <strong>Paiement en ligne :</strong> Créer un compte marchand sur <strong>Wave Business</strong> (0% frais de démarrage) ou <strong>CinetPay</strong>.
                </li>
                <li>
                  <strong>Distribution des unités :</strong>
                  <ul className="list-disc list-inside ml-3 mt-0.5 space-y-0.5">
                    <li>Option A (Simple) : API Reloadly ou Bizao (fournit directement l'airtime CI).</li>
                    <li>Option B (Marge maximale) : Acheter 3 puces revendeurs MTN, Orange, Moov avec stock chez un grossiste local, et brancher un boîtier GSM GoIP sur votre serveur.</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-5 min-h-[44px] rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-sm hover:opacity-90 transition-all"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
};
