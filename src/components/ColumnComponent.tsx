import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, MoreHorizontal, Pencil, Trash2, Palette, Check } from 'lucide-react';
import { BoardColumn, TaskCard } from '../types';
import { CardItem } from './CardItem';

interface ColumnComponentProps {
  column: BoardColumn;
  allColumns: BoardColumn[];
  onAddCard: (columnId: string, text: string) => void;
  onEditColumn: (columnId: string, name: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onCardClick: (card: TaskCard) => void;
  onToggleComplete: (cardId: string) => void;
  onMoveCard: (cardId: string, targetColumnId: string) => void;
  onDeleteCard: (cardId: string) => void;
  draggedCard: TaskCard | null;
  onCardDragStart: (e: React.DragEvent, card: TaskCard) => void;
  onCardDragEnd: () => void;
  onColumnDrop: (columnId: string) => void;
}

export const ColumnComponent: React.FC<ColumnComponentProps> = ({
  column,
  allColumns,
  onAddCard,
  onEditColumn,
  onDeleteColumn,
  onCardClick,
  onToggleComplete,
  onMoveCard,
  onDeleteCard,
  draggedCard,
  onCardDragStart,
  onCardDragEnd,
  onColumnDrop,
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardText, setNewCardText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.name);
  const [showMenu, setShowMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardText.trim()) return;
    onAddCard(column.id, newCardText.trim());
    setNewCardText('');
    setIsAddingCard(false);
  };

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnTitle.trim()) return;
    onEditColumn(column.id, columnTitle.trim());
    setIsEditingTitle(false);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only reset if left the column container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onColumnDrop(column.id);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-shrink-0 w-80 max-w-[85vw] sm:max-w-none bg-slate-100/70 dark:bg-slate-900/80 rounded-2xl p-3 border transition-all duration-200 ${
        isDragOver
          ? 'border-indigo-500/80 dark:border-indigo-400/80 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-lg'
          : 'border-slate-200/80 dark:border-slate-800 shadow-sm'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1.5 py-1 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Vibrant Column Accent Dot */}
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
            style={{ backgroundColor: column.color || '#6366f1' }}
          />

          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex-1 mr-2">
              <input
                type="text"
                autoFocus
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                className="w-full text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-indigo-400 outline-none text-slate-900 dark:text-white"
              />
            </form>
          ) : (
            <h3
              onClick={() => setIsEditingTitle(true)}
              className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Haz clic para renombrar"
            >
              {column.name}
            </h3>
          )}

          {/* Card Count */}
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-850 px-2 py-0.5 rounded-full">
            {column.cards.length}
          </span>
        </div>

        {/* Column Actions Menu */}
        <div className="relative flex items-center gap-1">
          <button
            onClick={() => setIsAddingCard(true)}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Añadir tarjeta rápida"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Opciones de columna"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setIsEditingTitle(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Renombrar columna
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDeleteColumn(column.id);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar columna
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards List Container */}
      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[140px] p-0.5 custom-scroll">
        <AnimatePresence mode="popLayout">
          {column.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              column={column}
              allColumns={allColumns}
              onCardClick={() => onCardClick(card)}
              onToggleComplete={() => onToggleComplete(card.id)}
              onMoveToColumn={(targetColId) => onMoveCard(card.id, targetColId)}
              onDelete={() => onDeleteCard(card.id)}
              onDragStart={onCardDragStart}
              onDragEnd={onCardDragEnd}
            />
          ))}
        </AnimatePresence>

        {/* Empty state visual drop hint */}
        {column.cards.length === 0 && (
          <div
            className={`h-24 rounded-xl border-2 border-dashed flex items-center justify-center text-xs transition-colors p-3 text-center ${
              isDragOver
                ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-medium'
                : 'border-slate-300/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
            }`}
          >
            {isDragOver ? '¡Suelta la tarjeta aquí!' : 'Sin tareas aún. Arrastra o pulsa +' }
          </div>
        )}
      </div>

      {/* Quick Add Form or Trigger Button */}
      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
        {isAddingCard ? (
          <form onSubmit={handleQuickAdd} className="space-y-2 animate-in fade-in duration-150">
            <textarea
              autoFocus
              placeholder="¿Qué tarea deseas agregar?"
              value={newCardText}
              onChange={(e) => setNewCardText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleQuickAdd(e);
                }
              }}
              className="w-full text-xs p-2.5 rounded-xl border border-indigo-400/80 dark:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none resize-none shadow-inner"
              rows={2}
            />
            <div className="flex items-center gap-1.5 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardText('');
                }}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Añadir
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-750"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir tarea</span>
          </button>
        )}
      </div>
    </div>
  );
};
