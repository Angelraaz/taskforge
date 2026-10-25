import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Laptop,
  User,
  Hammer,
  Check,
} from 'lucide-react';
import { ThemeMode, UserSession } from '../types';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  alertCount: number;
  themeMode: ThemeMode;
  onSelectThemeMode: (mode: ThemeMode) => void;
  currentUser: UserSession | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenAuth,
  alertCount,
  themeMode,
  onSelectThemeMode,
  currentUser,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand & Subtitle with v1.5 */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
            <Hammer className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight flex items-center">
              Task<span className="text-indigo-600 dark:text-indigo-400">Forge</span>
            </h1>
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide flex items-center gap-1.5 mt-0.5">
              <span>by AJRC SERVICIOS</span>
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                v1.5
              </span>
            </div>
          </div>
        </div>

        {/* Right Tools: Notifications, Theme, User */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* 1. Notification Bell with Badge */}
          <button
            onClick={onOpenNotifications}
            className={`w-10 h-10 rounded-xl flex items-center justify-center relative bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all border border-slate-200/50 dark:border-slate-700/50 active:scale-95 shadow-sm ${
              alertCount > 0 ? 'text-amber-500 dark:text-amber-400' : ''
            }`}
            title="Notificaciones y Vencimientos"
            aria-label="Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-sm">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </button>

          {/* 2. Theme Mode Selector (Auto / Light / Dark) */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all border border-slate-200/50 dark:border-slate-700/50 active:scale-95 shadow-sm"
              title={`Tema: ${themeMode}`}
              aria-label="Cambiar tema de color"
            >
              {themeMode === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : themeMode === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Laptop className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onSelectThemeMode('auto');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    themeMode === 'auto'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Laptop className="w-3.5 h-3.5" />
                    Automático
                  </span>
                  {themeMode === 'auto' && <Check className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => {
                    onSelectThemeMode('light');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    themeMode === 'light'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    Claro
                  </span>
                  {themeMode === 'light' && <Check className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => {
                    onSelectThemeMode('dark');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    themeMode === 'dark'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    Oscuro
                  </span>
                  {themeMode === 'dark' && <Check className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>

          {/* 3. User Account / Supabase */}
          <button
            onClick={onOpenAuth}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border active:scale-95 shadow-sm ${
              currentUser
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border-slate-200/50 dark:border-slate-700/50'
            }`}
            title={currentUser ? `Conectado: ${currentUser.email}` : 'Cuenta / Sincronización'}
            aria-label="Cuenta de usuario"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
