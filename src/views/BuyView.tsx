import React, { useState, useEffect, useMemo } from 'react';
import { Wifi, PhoneCall, Smartphone, Search, Check, Sparkles } from 'lucide-react';
import { Plan, PlanKind, UserAccount } from '../types';
import { getOperator, isValidPhone, prettyPhone, digits, fmtCFA, getCatalogPlans } from '../data/catalog';
import { OperatorLogo } from '../data/logos';

interface BuyViewProps {
  user: UserAccount;
  initialPlan?: Plan | null;
  onConfirmPurchase: (type: 'airtime' | 'internet' | 'appels', phone: string, amount: number, plan: Plan | null) => void;
}

const AIRTIME_PRESETS = [100, 200, 500, 1000, 2000, 5000];

export const BuyView: React.FC<BuyViewProps> = ({ user, initialPlan, onConfirmPurchase }) => {
  const [tab, setTab] = useState<'airtime' | 'internet' | 'appels'>(
    initialPlan ? initialPlan.kind : 'airtime'
  );
  const [phone, setPhone] = useState(user.phone);
  const [airtimeAmount, setAirtimeAmount] = useState<number>(500);
  const [customAirtime, setCustomAirtime] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(initialPlan || null);
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const cleanPhone = digits(phone);
  const operator = getOperator(cleanPhone);
  const isPhoneValid = isValidPhone(cleanPhone);

  // Recents numbers list
  const recentPhones = useMemo(() => {
    const list = [
      user.phone,
      ...user.tx.map((t) => t.phone).filter((p): p is string => !!p && p.length === 10),
    ];
    return Array.from(new Set(list)).slice(0, 4);
  }, [user.phone, user.tx]);

  // Load catalog plans for selected operator
  const availablePlans = useMemo(() => {
    if (!operator || tab === 'airtime') return [];
    return getCatalogPlans(operator, tab as PlanKind);
  }, [operator, tab]);

  // Filter plans based on duration and search
  const filteredPlans = useMemo(() => {
    return availablePlans.filter((p) => {
      // duration filter
      let matchesDuration = true;
      if (durationFilter === 'short') matchesDuration = p.days <= 3;
      if (durationFilter === 'medium') matchesDuration = p.days >= 5 && p.days <= 10;
      if (durationFilter === 'long') matchesDuration = p.days >= 15;

      // search filter
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.valid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.price.toString().includes(searchQuery);

      return matchesDuration && matchesSearch;
    });
  }, [availablePlans, durationFilter, searchQuery]);

  // Handle plan preselection if passed
  useEffect(() => {
    if (initialPlan) {
      setTab(initialPlan.kind);
      setSelectedPlan(initialPlan);
    }
  }, [initialPlan]);

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = digits(e.target.value);
    setPhone(raw);
    // If operator changed, clear selected plan
    const newOp = getOperator(raw);
    if (newOp !== operator) {
      setSelectedPlan(null);
    }
  };

  const handleSelectRecent = (p: string) => {
    setPhone(p);
    const newOp = getOperator(p);
    if (newOp !== operator) {
      setSelectedPlan(null);
    }
  };

  const currentPrice = tab === 'airtime' ? airtimeAmount : selectedPlan ? selectedPlan.price : 0;
  const canSubmit = isPhoneValid && currentPrice >= 100;

  const handleBuyClick = () => {
    if (!canSubmit) return;
    onConfirmPurchase(tab, cleanPhone, currentPrice, selectedPlan);
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* View Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Cabine de recharge
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Unités, internet ou appels pour votre compte ou pour un proche.
        </p>
      </div>

      {/* Segmented Control: Unités | Internet | Appels */}
      <div className="bg-slate-200/70 dark:bg-zinc-800 p-1 rounded-2xl grid grid-cols-3 gap-1">
        <button
          onClick={() => {
            setTab('airtime');
            setSelectedPlan(null);
          }}
          className={`min-h-[42px] rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'airtime'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Unités</span>
        </button>

        <button
          onClick={() => {
            setTab('internet');
            setSelectedPlan(null);
          }}
          className={`min-h-[42px] rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'internet'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Internet</span>
        </button>

        <button
          onClick={() => {
            setTab('appels');
            setSelectedPlan(null);
          }}
          className={`min-h-[42px] rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'appels'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Appels</span>
        </button>
      </div>

      {/* Destination Phone Input */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 space-y-3 shadow-xs">
        <label
          htmlFor="dest-phone"
          className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
        >
          Numéro à recharger
        </label>

        <div className="relative">
          <input
            id="dest-phone"
            type="tel"
            inputMode="numeric"
            value={prettyPhone(phone)}
            onChange={handlePhoneInput}
            placeholder="07 00 00 00 00"
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

        {/* Quick Recent Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">Récents :</span>
          {recentPhones.map((p) => {
            const isSelf = p === user.phone;
            const opOfRecent = getOperator(p);
            const isSelected = p === cleanPhone;

            return (
              <button
                key={p}
                type="button"
                onClick={() => handleSelectRecent(p)}
                className={`min-h-[34px] px-3 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/60 dark:border-zinc-700 hover:bg-slate-200'
                }`}
              >
                {opOfRecent && <OperatorLogo operator={opOfRecent} size={14} className="rounded-xs" />}
                <span>{isSelf ? 'Mon numéro' : prettyPhone(p)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT: Airtime or Plans */}
      {tab === 'airtime' ? (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Montant de la recharge d'unités
            </label>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Min. 100 F
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            {AIRTIME_PRESETS.map((amt) => {
              const isSelected = airtimeAmount === amt && !customAirtime;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setAirtimeAmount(amt);
                    setCustomAirtime('');
                  }}
                  className={`min-h-[50px] rounded-2xl border text-sm font-extrabold num-tabular transition-all ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {fmtCFA(amt)}
                </button>
              );
            })}
          </div>

          {/* Custom Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
              Ou saisissez un autre montant libre (F CFA)
            </label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Ex. 1500"
              value={customAirtime}
              onChange={(e) => {
                const val = digits(e.target.value);
                setCustomAirtime(val);
                const num = parseInt(val, 10);
                if (num >= 100) {
                  setAirtimeAmount(num);
                } else if (!val) {
                  setAirtimeAmount(0);
                }
              }}
              className="w-full bg-slate-50 dark:bg-zinc-800/80 border-2 border-slate-200 dark:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-2xl px-4 py-3 text-base font-bold text-slate-900 dark:text-white num-tabular outline-none"
            />
          </div>
        </div>
      ) : (
        /* Plans Catalog Section */
        <div className="space-y-4">
          {!operator ? (
            <div className="bg-slate-100 dark:bg-zinc-800/50 rounded-3xl p-8 text-center border border-dashed border-slate-300 dark:border-zinc-700 space-y-2">
              <Smartphone className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                Saisissez un numéro pour charger les forfaits
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Reconnaissance automatique de MTN, Orange ou Moov avec tarifs officiels.
              </p>
            </div>
          ) : (
            <>
              {/* Duration filters + search */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <OperatorLogo operator={operator} size={20} className="rounded-md" />
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      {availablePlans.length} forfaits {operator} ({tab})
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    {filteredPlans.length} résultat{filteredPlans.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Filter chips */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'Tous' },
                    { id: 'short', label: '1 à 3 jours' },
                    { id: 'medium', label: '5 à 10 jours' },
                    { id: 'long', label: '15 jours et +' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setDurationFilter(f.id as any)}
                      className={`min-h-[34px] px-3.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                        durationFilter === f.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Search input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer par volume ou nom (ex: 1.5 Go, 5 Go, Folie...)"
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Plans List */}
              <div className="space-y-2">
                {filteredPlans.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
                    Aucun forfait ne correspond à ces critères.
                  </div>
                ) : (
                  filteredPlans.map((plan) => {
                    const isSelected = selectedPlan?.id === plan.id;

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlan(plan)}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                          isSelected
                            ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                            : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            {plan.kind === 'internet' ? (
                              <Wifi className="w-5 h-5 stroke-[2.5]" />
                            ) : (
                              <PhoneCall className="w-5 h-5 stroke-[2.5]" />
                            )}
                          </div>

                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 leading-snug">
                              {plan.name}
                            </h4>
                            <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                              {plan.valid}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-black text-base text-slate-900 dark:text-white num-tabular block">
                            {plan.price.toLocaleString('fr-FR')} F
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">CFA</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Sticky Bottom Bar CTA */}
      <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-zinc-950 dark:via-zinc-950/95 pointer-events-none z-30">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleBuyClick}
            className="w-full min-h-[52px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-30 disabled:cursor-not-allowed text-white font-extrabold text-base flex items-center justify-between px-6 shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all"
          >
            <span>
              {tab === 'airtime'
                ? "Acheter des unités"
                : selectedPlan
                ? "Confirmer ce forfait"
                : "Sélectionnez un forfait"}
            </span>
            {currentPrice > 0 && (
              <span className="num-tabular font-black bg-white/20 px-3 py-1 rounded-xl text-sm">
                {fmtCFA(currentPrice)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
