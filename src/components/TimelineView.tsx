import React from 'react';
import { Clock, Calendar, Check, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { Board, TaskCard, BoardColumn } from '../types';
import { getLocalDateString } from '../lib/dateUtils';

interface TimelineViewProps {
  board: Board;
  onCardClick: (card: TaskCard) => void;
  onToggleComplete: (cardId: string) => void;
  onMoveCard: (cardId: string, targetColId: string) => void;
}

const COLOR_MAP: Record<string, string> = {
  indigo: '#6366f1',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
};

export const TimelineView: React.FC<TimelineViewProps> = ({
  board,
  onCardClick,
  onToggleComplete,
  onMoveCard,
}) => {
  const todayStr = getLocalDateString();

  // Calculate 7 days ahead
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekStr = getLocalDateString(nextWeekDate);

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
    const effectiveDate = card.dueDate || card.startDate;

    if (!effectiveDate) {
      noDate.push(item);
    } else if (effectiveDate < todayStr && !card.completed) {
      overdue.push(item);
    } else if (effectiveDate === todayStr) {
      dueToday.push(item);
    } else if (effectiveDate > todayStr && effectiveDate <= nextWeekStr) {
      upcomingWeek.push(item);
    } else {
      future.push(item);
    }
  });

  // Sorters
  const sortByDate = (a: typeof allItems[0], b: typeof allItems[0]) => {
    const dateA = a.card.dueDate || a.card.startDate || '';
    const dateB = b.card.dueDate || b.card.startDate || '';
    return (dateA + (a.card.dueTime || '')).localeCompare(dateB + (b.card.dueTime || ''));
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
    { title: 'Sin fecha programada', items: noDate, color: 'text-slate-400', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-500' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6 flex-1 flex flex-col space-y-6">
      {/* Header Overview */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Cronograma de Tareas</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vista cronológica según fechas de inicio, entrega y prioridad
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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sec.badge}`}>
                  {sec.items.length}
                </span>
              </div>

              <div className="space-y-2">
                {sec.items.map(({ card, column }) => {
                  const cardAccent =
                    card.colorTag && card.colorTag.startsWith('#')
                      ? card.colorTag
                      : COLOR_MAP[card.colorTag || 'indigo'] || column.color || '#6366f1';

                  return (
                    <div
                      key={card.id}
                      onClick={() => onCardClick(card)}
                      style={{ borderLeftColor: cardAccent }}
                      className="group p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 shadow-sm transition-all flex items-center justify-between gap-3 cursor-pointer border-l-4"
                    >
                      {/* Left: Checkbox & Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(card.id);
                          }}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
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
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: column.color || '#6366f1' }}
                              />
                              {column.name}
                            </span>
                            {card.labels?.length > 0 && (
                              <>
                                <span>·</span>
                                <span className="truncate">{card.labels.map((l) => l.name).join(', ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Date & Column Mover */}
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {card.startDate || card.dueDate ? (
                          <div className="text-right text-xs">
                            {card.startDate && card.dueDate ? (
                              <div className="font-semibold text-slate-700 dark:text-slate-200">
                                {card.startDate} → {card.dueDate}
                              </div>
                            ) : card.startDate ? (
                              <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                                Inicia: {card.startDate}
                              </div>
                            ) : (
                              <div className="font-semibold text-slate-700 dark:text-slate-200">
                                Fin: {card.dueDate}
                              </div>
                            )}
                            {card.dueTime && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                {card.dueTime}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sin fecha</span>
                        )}

                        {/* Move column quick button */}
                        <div className="relative group/mover no-print">
                          <select
                            value={card.columnId}
                            onChange={(e) => onMoveCard(card.id, e.target.value)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer outline-none"
                            title="Mover tarea a otra columna"
                          >
                            {board.columns.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
