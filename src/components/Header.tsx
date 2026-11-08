import React from 'react';
import { Moon, Sun, MessageCircle, LogOut } from 'lucide-react';
import { prettyPhone, getOperator } from '../data/catalog';
import { OperatorLogo } from '../data/logos';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  phone?: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenSupport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  phone,
  theme,
  onToggleTheme,
  onLogout,
  onOpenSupport,
}) => {
  const op = phone ? getOperator(phone) : null;

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-15 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <span className="font-extrabold text-sm tracking-tighter">RM</span>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            RechargeMe
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton variant="badge" />

          {phone && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-zinc-800">
              {op && <OperatorLogo operator={op} size={18} className="rounded-md" />}
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 num-tabular">
                {prettyPhone(phone)}
              </span>
            </div>
          )}

          {/* Support WhatsApp Trigger */}
          <button
            onClick={onOpenSupport}
            aria-label="Contacter le support"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            title="Assistance & WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            aria-label="Changer le thème"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Logout */}
          {phone && (
            <button
              onClick={onLogout}
              aria-label="Se déconnecter"
              className="min-h-[40px] px-3 flex items-center gap-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sortir</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
