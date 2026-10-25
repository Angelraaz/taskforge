import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutGrid,
  Calendar,
  Clock,
  Columns,
  Rows3,
  Search,
  Settings,
} from 'lucide-react';
import { ViewMode, BoardLayoutMode } from '../types';

interface NavigationTabsProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  boardLayout: BoardLayoutMode;
  onToggleBoardLayout: () => void;
  totalCards: number;
  completedCards: number;
  onOpenSearch: () => void;
  onOpenBoardSettings: () => void;
  activeBoardName: string;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeView,
  onViewChange,
  boardLayout,
  onToggleBoardLayout,
  totalCards,
  completedCards,
  onOpenSearch,
  onOpenBoardSettings,
  activeBoardName,
}) => {
  const views: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'tablero', label: 'Tablero', icon: <LayoutGrid className="w-4 h-4 flex-shrink-0" /> },
    { id: 'calendario', label: 'Calendario', icon: <Calendar className="w-4 h-4 flex-shrink-0" /> },
    { id: 'cronograma', label: 'Cronograma', icon: <Clock className="w-4 h-4 flex-shrink-0" /> },
  ];

  return (
    <div className="w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20 px-3 sm:px-6 py-2 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
        {/* Left: Segmented Navigation Control (Tablero, Calendario, Cronograma) */}
        <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
          {views.map((v) => {
            const isActive = activeView === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onViewChange(v.id)}
                className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 select-none min-h-[38px] ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavView"
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                  {v.icon}
                  <span>{v.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Tools: Search Button + Gear Board Settings Button + View Column/Vertical Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* 1. Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/80 dark:hover:bg-slate-750 border border-slate-200/60 dark:border-slate-700/60 transition-colors min-h-[38px] active:scale-95 shadow-sm"
            title="Buscar tareas en todos los tableros (Ctrl+K)"
            aria-label="Buscar tareas"
          >
            <Search className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span className="hidden sm:inline">Buscar</span>
          </button>

          {/* 2. Board & Settings Gear Button (Placed beside the Column/Vertical toggle button) */}
          <button
            onClick={onOpenBoardSettings}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/80 dark:hover:bg-slate-750 border border-slate-200/60 dark:border-slate-700/60 transition-colors min-h-[38px] active:scale-95 shadow-sm"
            title={`Tablero actual: ${activeBoardName} (Haz clic para cambiar o configurar tableros)`}
            aria-label="Ajustes y cambio de tableros"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span className="max-w-[120px] sm:max-w-[150px] truncate">{activeBoardName}</span>
          </button>

          {/* 3. Column / Vertical Layout Toggle Button (When in board view) */}
          {activeView === 'tablero' && (
            <button
              onClick={onToggleBoardLayout}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/80 dark:hover:bg-slate-750 border border-slate-200/60 dark:border-slate-700/60 transition-colors min-h-[38px] active:scale-95 shadow-sm"
              title={`Modo actual: ${boardLayout === 'horizontal' ? 'Horizontal (Desplazamiento)' : 'Vertical (Apilado móvil)'}`}
              aria-label="Cambiar vista horizontal o vertical"
            >
              {boardLayout === 'horizontal' ? (
                <>
                  <Columns className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span className="text-xs">Columnas</span>
                </>
              ) : (
                <>
                  <Rows3 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span className="text-xs">Vertical</span>
                </>
              )}
            </button>
          )}

          {/* Task progress indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 min-h-[38px]">
            <span>
              {completedCards}/{totalCards} completadas
            </span>
            <div className="w-14 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: totalCards > 0 ? `${Math.round((completedCards / totalCards) * 100)}%` : '0%',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
