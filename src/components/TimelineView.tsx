import React from 'react';
import { Clock, Calendar, Check, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { Board, TaskCard, BoardColumn } from '../types';

interface TimelineViewProps {
  board: Board;
  onCardClick: (card: TaskCard) => void;
  onToggleComplete: (cardId: string) => void;
  onMoveCard: (cardId: string, targetColId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  board,
  onCardClick,
  onToggleComplete,
  onMoveCard,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate 7 days ahead
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekStr = nextWeekDate.toISOString().split('T')[0];

  // Flatten all cards with column data
  const allItems: { card: TaskCard; column: BoardColumn }[] = [];
  board.columns.forEach((col) => {
    col.cards.forEach((card) => {
      allItems.push({ card, column: col });
    });
  });

  // Group items
  const overdue: typeof allItems = [];
  const dueToday: typeof allItems = [];
  const upcomingWeek: typeof allItems = [];
  const future: typeof allItems = [];
  const noDate: typeof allItems = [];

  allItems.forEach((item) => {
    const { card } = item;
    if (!card.dueDate) {
      noDate.push(item);
    } else if (card.dueDate < todayStr && !card.completed) {
      overdue.push(item);
    } else if (card.dueDate === todayStr) {
      dueToday.push(item);
    } else if (card.dueDate > todayStr && card.dueDate <= nextWeekStr) {
      upcomingWeek.push(item);
    } else {
      future.push(item);
    }
  });

  // Sorters
  const sortByDate = (a: typeof allItems[0], b: typeof allItems[0]) => {
    return (a.card.dueDate + (a.card.dueTime || '')).localeCompare(
      b.card.dueDate + (b.card.dueTime || '')
    );
  };

  overdue.sort(sortByDate);
  dueToday.sort(sortByDate);
  upcomingWeek.sort(sortByDate);
  future.sort(sortByDate);

  const sections = [
    { title: 'Vencidas', items: overdue, color: 'text-rose-500', badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
    { title: 'Hoy', items: dueToday, color: 'text-amber-500', badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
    { title: 'Próximos 7 días', items: upcomingWeek, color: 'text-indigo-500', badge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
    { title: 'Próximamente', items: future, color: 'text-cyan-500', badge: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400' },
    { title: 'Sin fecha límite', items: noDate, color: 'text-slate-400', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-500' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6 flex-1 flex flex-col space-y-6">
      {/* Header Overview */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Cronograma de Tareas</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vista cronológica según fecha de entrega y prioridad
            </p>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Total: {allItems.length} tareas
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {sections.map((sec) => {
          if (sec.items.length === 0) return null;
          return (
            <div key={sec.title} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${sec.color}`}>
                  {sec.title}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${sec.badge}`}>
                  {sec.items.length}
                </span>
              </div>

              <div className="space-y-2">
                {sec.items.map(({ card, column }) => {
                  const otherCols = board.columns.filter((c) => c.id !== column.id);
                  return (
                    <div
                      key={card.id}
                      onClick={() => onCardClick(card)}
                      className={`group flex items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer ${
                        card.completed ? 'opacity-60 bg-slate-50 dark:bg-slate-850' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(card.id);
                          }}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${
                            card.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                          }`}
                        >
                          {card.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <h4
                            className={`text-xs sm:text-sm font-semibold truncate text-slate-800 dark:text-slate-100 ${
                              card.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                            }`}
                          >
                            {card.text}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: column.color || '#6366f1' }}
                              />
                              {column.name}
                            </span>
                            {card.labels?.length > 0 && (
                              <>
                                <span>·</span>
                                <span>{card.labels.map((l) => l.name).join(', ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Date & Column Mover */}
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {card.dueDate ? (
                          <div className="text-right text-xs">
                            <div className="font-semibold text-slate-700 dark:text-slate-200">
                              {card.dueDate}
                            </div>
                            {card.dueTime && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                {card.dueTime}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sin fecha</span>
                        )}

                        {/* Accessible Move Select */}
                        {otherCols.length > 0 && (
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                onMoveCard(card.id, e.target.value);
                              }
                            }}
                            className="text-[11px] font-semibold py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 outline-none hover:border-indigo-400 cursor-pointer"
                          >
                            <option value="" disabled>
                              Mover a...
                            </option>
                            {otherCols.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {allItems.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            No hay tareas registradas en este tablero.
          </div>
        )}
      </div>
    </div>
  );
};
