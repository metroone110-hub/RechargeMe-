import React, { useState, useEffect, useMemo } from 'react';
import {
  Wifi,
  PhoneCall,
  Smartphone,
  Search,
  Check,
  User,
  Users,
  Plus,
  Trash2,
  BookmarkPlus,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Plan, PlanKind, UserAccount, Operator, BeneficiaryContact } from '../types';
import { getOperator, isValidPhone, prettyPhone, digits, fmtCFA, getCatalogPlans } from '../data/catalog';
import { OperatorLogo } from '../data/logos';
import { API } from '../services/api';

interface BuyViewProps {
  user: UserAccount;
  initialPlan?: Plan | null;
  onConfirmPurchase: (
    type: 'airtime' | 'internet' | 'appels',
    phone: string,
    amount: number,
    plan: Plan | null,
    operatorOverride?: Operator
  ) => void;
}

const AIRTIME_PRESETS = [100, 200, 500, 1000, 2000, 5000];

export const BuyView: React.FC<BuyViewProps> = ({ user, initialPlan, onConfirmPurchase }) => {
  // Mode: Pour moi ou Pour un proche
  const [targetMode, setTargetMode] = useState<'self' | 'other'>('self');

  // Opérateur actif pour le catalogue (Orange, MTN, Moov)
  const initialOp = initialPlan?.operator || getOperator(user.phone) || 'Orange';
  const [selectedOperator, setSelectedOperator] = useState<Operator>(initialOp);

  // Numéro destinataire
  const [phone, setPhone] = useState(user.phone);

  // Type de produit : unités, internet, appels
  const [tab, setTab] = useState<'airtime' | 'internet' | 'appels'>(
    initialPlan ? initialPlan.kind : 'airtime'
  );
  const [airtimeAmount, setAirtimeAmount] = useState<number>(500);
  const [customAirtime, setCustomAirtime] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(initialPlan || null);
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Contacts / Proches
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryContact[]>(() => API.getBeneficiaries());
  const [contactSearch, setContactSearch] = useState('');
  const [showSaveContactForm, setShowSaveContactForm] = useState(false);
  const [contactNameInput, setContactNameInput] = useState('');

  // Sync initialPlan if passed from another view
  useEffect(() => {
    if (initialPlan) {
      setTab(initialPlan.kind);
      setSelectedPlan(initialPlan);
      setSelectedOperator(initialPlan.operator);
    }
  }, [initialPlan]);

  const cleanPhone = digits(phone);
  const detectedOperator = getOperator(cleanPhone);
  const isPhoneValid = isValidPhone(cleanPhone);

  // Numéros récents tirés des transactions
  const recentPhones = useMemo(() => {
    const list = [
      user.phone,
      ...user.tx.map((t) => t.phone).filter((p): p is string => !!p && p.length === 10),
    ];
    return Array.from(new Set(list)).slice(0, 5);
  }, [user.phone, user.tx]);

  // Filtrage des contacts selon la recherche
  const filteredBeneficiaries = useMemo(() => {
    if (!contactSearch.trim()) return beneficiaries;
    const q = contactSearch.toLowerCase();
    return beneficiaries.filter(
      (b) => b.name.toLowerCase().includes(q) || b.phone.includes(digits(q))
    );
  }, [beneficiaries, contactSearch]);

  // Plans disponibles pour l'opérateur sélectionné
  const availablePlans = useMemo(() => {
    if (tab === 'airtime') return [];
    return getCatalogPlans(selectedOperator, tab as PlanKind);
  }, [selectedOperator, tab]);

  // Filtre des forfaits (durée & texte)
  const filteredPlans = useMemo(() => {
    return availablePlans.filter((p) => {
      let matchesDuration = true;
      if (durationFilter === 'short') matchesDuration = p.days <= 3;
      if (durationFilter === 'medium') matchesDuration = p.days >= 5 && p.days <= 10;
      if (durationFilter === 'long') matchesDuration = p.days >= 15;

      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.valid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.price.toString().includes(searchQuery);

      return matchesDuration && matchesSearch;
    });
  }, [availablePlans, durationFilter, searchQuery]);

  // Basculer vers "Pour moi"
  const handleSelectSelf = () => {
    setTargetMode('self');
    setPhone(user.phone);
    const op = getOperator(user.phone) || 'Orange';
    setSelectedOperator(op);
    setSelectedPlan(null);
  };

  // Basculer vers "Pour un proche"
  const handleSelectOther = () => {
    setTargetMode('other');
    // Si le numéro actuel était celui de l'utilisateur, vider pour encourager la sélection du proche
    if (phone === user.phone) {
      setPhone('');
    }
  };

  // Sélectionner un contact proche
  const handleSelectBeneficiary = (contact: BeneficiaryContact) => {
    setPhone(contact.phone);
    setSelectedOperator(contact.operator);
    setSelectedPlan(null);
    setTargetMode('other');
  };

  // Sauvegarder le numéro comme contact favori
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) return;
    const updated = API.saveBeneficiary({
      name: contactNameInput.trim() || `Proche ${selectedOperator}`,
      phone: cleanPhone,
      operator: selectedOperator,
    });
    setBeneficiaries(updated);
    setShowSaveContactForm(false);
    setContactNameInput('');
  };

  // Supprimer un contact
  const handleDeleteContact = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = API.deleteBeneficiary(id);
    setBeneficiaries(updated);
  };

  // Saisie du numéro
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = digits(e.target.value);
    setPhone(raw);
    const autoOp = getOperator(raw);
    if (autoOp && autoOp !== selectedOperator) {
      setSelectedOperator(autoOp);
      setSelectedPlan(null);
    }
  };

  // Changement explicite d'opérateur
  const handleSelectOperator = (op: Operator) => {
    setSelectedOperator(op);
    setSelectedPlan(null);
  };

  const currentPrice = tab === 'airtime' ? airtimeAmount : selectedPlan ? selectedPlan.price : 0;
  const canSubmit = isPhoneValid && currentPrice >= 100;

  const handleBuyClick = () => {
    if (!canSubmit) return;
    onConfirmPurchase(tab, cleanPhone, currentPrice, selectedPlan, selectedOperator);
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* En-tête de la vue */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Cabine de recharge
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Unités, forfaits internet et appels pour votre ligne ou pour un proche.
        </p>
      </div>

      {/* SÉLECTEUR DE BÉNÉFICIAIRE : Pour moi / Pour un proche */}
      <div className="bg-slate-200/80 dark:bg-zinc-800 p-1 rounded-2xl grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={handleSelectSelf}
          className={`min-h-[44px] rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            targetMode === 'self'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Mon numéro ({prettyPhone(user.phone).slice(0, 8)}...)</span>
        </button>

        <button
          type="button"
          onClick={handleSelectOther}
          className={`min-h-[44px] rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            targetMode === 'other'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pour un proche / Autre</span>
        </button>
      </div>

      {/* SÉLECTION EXPLICITE DU RÉSEAU (Orange, MTN, Moov) */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            1. Choisissez le réseau à recharger
          </label>
          <span className="text-[11px] font-bold text-slate-400">
            {availablePlans.length > 0 ? `${availablePlans.length} forfaits` : 'Unités & Pass'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {(['Orange', 'MTN', 'Moov'] as Operator[]).map((op) => {
            const isSelected = selectedOperator === op;
            return (
              <button
                key={op}
                type="button"
                onClick={() => handleSelectOperator(op)}
                className={`min-h-[64px] p-2.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                }`}
              >
                <OperatorLogo operator={op} size={28} className="rounded-lg shadow-none" />
                <span className={`text-xs font-black ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                  {op}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CHAMP NUMÉRO & RECHERCHE CONTACTS */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <label
            htmlFor="dest-phone-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
          >
            2. Numéro destinataire {selectedOperator}
          </label>
          {targetMode === 'other' && isPhoneValid && (
            <button
              type="button"
              onClick={() => setShowSaveContactForm(!showSaveContactForm)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>{showSaveContactForm ? 'Fermer' : 'Enregistrer ce contact'}</span>
            </button>
          )}
        </div>

        {/* Input numéro */}
        <div className="relative">
          <input
            id="dest-phone-input"
            type="tel"
            inputMode="numeric"
            value={prettyPhone(phone)}
            onChange={handlePhoneInput}
            placeholder={
              selectedOperator === 'Orange'
                ? 'Ex: 07 00 00 00 00'
                : selectedOperator === 'MTN'
                ? 'Ex: 05 00 00 00 00'
                : 'Ex: 01 00 00 00 00'
            }
            className="w-full bg-slate-50 dark:bg-zinc-800/80 border-2 border-slate-200 dark:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-base font-bold text-slate-900 dark:text-white num-tabular outline-none transition-all"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {detectedOperator && (
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-700 px-2 py-1 rounded-lg shadow-xs animate-in fade-in">
                <OperatorLogo operator={detectedOperator} size={18} className="rounded-xs" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-200">
                  {detectedOperator}
                </span>
              </div>
            )}
            {isPhoneValid && (
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </div>
        </div>

        {/* Formulaire inline de sauvegarde de contact */}
        {showSaveContactForm && isPhoneValid && (
          <form onSubmit={handleSaveContact} className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-2 animate-in fade-in">
            <label className="text-xs font-bold text-indigo-900 dark:text-indigo-200 block">
              Nom du contact pour {prettyPhone(phone)} :
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex. Maman, Frère, Collègue..."
                value={contactNameInput}
                onChange={(e) => setContactNameInput(e.target.value)}
                className="flex-1 bg-white dark:bg-zinc-900 border border-indigo-300 dark:border-indigo-700 rounded-xl px-3 py-2 text-xs font-bold outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-indigo-700"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        )}

        {/* Recherche et sélection dans le carnet de contacts (mode Proche) */}
        {targetMode === 'other' && (
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                Rechercher un proche ou contact :
              </span>
              <span className="text-[10px] text-slate-400">
                {beneficiaries.length} enregistré{beneficiaries.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Barre de recherche de contact */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Rechercher par nom ou numéro..."
                className="w-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>

            {/* Liste des contacts enregistrés */}
            {filteredBeneficiaries.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {filteredBeneficiaries.map((b) => {
                  const isSelected = b.phone === cleanPhone;
                  return (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBeneficiary(b)}
                      className={`cursor-pointer shrink-0 min-h-[46px] px-3.5 py-1.5 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100'
                      }`}
                    >
                      <OperatorLogo operator={b.operator} size={18} className="rounded-xs" />
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white block leading-tight">
                          {b.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 num-tabular">
                          {prettyPhone(b.phone)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteContact(b.id, e)}
                        className="ml-1 p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Supprimer ce contact"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : contactSearch ? (
              <p className="text-[11px] text-slate-400 italic">Aucun contact trouvé pour cette recherche.</p>
            ) : null}

            {/* Puces des numéros récents */}
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
                    onClick={() => {
                      setPhone(p);
                      if (opOfRecent) setSelectedOperator(opOfRecent);
                      setSelectedPlan(null);
                    }}
                    className={`min-h-[32px] px-3 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/60 dark:border-zinc-700 hover:bg-slate-200'
                    }`}
                  >
                    {opOfRecent && <OperatorLogo operator={opOfRecent} size={14} className="rounded-xs" />}
                    <span>{isSelf ? 'Moi' : prettyPhone(p)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SÉLECTEUR DE TYPE : Unités | Internet | Appels */}
      <div className="bg-slate-200/80 dark:bg-zinc-800 p-1 rounded-2xl grid grid-cols-3 gap-1">
        <button
          type="button"
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
          type="button"
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
          type="button"
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

      {/* CONTENU PRINCIPAL : UNITÉS OU FORFAITS */}
      {tab === 'airtime' ? (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <OperatorLogo operator={selectedOperator} size={20} className="rounded-md" />
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Montant d'unités {selectedOperator}
              </label>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Min. 100 F
            </span>
          </div>

          {/* Grille de montants rapides */}
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

          {/* Montant libre */}
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
        /* Catalogue des forfaits de l'opérateur sélectionné */
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <OperatorLogo operator={selectedOperator} size={20} className="rounded-md" />
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {availablePlans.length} forfaits {selectedOperator} ({tab})
                </span>
              </div>

              <span className="text-xs text-slate-400">
                {filteredPlans.length} résultat{filteredPlans.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Filtres de durée */}
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

            {/* Barre de recherche dans les forfaits */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Rechercher un pass ${selectedOperator} (ex: 1 Go, 2.5 Go, Folie...)`}
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Liste des forfaits */}
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
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                            {plan.valid}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {plan.operator}
                          </span>
                        </div>
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
        </div>
      )}

      {/* Avertissement si le numéro n'est pas encore renseigné */}
      {!isPhoneValid && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {targetMode === 'other'
              ? `Veuillez renseigner ou sélectionner le numéro à 10 chiffres du destinataire (${selectedOperator}).`
              : `Le numéro associé à votre compte doit comporter 10 chiffres.`}
          </span>
        </div>
      )}

      {/* Barre d'action fixe en bas */}
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
                ? `Recharger ${selectedOperator}`
                : selectedPlan
                ? `Confirmer ce pass ${selectedOperator}`
                : `Choisir un forfait ${selectedOperator}`}
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
