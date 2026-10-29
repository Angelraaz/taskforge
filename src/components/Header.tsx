import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Laptop,
  Check,
  User,
  Hammer,
  Cloud,
  CloudOff,
  Loader2,
  Printer,
  Users,
} from 'lucide-react';
import { ThemeMode, UserSession } from '../types';

export type SyncStatus = 'saving' | 'synced' | 'error' | 'offline';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onOpenWorkgroup?: () => void;
  onPrint?: () => void;
  alertCount: number;
  themeMode: ThemeMode;
  onSelectThemeMode: (mode: ThemeMode) => void;
  currentUser: UserSession | null;
  syncStatus?: SyncStatus;
  memberCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenAuth,
  onOpenWorkgroup,
  onPrint,
  alertCount,
  themeMode,
  onSelectThemeMode,
  currentUser,
  syncStatus = 'synced',
  memberCount = 1,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand & Subtitle with v2.1 */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
            <Hammer className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight leading-tight flex items-center">
              <span className="text-indigo-600 dark:text-indigo-400">Task</span>
              <span className="text-cyan-500 dark:text-cyan-400">Forge</span>
            </h1>
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide flex items-center gap-1.5 mt-0.5">
              <span>by AJRC SERVICIOS</span>
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                v2.1
              </span>
            </div>
          </div>
        </div>

        {/* Right Tools: Workgroup, Print, Sync Pill, Notifications, Theme, User */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Supabase Single Source of Truth Status Pill */}
          {currentUser && (
            <div className="hidden lg:flex items-center">
              {syncStatus === 'saving' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Guardando en Supabase...
                </span>
              )}
              {syncStatus === 'synced' && (
                <span
                  title="Supabase es la Única Fuente de la Verdad"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                >
                  <Cloud className="w-3 h-3 text-emerald-500" />
                  Supabase · En Línea
                </span>
              )}
              {syncStatus === 'error' && (
                <span
                  title="Hubo un problema al sincronizar con Supabase"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60"
                >
                  <CloudOff className="w-3 h-3" />
                  Error Supabase
                </span>
              )}
            </div>
          )}

          {/* Grupo de Trabajo / Colaboradores Button */}
          {onOpenWorkgroup && (
            <button
              onClick={onOpenWorkgroup}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all border border-indigo-200/80 dark:border-indigo-800/80 active:scale-95 shadow-sm text-xs font-semibold"
              title="Grupo de Trabajo y Colaboradores"
            >
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Equipo</span>
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {memberCount}
              </span>
            </button>
          )}

          {/* Quick Print Button */}
          {onPrint && (
            <button
              onClick={onPrint}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/80 dark:hover:bg-slate-750 transition-all border border-slate-200/50 dark:border-slate-700/50 active:scale-95 shadow-sm"
              title="Imprimir Tablero (Vista limpia)"
              aria-label="Imprimir"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}

          {/* Notification Bell with Badge */}
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

          {/* Theme Mode Selector (Auto / Light / Dark) */}
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

          {/* User / Auth Trigger */}
          <button
            onClick={onOpenAuth}
            className={`h-10 px-3 rounded-xl flex items-center gap-2 text-xs font-semibold border transition-all active:scale-95 shadow-sm ${
              currentUser
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80'
            }`}
            title={currentUser ? `Conectado como ${currentUser.email}` : 'Iniciar sesión en la Nube'}
          >
            <User className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline max-w-[120px] truncate">
              {currentUser ? currentUser.email.split('@')[0] : 'Invitado'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
