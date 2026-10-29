import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Palette,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';
import { BoardColumn, TaskCard, BoardMember } from '../types';
import { CardItem } from './CardItem';

interface ColumnComponentProps {
  column: BoardColumn;
  allColumns: BoardColumn[];
  columnIndex: number;
  totalColumns: number;
  members?: BoardMember[];
  onAddCard: (columnId: string, text: string) => void;
  onEditColumn: (columnId: string, name: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onCardClick: (card: TaskCard) => void;
  onToggleComplete: (cardId: string) => void;
  onMoveCard: (cardId: string, targetColumnId: string) => void;
  onCopyCard: (card: TaskCard, targetColumnId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onMoveColumnLeft?: () => void;
  onMoveColumnRight?: () => void;
  onUpdateColumnColor?: (columnId: string, color: string) => void;
  draggedCard: TaskCard | null;
  onCardDragStart: (e: React.DragEvent, card: TaskCard) => void;
  onCardDragEnd: () => void;
  onColumnDrop: (columnId: string) => void;
}

const COLUMN_PALETTES = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#8b5cf6', // Purple
  '#64748b', // Slate
];

export const ColumnComponent: React.FC<ColumnComponentProps> = ({
  column,
  allColumns,
  columnIndex,
  totalColumns,
  members = [],
  onAddCard,
  onEditColumn,
  onDeleteColumn,
  onCardClick,
  onToggleComplete,
  onMoveCard,
  onCopyCard,
  onDeleteCard,
  onMoveColumnLeft,
  onMoveColumnRight,
  onUpdateColumnColor,
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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const columnColor = column.color || '#6366f1';

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
      className={`print-column flex flex-col flex-shrink-0 w-80 max-w-[85vw] sm:max-w-none bg-slate-100/75 dark:bg-slate-900/85 rounded-2xl p-3 border transition-all duration-200 relative ${
        isDragOver
          ? 'border-indigo-500/80 dark:border-indigo-400/80 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-lg'
          : 'border-slate-200/80 dark:border-slate-800 shadow-sm'
      }`}
    >
      {/* Top Column Color Bar */}
      <div
        className="h-1 -mx-3 -mt-3 mb-2 rounded-t-2xl opacity-90 transition-colors"
        style={{ backgroundColor: columnColor }}
      />

      {/* Column Header */}
      <div className="flex items-center justify-between px-1 py-1 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Vibrant Column Accent Dot */}
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
            style={{ backgroundColor: columnColor }}
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
              title="Haz clic para renombrar columna"
            >
              {column.name}
            </h3>
          )}

          {/* Card Count */}
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-850 px-2 py-0.5 rounded-full">
            {column.cards.length}
          </span>
        </div>

        {/* Column Reordering & Actions Menu */}
        <div className="relative flex items-center gap-0.5 no-print">
          {/* Move Column Left Button (User requested!) */}
          {columnIndex > 0 && onMoveColumnLeft && (
            <button
              onClick={onMoveColumnLeft}
              className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Mover columna a la izquierda"
              aria-label="Mover a la izquierda"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Move Column Right Button (User requested!) */}
          {columnIndex < totalColumns - 1 && onMoveColumnRight && (
            <button
              onClick={onMoveColumnRight}
              className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Mover columna a la derecha"
              aria-label="Mover a la derecha"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsAddingCard(true)}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Añadir tarea rápida"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setShowMenu(!showMenu);
              setShowColorPicker(false);
            }}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Opciones de columna"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
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

              {/* Move column options */}
              {columnIndex > 0 && onMoveColumnLeft && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onMoveColumnLeft();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Mover a la izquierda
                </button>
              )}

              {columnIndex < totalColumns - 1 && onMoveColumnRight && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onMoveColumnRight();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Mover a la derecha
                </button>
              )}

              {/* Column color picker toggle */}
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-indigo-500" />
                  Color de columna
                </span>
                <span
                  className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600"
                  style={{ backgroundColor: columnColor }}
                />
              </button>

              {showColorPicker && onUpdateColumnColor && (
                <div className="p-2 border-t border-slate-100 dark:border-slate-700 mt-1 flex items-center gap-1.5 flex-wrap">
                  {COLUMN_PALETTES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        onUpdateColumnColor(column.id, c);
                        setShowColorPicker(false);
                        setShowMenu(false);
                      }}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        columnColor === c ? 'scale-125 ring-2 ring-indigo-500' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setShowMenu(false);
                  onDeleteColumn(column.id);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border-t border-slate-100 dark:border-slate-700 mt-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar columna
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards List Container */}
      <div className="print-card-list flex-1 overflow-y-auto space-y-2.5 min-h-[140px] p-0.5 custom-scroll">
        <AnimatePresence mode="popLayout">
          {column.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              column={column}
              allColumns={allColumns}
              members={members}
              onCardClick={() => onCardClick(card)}
              onToggleComplete={() => onToggleComplete(card.id)}
              onMoveToColumn={(targetColId) => onMoveCard(card.id, targetColId)}
              onCopyToColumn={(targetColId) => onCopyCard(card, targetColId)}
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
                : 'border-slate-300/80 dark:border-slate-700/60 text-slate-500 dark:text-slate-400'
            }`}
          >
            {isDragOver ? '¡Suelta la tarjeta aquí!' : 'Sin tareas aún. Arrastra o pulsa +' }
          </div>
        )}
      </div>

      {/* Quick Add Inline Card Form */}
      {isAddingCard ? (
        <form onSubmit={handleQuickAdd} className="mt-2.5 space-y-2 no-print">
          <textarea
            autoFocus
            rows={2}
            placeholder="¿Qué tarea deseas agregar?..."
            value={newCardText}
            onChange={(e) => setNewCardText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleQuickAdd(e);
              }
            }}
            className="w-full text-xs p-2.5 rounded-xl border border-indigo-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm resize-none"
          />
          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              Añadir tarjeta
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingCard(false);
                setNewCardText('');
              }}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          className="no-print mt-2 w-full py-2 px-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Añadir tarjeta
        </button>
      )}
    </div>
  );
};
