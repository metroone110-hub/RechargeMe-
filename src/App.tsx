import React, { useState, useEffect } from 'react';
import { UserAccount, Plan, Transaction, PaymentProvider } from './types';
import { API } from './services/api';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { ReceiptModal, ReceiptRow } from './components/ReceiptModal';
import { ConfirmModal } from './components/ConfirmModal';
import { QuickHelpModal } from './components/QuickHelpModal';
import { AgentDispatchModal } from './components/AgentDispatchModal';
import { LoginView } from './views/LoginView';
import { HomeView } from './views/HomeView';
import { BuyView } from './views/BuyView';
import { RechargeView } from './views/RechargeView';
import { TransferView } from './views/TransferView';
import { HistoryView } from './views/HistoryView';
import { AccountView } from './views/AccountView';
import { fmtCFA, prettyPhone, getOperator } from './data/catalog';

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(() => API.getCurrentAccount());
  const [currentTab, setCurrentTab] = useState<NavTab>('accueil');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [preselectedPlan, setPreselectedPlan] = useState<Plan | null>(null);

  // Modals state
  const [receiptData, setReceiptData] = useState<{
    isOpen: boolean;
    title: string;
    rows: ReceiptRow[];
    refCode: string;
    redirectUrl?: string;
  } | null>(null);

  const [confirmData, setConfirmData] = useState<{
    isOpen: boolean;
    title: string;
    rows: ReceiptRow[];
    total: number;
    enablePaymentSelection: boolean;
    action: (provider: PaymentProvider, payerPhone: string) => Promise<void>;
  } | null>(null);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme on mount and check payment callback params
  useEffect(() => {
    const savedTheme = API.getTheme();
    setTheme(savedTheme);
    API.setTheme(savedTheme);

    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const ref = urlParams.get('reference') || urlParams.get('ref') || urlParams.get('order');
    const dest = urlParams.get('dest');

    if (paymentStatus === 'success' && ref) {
      showToast('Paiement Jeko validé ! Activation en cours...');
      setReceiptData({
        isOpen: true,
        title: 'Paiement Jeko validé avec succès',
        rows: [
          { label: 'Statut du paiement', value: 'Confirmé via Jeko Pay' },
          ...(dest ? [{ label: 'Numéro bénéficiaire', value: prettyPhone(dest) }] : []),
          { label: 'Date', value: new Date().toLocaleDateString('fr-FR') },
        ],
        refCode: ref,
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'error') {
      showToast('Le paiement Jeko a échoué ou a été annulé.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    API.setTheme(nextTheme);
  };

  const handleLogout = () => {
    API.logout();
    setUser(null);
    setCurrentTab('accueil');
    showToast('Déconnecté avec succès');
  };

  const handleToggleHideBalance = () => {
    if (!user) return;
    const isHidden = API.toggleHideBalance();
    setUser({ ...user, hideBalance: isHidden });
  };

  // Helper to refresh user state from storage
  const refreshUser = () => {
    const updated = API.getCurrentAccount();
    if (updated) {
      setUser({ ...updated });
    }
  };

  // Handle Quick Plan Selection from HomeView
  const handleSelectQuickPlan = (plan: Plan) => {
    setPreselectedPlan(plan);
    setCurrentTab('acheter');
  };

  // Handle Purchase Confirmation flow
  const handleConfirmPurchase = (
    type: 'airtime' | 'internet' | 'appels',
    phone: string,
    amount: number,
    plan: Plan | null
  ) => {
    if (!user) return;
    const op = getOperator(phone) || 'Orange';
    const prodName = type === 'airtime' ? `Unités ${op}` : plan ? plan.name : `Forfait ${op}`;

    const summaryRows: ReceiptRow[] = [
      { label: 'Produit', value: prodName },
      ...(plan ? [{ label: 'Validité', value: plan.valid }] : []),
      { label: 'Numéro destinataire', value: `${prettyPhone(phone)} (${op})` },
      { label: 'Montant total', value: fmtCFA(amount) },
    ];

    setConfirmData({
      isOpen: true,
      title: "Confirmation d'achat",
      rows: summaryRows,
      total: amount,
      enablePaymentSelection: true,
      action: async (provider: PaymentProvider, payerPhone: string) => {
        let res;
        if (type === 'airtime') {
          res = await API.buyAirtime({
            operator: op,
            phone,
            amount,
            payWith: provider,
            payer: payerPhone,
          });
        } else if (plan) {
          res = await API.buyPlan({
            operator: op,
            phone,
            plan,
            payWith: provider,
            payer: payerPhone,
          });
        }

        if (res && res.ok) {
          refreshUser();
          setConfirmData(null);

          // Redirection directe vers la page de paiement sécurisée Jeko
          if (res.redirectUrl && provider !== 'Solde RechargeMe') {
            window.location.href = res.redirectUrl;
            return;
          }

          setReceiptData({
            isOpen: true,
            title: provider === 'Solde RechargeMe' ? 'Achat validé avec succès' : 'Paiement Jeko initié',
            rows: [
              ...summaryRows,
              { label: 'Moyen de paiement', value: provider },
              { label: 'Date', value: new Date().toLocaleDateString('fr-FR') },
            ],
            refCode: res.ref,
            redirectUrl: res.redirectUrl,
          });
          setPreselectedPlan(null);
        } else {
          throw new Error(res?.error || "L'opération a échoué. Veuillez réessayer.");
        }
      },
    });
  };

  // Handle Recharge flow
  const handleConfirmRecharge = (provider: PaymentProvider, amount: number) => {
    if (!user) return;

    const summaryRows: ReceiptRow[] = [
      { label: 'Moyen de paiement', value: provider },
      { label: 'Numéro crédité', value: prettyPhone(user.phone) },
      { label: 'Montant rechargé', value: fmtCFA(amount) },
      { label: 'Nouveau solde', value: fmtCFA(user.balance + amount) },
    ];

    setConfirmData({
      isOpen: true,
      title: 'Confirmer la recharge',
      rows: summaryRows,
      total: amount,
      enablePaymentSelection: false,
      action: async (_p, payerPhone) => {
        const res = await API.topUp({
          provider,
          phone: user.phone,
          amount,
        });

        if (res && res.ok) {
          refreshUser();
          setConfirmData(null);
          setReceiptData({
            isOpen: true,
            title: 'Compte rechargé avec succès',
            rows: summaryRows,
            refCode: res.ref,
          });
          setCurrentTab('accueil');
        } else {
          throw new Error(res?.error || "La recharge a échoué. Veuillez réessayer.");
        }
      },
    });
  };

  // Handle Transfer flow
  const handleConfirmTransfer = (toPhone: string, amount: number) => {
    if (!user) return;
    const op = getOperator(toPhone) || 'Moov';

    const summaryRows: ReceiptRow[] = [
      { label: 'Destinataire', value: `${prettyPhone(toPhone)} (${op})` },
      { label: 'Montant transféré', value: fmtCFA(amount) },
      { label: 'Frais de service', value: '0 F CFA' },
      { label: 'Solde restant', value: fmtCFA(user.balance - amount) },
    ];

    setConfirmData({
      isOpen: true,
      title: 'Confirmer le transfert',
      rows: summaryRows,
      total: amount,
      enablePaymentSelection: false,
      action: async () => {
        const res = await API.transfer({
          to: toPhone,
          amount,
        });

        if (res && res.ok) {
          refreshUser();
          setConfirmData(null);
          setReceiptData({
            isOpen: true,
            title: 'Transfert effectué avec succès',
            rows: summaryRows,
            refCode: res.ref,
          });
          setCurrentTab('accueil');
        } else {
          throw new Error(res?.error || "Le transfert a échoué. Veuillez réessayer.");
        }
      },
    });
  };

  // View existing transaction receipt from history
  const handleViewReceipt = (tx: Transaction) => {
    setReceiptData({
      isOpen: true,
      title: tx.amount > 0 ? 'Détail de la recharge' : "Détail de l'opération",
      rows: [
        { label: 'Opération', value: tx.label },
        { label: 'Détail / Destinataire', value: tx.sub },
        { label: 'Montant', value: fmtCFA(tx.amount) },
        { label: 'Date', value: new Date(tx.date).toLocaleString('fr-FR') },
        { label: 'Statut', value: 'Succès (Confirmé)' },
      ],
      refCode: tx.ref,
    });
  };

  // If not logged in, show Login & Presentation View
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
        <Header
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogout={() => {}}
          onOpenSupport={() => setIsHelpOpen(true)}
        />
        <LoginView
          onLoginSuccess={(loggedUser, prePlan) => {
            setUser(loggedUser);
            if (prePlan) {
              setPreselectedPlan(prePlan);
              setCurrentTab('acheter');
              showToast(`Forfait sélectionné : ${prePlan.name}`);
            } else {
              setCurrentTab('accueil');
              showToast('Bienvenue sur votre cabine RechargeMe !');
            }
          }}
          onOpenSupport={() => setIsHelpOpen(true)}
        />
        {isHelpOpen && <QuickHelpModal onClose={() => setIsHelpOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col justify-between">
      {/* Toast message */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-full text-xs font-bold shadow-xl animate-in fade-in slide-in-from-top duration-200">
          {toastMessage}
        </div>
      )}

      {/* Main Top Header */}
      <Header
        phone={user.phone}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        onOpenSupport={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 pt-6 pb-12">
        {currentTab === 'accueil' && (
          <HomeView
            user={user}
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectQuickPlan={handleSelectQuickPlan}
            onViewReceipt={handleViewReceipt}
            onToggleHideBalance={handleToggleHideBalance}
          />
        )}

        {currentTab === 'acheter' && (
          <BuyView
            user={user}
            initialPlan={preselectedPlan}
            onConfirmPurchase={handleConfirmPurchase}
          />
        )}

        {currentTab === 'recharger' && (
          <RechargeView
            user={user}
            onBack={() => setCurrentTab('accueil')}
            onConfirmRecharge={handleConfirmRecharge}
          />
        )}

        {currentTab === 'transferer' && (
          <TransferView user={user} onConfirmTransfer={handleConfirmTransfer} />
        )}

        {currentTab === 'historique' && (
          <HistoryView user={user} onViewReceipt={handleViewReceipt} />
        )}

        {currentTab === 'compte' && (
          <AccountView
            user={user}
            onLogout={handleLogout}
            onOpenSupport={() => setIsHelpOpen(true)}
            onOpenAgent={() => setIsAgentOpen(true)}
          />
        )}
      </main>

      {/* Bottom Thumb Navigation Bar */}
      <BottomNav currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />

      {/* Modals */}
      {receiptData?.isOpen && (
        <ReceiptModal
          title={receiptData.title}
          rows={receiptData.rows}
          refCode={receiptData.refCode}
          redirectUrl={receiptData.redirectUrl}
          onClose={() => setReceiptData(null)}
        />
      )}

      {confirmData?.isOpen && (
        <ConfirmModal
          title={confirmData.title}
          rows={confirmData.rows}
          total={confirmData.total}
          userBalance={user.balance}
          userPhone={user.phone}
          enablePaymentSelection={confirmData.enablePaymentSelection}
          onConfirm={confirmData.action}
          onCancel={() => setConfirmData(null)}
        />
      )}

      {isHelpOpen && (
        <QuickHelpModal userPhone={user.phone} onClose={() => setIsHelpOpen(false)} />
      )}

      {isAgentOpen && (
        <AgentDispatchModal onClose={() => setIsAgentOpen(false)} />
      )}
    </div>
  );
}
