import React, { useState } from 'react';
import { Plus, FolderPlus } from 'lucide-react';
import { Board, BoardLayoutMode, TaskCard } from '../types';
import { ColumnComponent } from './ColumnComponent';

interface BoardViewProps {
  board: Board;
  layoutMode: BoardLayoutMode;
  onAddColumn: (name: string) => void;
  onEditColumn: (columnId: string, name: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddCard: (columnId: string, text: string) => void;
  onCardClick: (card: TaskCard) => void;
  onToggleComplete: (cardId: string) => void;
  onMoveCard: (cardId: string, targetColumnId: string) => void;
  onDeleteCard: (cardId: string) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  board,
  layoutMode,
  onAddColumn,
  onEditColumn,
  onDeleteColumn,
  onAddCard,
  onCardClick,
  onToggleComplete,
  onMoveCard,
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

  return (
    <div className="w-full flex-1 p-3 sm:p-6 overflow-hidden flex flex-col">
      {/* Board Layout Container */}
      <div
        className={`w-full flex-1 ${
          layoutMode === 'horizontal'
            ? 'flex gap-4 overflow-x-auto pb-4 items-start custom-scroll scroll-smooth'
            : 'flex flex-col gap-4 overflow-y-auto max-w-xl mx-auto pb-8 items-stretch'
        }`}
      >
        {board.columns.map((column) => (
          <ColumnComponent
            key={column.id}
            column={column}
            allColumns={board.columns}
            onAddCard={onAddCard}
            onEditColumn={onEditColumn}
            onDeleteColumn={onDeleteColumn}
            onCardClick={onCardClick}
            onToggleComplete={onToggleComplete}
            onMoveCard={onMoveCard}
            onDeleteCard={onDeleteCard}
            draggedCard={draggedCard}
            onCardDragStart={handleCardDragStart}
            onCardDragEnd={handleCardDragEnd}
            onColumnDrop={handleColumnDrop}
          />
        ))}

        {/* Add Column Button / Form */}
        <div className="flex-shrink-0 w-80 max-w-[85vw] sm:max-w-none">
          {isAddingCol ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-indigo-300 dark:border-indigo-500/60 shadow-md">
              <form onSubmit={handleCreateColumn} className="space-y-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Nombre de la nueva columna"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCol(false);
                      setNewColName('');
                    }}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingCol(true)}
              className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-300/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-xs flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir otra columna</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
