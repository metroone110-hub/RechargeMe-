import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Smartphone,
  AlertCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AgentOrder } from '../types';
import { API } from '../services/api';
import { prettyPhone, fmtCFA } from '../data/catalog';
import { OperatorLogo } from '../data/logos';

interface AgentDispatchModalProps {
  onClose: () => void;
}

export const AgentDispatchModal: React.FC<AgentDispatchModalProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('rechargeme_agent_auth') === 'true';
  });
  const [pin, setPin] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [orders, setOrders] = useState<AgentOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'pending' | 'delivered' | 'webhook'>('pending');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
  const [jekoConfig, setJekoConfig] = useState<{ webhookUrl: string; storeId: string; apiKeyMasked: string } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await API.getAgentOrders();
    setLoading(false);
    if (res.ok) {
      setOrders(res.orders);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      API.getJekoConfig().then((cfg) => {
        if (cfg.ok) setJekoConfig(cfg);
      });
      // Poll every 8 seconds for new incoming orders
      const interval = setInterval(fetchOrders, 8000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await API.adminAuth(pin);
    if (res.ok) {
      setIsAuthenticated(true);
      sessionStorage.setItem('rechargeme_agent_auth', 'true');
    } else {
      setAuthError('Code PIN invalide (par défaut : 2026)');
    }
  };

  const handleCopyPhone = async (orderId: string, phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedId(orderId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyWebhookUrl = async () => {
    const url = jekoConfig?.webhookUrl || `${window.location.origin}/api/webhooks/jeko`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedWebhookUrl(true);
      setTimeout(() => setCopiedWebhookUrl(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDeliver = async (orderId: string) => {
    await API.deliverAgentOrder(orderId, 'Moi (Max It / MoMo)');
    fetchOrders();
  };

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-zinc-800 animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto">
        {/* Grab bar */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <Smartphone className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Espace Agent & Dispatching
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  Privé
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Commandes clients reçues via Jeko à souscrire sur Max It / MoMo
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

        {/* PIN Authentication Screen */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="max-w-xs mx-auto py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                Accès réservé aux agents
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Entrez votre code PIN secret (code par défaut : <strong>2026</strong>)
              </p>
            </div>

            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Code PIN"
              className="w-full text-center tracking-widest text-2xl font-bold bg-slate-100 dark:bg-zinc-800 rounded-2xl py-3 px-4 border-2 border-transparent focus:border-indigo-600 outline-none"
              autoFocus
            />

            {authError && <p className="text-xs font-semibold text-rose-500">{authError}</p>}

            <button
              type="submit"
              className="w-full min-h-[46px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm active:scale-95 transition-all shadow-md shadow-indigo-600/30"
            >
              Déverrouiller
            </button>
          </form>
        ) : (
          /* Authenticated Dashboard */
          <div className="space-y-4">
            {/* Top Stats Strip */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 block">
                    À souscrire maintenant
                  </span>
                  <span className="text-2xl font-black text-amber-950 dark:text-amber-100 num-tabular">
                    {pendingOrders.length}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 block">
                    Traitées avec succès
                  </span>
                  <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100 num-tabular">
                    {deliveredOrders.length}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Controls bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl flex gap-1 text-xs font-bold">
                <button
                  onClick={() => setTab('pending')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    tab === 'pending'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  À traiter ({pendingOrders.length})
                </button>
                <button
                  onClick={() => setTab('delivered')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    tab === 'delivered'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  Historique ({deliveredOrders.length})
                </button>
                <button
                  onClick={() => setTab('webhook')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    tab === 'webhook'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Webhook Jeko</span>
                </button>
              </div>

              <button
                onClick={fetchOrders}
                disabled={loading}
                className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-200"
                title="Actualiser"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Tab: Webhook & Jeko Config */}
            {tab === 'webhook' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Webhook URL Box to copy */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-lg border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      URL Webhook à insérer sur Jeko (business.jeko.africa)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Serveur Direct Actif
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                    <code className="text-xs text-indigo-300 font-mono break-all select-all">
                      {jekoConfig?.webhookUrl || `${window.location.origin}/api/webhooks/jeko`}
                    </code>
                    <button
                      onClick={handleCopyWebhookUrl}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                    >
                      {copiedWebhookUrl ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier l'URL</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Copiez cette URL et collez-la dans votre tableau de bord Jeko. Notre serveur traite les requêtes GET (pour la validation d'URL) et POST (pour les notifications de paiement avec signature HMAC-SHA256).
                  </p>
                </div>

                {/* Active Credentials Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Boutique (Store)</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 text-[11px] truncate block" title={jekoConfig?.storeId || '895f3110-845b-4d11-a291-f28dc954c0cd'}>
                      {jekoConfig?.storeId ? `${jekoConfig.storeId.slice(0, 8)}...${jekoConfig.storeId.slice(-4)}` : '895f3110...c0cd'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Key ID</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 text-[11px] truncate block">
                      d4365c1e...43c8
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Clé API</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 text-[11px] truncate block">
                      jeko_4e6af8...7f0f6da
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Secret Webhook</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px] truncate block">
                      533e792a...fe7a (HMAC)
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <h5 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-100">
                      Webhook prêt pour la production
                    </h5>
                  </div>
                  <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-relaxed">
                    Dès qu'un client paie sur Jeko (Wave, Orange, MTN ou Moov), la commande apparaît instantanément dans l'onglet <strong>« À traiter »</strong> ci-dessus avec son numéro et le nom du pass choisi.
                  </p>
                </div>
              </div>
            )}

            {/* Orders Feed */}
            {tab !== 'webhook' && (
            <div className="space-y-3">
              {(tab === 'pending' ? pendingOrders : deliveredOrders).length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                  {tab === 'pending'
                    ? 'Aucune commande en attente ! Toutes les demandes clients ont été traitées.'
                    : 'Aucune commande archivée pour le moment.'}
                </div>
              ) : (
                (tab === 'pending' ? pendingOrders : deliveredOrders).map((order) => {
                  const isPending = order.status === 'PENDING';
                  const dateStr = new Date(order.createdAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={order.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isPending
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60 shadow-xs'
                          : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                        {/* Operator & Phone */}
                        <div className="flex items-center gap-3">
                          <OperatorLogo operator={order.operator as any} size={36} className="rounded-xl shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-lg text-slate-900 dark:text-white num-tabular">
                                {prettyPhone(order.destPhone)}
                              </span>
                              <button
                                onClick={() => handleCopyPhone(order.id, order.destPhone)}
                                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1 active:scale-95 transition-all"
                                title="Copier pour coller dans Max It / MoMo"
                              >
                                {copiedId === order.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-emerald-600">Copié</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copier</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Réf : {order.ref} · Reçu à {dateStr}
                            </span>
                          </div>
                        </div>

                        {/* Amount & Price */}
                        <div className="text-left sm:text-right">
                          <span className="font-black text-lg text-slate-900 dark:text-white num-tabular block">
                            {fmtCFA(order.amount)}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            Payé via {order.payWith}
                          </span>
                        </div>
                      </div>

                      {/* Plan Details & Instructions */}
                      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                              {order.planName}
                            </span>
                            {order.planValid && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                {order.planValid}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            Action à faire : ouvrir l'application <strong>{order.operator === 'Orange' ? 'Orange Max It' : order.operator === 'MTN' ? 'MTN MoMo' : 'Moov Money CI'}</strong> et souscrire pour le numéro <strong>{order.destPhone}</strong>.
                          </p>
                        </div>

                        {isPending ? (
                          <button
                            onClick={() => handleDeliver(order.id)}
                            className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Marquer comme souscrit</span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Livré</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            )}

            {/* Quick Helper Tips */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <span className="font-extrabold block">Conseil pour aller encore plus vite :</span>
              <p className="text-[11px] leading-relaxed">
                Gardez votre téléphone avec les applications <em>Orange Max It</em>, <em>MTN MoMo</em> et <em>Moov Money</em> ouvertes. Dès qu'une commande s'affiche ici, cliquez sur <strong>« Copier »</strong>, collez le numéro dans l'application télécom et validez. Puis cliquez sur <strong>« Marquer comme souscrit »</strong>. Vos clients n'y voient que du feu et reçoivent leurs forfaits en moins d'une minute !
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
