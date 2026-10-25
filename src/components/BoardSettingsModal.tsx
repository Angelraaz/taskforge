import React, { useState } from 'react';
import {
  X,
  Printer,
  Trash2,
  Layout,
  CheckCircle2,
  Palette,
  Plus,
  FolderKanban,
  Settings2,
  Check,
} from 'lucide-react';
import { Board } from '../types';

interface BoardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: Board[];
  activeBoardId: string;
  onSelectBoard: (boardId: string) => void;
  onNewBoard: () => void;
  board: Board;
  onSaveBoard: (boardId: string, name: string, description: string, color: string) => void;
  onDeleteBoard: (boardId: string) => void;
  canDelete: boolean;
}

const THEME_OPTIONS = [
  { id: 'slate', name: 'Obsidiana / Slate', bg: '#0f172a' },
  { id: 'indigo', name: 'Índigo Profundo', bg: '#1e1b4b' },
  { id: 'zinc', name: 'Grafito Minimalista', bg: '#18181b' },
  { id: 'blue', name: 'Azul Marino', bg: '#1a2942' },
  { id: 'teal', name: 'Turquesa', bg: '#042f2e' },
  { id: 'neutral', name: 'Neutro Claro', bg: '#f8fafc' },
];

export const BoardSettingsModal: React.FC<BoardSettingsModalProps> = ({
  isOpen,
  onClose,
  boards,
  activeBoardId,
  onSelectBoard,
  onNewBoard,
  board,
  onSaveBoard,
  onDeleteBoard,
  canDelete,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'boards' | 'settings'>('boards');
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description || '');
  const [backgroundColor, setBackgroundColor] = useState(board.backgroundColor || '#0f172a');

  // Stats
  let totalCards = 0;
  let completedCards = 0;
  board.columns.forEach((col) => {
    totalCards += col.cards.length;
    col.cards.forEach((card) => {
      if (card.completed) completedCards++;
    });
  });

  const completionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    onSaveBoard(board.id, name.trim() || board.name, description.trim(), backgroundColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Gestión de Tableros
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cambia de proyecto o personaliza
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="px-4 sm:px-6 pt-3">
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl">
            <button
              onClick={() => setActiveTab('boards')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'boards'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              Tus Tableros ({boards.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layout className="w-4 h-4" />
              Ajustes del Tablero
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 custom-scroll flex-1">
          {activeTab === 'boards' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona un tablero para abrirlo o crea uno nuevo:
              </p>

              {/* Boards List */}
              <div className="space-y-2">
                {boards.map((b) => {
                  const isActive = b.id === activeBoardId;
                  const total = b.columns.reduce((acc, col) => acc + col.cards.length, 0);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        onSelectBoard(b.id);
                        onClose();
                      }}
                      className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {b.name}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {b.columns.length} columnas · {total} tareas
                        </p>
                      </div>

                      {isActive ? (
                        <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">Abrir</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* New Board button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setTimeout(() => onNewBoard(), 100);
                }}
                className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <Plus className="w-4 h-4" />
                Crear Nuevo Tablero
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats Box */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {board.columns.length}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Columnas</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {totalCards}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Tarjetas</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {completionRate}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Progreso</div>
                </div>
              </div>

              {/* Name input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Nombre del Tablero
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Descripción o Propósito
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Descripción breve..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Background color choice */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-indigo-500" />
                    Color de Fondo
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {THEME_OPTIONS.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setBackgroundColor(theme.bg)}
                      className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                        backgroundColor === theme.bg
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-400/30 flex-shrink-0"
                        style={{ backgroundColor: theme.bg }}
                      />
                      <span className="truncate text-[11px]">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Print and delete actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir tablero
                </button>

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Estás seguro de eliminar el tablero "${board.name}"?`)) {
                        onDeleteBoard(board.id);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar tablero
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900"
          >
            Cerrar
          </button>
          {activeTab === 'settings' && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm"
            >
              Guardar Cambios
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
