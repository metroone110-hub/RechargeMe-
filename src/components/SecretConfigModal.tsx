import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Key,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Store,
  Sparkles,
} from 'lucide-react';
import { API } from '../services/api';

interface SecretConfigModalProps {
  onClose: () => void;
}

export const SecretConfigModal: React.FC<SecretConfigModalProps> = ({ onClose }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('rechargeme_agent_auth') === 'true';
  });
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Form states
  const [storeId, setStoreId] = useState('895f3110-845b-4d11-a291-f28dc954c0cd');
  const [apiKeyId, setApiKeyId] = useState('d4365c1e-b68a-46c4-a0fb-49d92c4c43c8');
  const [apiKey, setApiKey] = useState('jeko_4e6af80c6279a8112d7813a11e4863b1b9dbabc26fbaaedb106be041c7f0f6da');
  const [webhookSecret, setWebhookSecret] = useState('3bbc5d7eed0471952a283d51fd30f479e4916426ac9a22b7f120ef5b97342e39');
  const [webhookUrl, setWebhookUrl] = useState('');

  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Test connection states
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message?: string;
    error?: string;
    activeStoreName?: string;
    storesCount?: number;
    redirectUrl?: string;
    stores?: Array<{ id: string; name: string }>;
  } | null>(null);

  useEffect(() => {
    API.getFullJekoConfig().then((cfg) => {
      if (cfg.ok) {
        if (cfg.storeId) setStoreId(cfg.storeId);
        if (cfg.apiKeyId) setApiKeyId(cfg.apiKeyId);
        if (cfg.apiKey) setApiKey(cfg.apiKey);
        if (cfg.webhookSecret) setWebhookSecret(cfg.webhookSecret);
        if (cfg.webhookUrl) setWebhookUrl(cfg.webhookUrl);
      }
    });
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    const res = await API.adminAuth(pin);
    if (res.ok) {
      setIsUnlocked(true);
      sessionStorage.setItem('rechargeme_agent_auth', 'true');
    } else {
      setPinError('Code PIN incorrect (par défaut : 2026)');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(null);
    const res = await API.updateJekoConfig({
      storeId: storeId.trim(),
      apiKeyId: apiKeyId.trim(),
      apiKey: apiKey.trim(),
      webhookSecret: webhookSecret.trim(),
    });
    setSaving(false);
    if (res.ok) {
      setSaveSuccess('Clés Jeko enregistrées et activées en direct !');
      setTimeout(() => setSaveSuccess(null), 4000);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await API.testJekoConnection({
      storeId: storeId.trim(),
      apiKeyId: apiKeyId.trim(),
      apiKey: apiKey.trim(),
    });
    setTesting(false);
    setTestResult(res);
  };

  const handleCopyUrl = async () => {
    const url = webhookUrl || `${window.location.origin}/api/webhooks/jeko`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-zinc-800 animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto">
        {/* Grab bar */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                Coin Secret · Paramètres Jèko
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                Gestion des clés d'API et diagnostic en direct
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isUnlocked ? (
          /* PIN LOCK SCREEN */
          <form onSubmit={handleUnlock} className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                Espace confidentiel
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                Entrez votre code PIN secret pour accéder et modifier vos clés d'API Jèko.
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Code PIN (ex: 2026)"
                autoFocus
                className="w-full text-center tracking-widest text-xl font-bold bg-slate-100 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none"
              />
              {pinError && (
                <p className="text-xs text-rose-500 font-semibold">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full max-w-xs min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-600/30 transition-all mx-auto block"
            >
              Déverrouiller
            </button>
          </form>
        ) : (
          /* UNLOCKED SETTINGS PANEL */
          <div className="space-y-4 text-xs">
            {/* Store ID Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-indigo-500" />
                  Store ID (Identifiant du magasin)
                </label>
              </div>
              <input
                type="text"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                placeholder="ex: 895f3110-845b-4d11-a291-f28dc954c0cd"
                className="w-full font-mono bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500 text-xs"
              />
              {/* Quick selectors for detected user stores */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setStoreId('895f3110-845b-4d11-a291-f28dc954c0cd')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    storeId === '895f3110-845b-4d11-a291-f28dc954c0cd'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                  }`}
                >
                  ✓ Store Programas (895f3110...)
                </button>
                <button
                  type="button"
                  onClick={() => setStoreId('6ff18bfb-e467-4896-9502-dd7db9f02c9b')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    storeId === '6ff18bfb-e467-4896-9502-dd7db9f02c9b'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                  }`}
                >
                  Store RechargeMe (6ff18bfb...)
                </button>
              </div>
            </div>

            {/* API Key ID Field */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-zinc-300">
                X-API-KEY-ID (Identifiant de la clé)
              </label>
              <input
                type="text"
                value={apiKeyId}
                onChange={(e) => setApiKeyId(e.target.value)}
                placeholder="ex: d4365c1e-b68a-46c4-a0fb-49d92c4c43c8"
                className="w-full font-mono bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* API Key Secret Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  X-API-KEY (Clé secrète Jeko)
                </label>
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-slate-500 hover:text-slate-700 dark:text-zinc-400 flex items-center gap-1 text-[11px]"
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showApiKey ? 'Masquer' : 'Afficher'}</span>
                </button>
              </div>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="ex: jeko_4e6af80c6279..."
                className="w-full font-mono bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* Webhook Secret Field */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-zinc-300">
                Secret Webhook (Signature HMAC-SHA256)
              </label>
              <input
                type="text"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="ex: 3bbc5d7eed0471952a283d51fd30f479e4916426ac9a22b7f120ef5b97342e39"
                className="w-full font-mono bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* Webhook URL with Copy button */}
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-zinc-200 text-[11px]">
                  URL de Webhook à coller dans Jèko :
                </span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-600 dark:text-zinc-300 break-all select-all bg-white dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                {webhookUrl || `${window.location.origin}/api/webhooks/jeko`}
              </div>
            </div>

            {/* Live Diagnostic & Test Panel */}
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Diagnostic en temps réel
                </span>
                <button
                  type="button"
                  disabled={testing}
                  onClick={handleTestConnection}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-[11px] flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-all shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Test en cours...' : 'Tester la connexion Jeko'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                    testResult.ok
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {testResult.ok ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                    <span>{testResult.message || testResult.error}</span>
                  </div>

                  {testResult.ok && (
                    <div className="pl-6 space-y-1 text-[11px] text-emerald-800 dark:text-emerald-300">
                      <div>
                        Magasin vérifié : <strong>{testResult.activeStoreName}</strong> ({testResult.storesCount} détectés)
                      </div>
                      {testResult.redirectUrl && (
                        <div className="pt-1">
                          <a
                            href={testResult.redirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold underline text-indigo-700 dark:text-indigo-300"
                          >
                            <span>Ouvrir l'URL de test générée par Jèko</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Success message */}
            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-center text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="flex-1 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Enregistrer et activer les clés</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 min-h-[44px] rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
