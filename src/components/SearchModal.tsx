import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Folder, Calendar, CheckSquare, Tag, ArrowRight } from 'lucide-react';
import { Board, TaskCard, BoardColumn } from '../types';

interface SearchResult {
  board: Board;
  column: BoardColumn;
  card: TaskCard;
  matchField: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: Board[];
  onSelectResult: (boardId: string, card: TaskCard) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  boards,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results: SearchResult[] = [];
  const q = query.trim().toLowerCase();

  if (q) {
    boards.forEach((board) => {
      board.columns.forEach((col) => {
        col.cards.forEach((card) => {
          let matchField = '';
          if (card.text.toLowerCase().includes(q)) {
            matchField = 'Título';
          } else if (card.description?.toLowerCase().includes(q)) {
            matchField = 'Descripción';
          } else if (card.labels?.some((l) => l.name.toLowerCase().includes(q))) {
            matchField = 'Etiqueta';
          } else if (card.checklist?.some((c) => c.text.toLowerCase().includes(q))) {
            matchField = 'Subtarea';
          }

          if (matchField) {
            results.push({ board, column: col, card, matchField });
          }
        });
      });
    });
  }

  const highlightMatch = (text: string) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q ? (
        <mark key={i} className="bg-amber-300 dark:bg-amber-500/30 text-slate-900 dark:text-white rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar tareas, subtareas, notas en todos los tableros..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2.5 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 custom-scroll">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Escribe algo para buscar en tiempo real en todos tus tableros y columnas.
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No se encontraron coincidencias para "{query}".
            </div>
          ) : (
            <>
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {results.length} {results.length === 1 ? 'coincidencia encontrada' : 'coincidencias encontradas'}
              </div>
              {results.map(({ board, column, card, matchField }) => (
                <div
                  key={card.id}
                  onClick={() => {
                    onSelectResult(board.id, card);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-850 hover:bg-indigo-50/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-750 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {card.completed ? '✅ ' : ''}
                      {highlightMatch(card.text)}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                        <Folder className="w-3 h-3" />
                        {board.name}
                      </span>
                      <span>›</span>
                      <span>{column.name}</span>
                      <span>·</span>
                      <span className="text-slate-500">Coincidencia en: {matchField}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
