import React from 'react';
import { Home, Smartphone, Send, Clock, User } from 'lucide-react';

export type NavTab = 'accueil' | 'acheter' | 'transferer' | 'historique' | 'compte' | 'recharger';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'accueil' as NavTab, label: 'Accueil', icon: Home },
    { id: 'acheter' as NavTab, label: 'Acheter', icon: Smartphone },
    { id: 'transferer' as NavTab, label: 'Envoyer', icon: Send },
    { id: 'historique' as NavTab, label: 'Historique', icon: Clock },
    { id: 'compte' as NavTab, label: 'Compte', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 px-3 pointer-events-none"
      aria-label="Navigation principale"
    >
      <div className="max-w-md mx-auto bg-slate-900/95 dark:bg-zinc-900/95 text-white backdrop-blur-xl border border-slate-800/80 dark:border-zinc-800 rounded-full shadow-2xl shadow-black/30 px-3 py-1.5 pointer-events-auto flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id || (tab.id === 'accueil' && currentTab === 'recharger');

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white font-bold scale-[1.03]'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
