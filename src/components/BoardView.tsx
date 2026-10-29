import React, { useState } from 'react';
import { Plus, Printer } from 'lucide-react';
import { Board, BoardLayoutMode, TaskCard } from '../types';
import { ColumnComponent } from './ColumnComponent';
import { getLocalDateString } from '../lib/dateUtils';

interface BoardViewProps {
  board: Board;
  layoutMode: BoardLayoutMode;
  onAddColumn: (name: string) => void;
  onEditColumn: (columnId: string, name: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onMoveColumn?: (columnId: string, direction: 'left' | 'right') => void;
  onUpdateColumnColor?: (columnId: string, color: string) => void;
  onAddCard: (columnId: string, text: string) => void;
  onCardClick: (card: TaskCard) => void;
  onToggleComplete: (cardId: string) => void;
  onMoveCard: (cardId: string, targetColumnId: string) => void;
  onCopyCard: (card: TaskCard, targetColumnId: string) => void;
  onDeleteCard: (cardId: string) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  board,
  layoutMode,
  onAddColumn,
  onEditColumn,
  onDeleteColumn,
  onMoveColumn,
  onUpdateColumnColor,
  onAddCard,
  onCardClick,
  onToggleComplete,
  onMoveCard,
  onCopyCard,
  onDeleteCard,
}) => {
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [draggedCard, setDraggedCard] = useState<TaskCard | null>(null);

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    onAddColumn(newColName.trim());
    setNewColName('');
    setIsAddingCol(false);
  };

  const handleCardDragStart = (e: React.DragEvent, card: TaskCard) => {
    setDraggedCard(card);
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCardDragEnd = () => {
    setDraggedCard(null);
  };

  const handleColumnDrop = (targetColumnId: string) => {
    if (!draggedCard) return;
    if (draggedCard.columnId !== targetColumnId) {
      onMoveCard(draggedCard.id, targetColumnId);
    }
    setDraggedCard(null);
  };

  // Stats for print header
  let totalTasks = 0;
  let completedTasks = 0;
  board.columns.forEach((c) => {
    totalTasks += c.cards.length;
    completedTasks += c.cards.filter((card) => card.completed).length;
  });

  // Background styling: If a board custom background was chosen in settings, apply subtle tint in light/dark
  const bgStyle = board.backgroundColor && board.backgroundColor !== '#0f172a'
    ? {
        backgroundColor: undefined, // Let classes handle base
      }
    : undefined;

  return (
    <div
      style={bgStyle}
      className="board-container w-full flex-1 p-3 sm:p-6 overflow-hidden flex flex-col transition-colors duration-200"
    >
      {/* PRINT-ONLY HEADER: Displays board title, description and print date on paper/PDF */}
      <div className="print-only-header hidden">
        <div className="flex items-center justify-between pb-2 border-b border-slate-300">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{board.name}</h1>
            {board.description && (
              <p className="text-sm text-slate-600 mt-1">{board.description}</p>
            )}
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Fecha de Impresión: {getLocalDateString()}</div>
            <div className="font-semibold text-slate-700 mt-0.5">
              {completedTasks} de {totalTasks} tareas completadas (
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
            </div>
            {board.members && board.members.length > 0 && (
              <div className="text-[11px] text-slate-600 mt-0.5">
                Equipo: {board.members.map((m) => m.name).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Board Layout Container */}
      <div
        className={`board-columns-container w-full flex-1 ${
          layoutMode === 'horizontal'
            ? 'flex gap-4 overflow-x-auto pb-4 items-start custom-scroll scroll-smooth'
            : 'flex flex-col gap-4 overflow-y-auto max-w-xl mx-auto pb-8 items-stretch'
        }`}
      >
        {board.columns.map((column, idx) => (
          <ColumnComponent
            key={column.id}
            column={column}
            allColumns={board.columns}
            columnIndex={idx}
            totalColumns={board.columns.length}
            members={board.members || []}
            onAddCard={onAddCard}
            onEditColumn={onEditColumn}
            onDeleteColumn={onDeleteColumn}
            onMoveColumnLeft={
              onMoveColumn ? () => onMoveColumn(column.id, 'left') : undefined
            }
            onMoveColumnRight={
              onMoveColumn ? () => onMoveColumn(column.id, 'right') : undefined
            }
            onUpdateColumnColor={onUpdateColumnColor}
            onCardClick={onCardClick}
            onToggleComplete={onToggleComplete}
            onMoveCard={onMoveCard}
            onCopyCard={onCopyCard}
            onDeleteCard={onDeleteCard}
            draggedCard={draggedCard}
            onCardDragStart={handleCardDragStart}
            onCardDragEnd={handleCardDragEnd}
            onColumnDrop={handleColumnDrop}
          />
        ))}

        {/* Add Column Button / Form */}
        <div className="flex-shrink-0 w-80 max-w-[85vw] sm:max-w-none no-print">
          {isAddingCol ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-indigo-300 dark:border-indigo-500/60 shadow-md">
              <form onSubmit={handleCreateColumn} className="space-y-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Nombre de la nueva columna"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                  >
                    Crear columna
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCol(false);
                      setNewColName('');
                    }}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingCol(true)}
              className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-300/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 bg-slate-100/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-850 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir columna</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
