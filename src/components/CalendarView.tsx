import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Check } from 'lucide-react';
import { Board, TaskCard } from '../types';

interface CalendarViewProps {
  board: Board;
  onCardClick: (card: TaskCard) => void;
  onAddCardWithDate?: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ board, onCardClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Collect all cards with dates from all columns
  const allCards: { card: TaskCard; columnName: string; columnColor?: string }[] = [];
  board.columns.forEach((col) => {
    col.cards.forEach((card) => {
      allCards.push({ card, columnName: col.name, columnColor: col.color });
    });
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 flex-1 flex flex-col">
      {/* Calendar Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white capitalize">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {allCards.filter((c) => !!c.card.dueDate).length} tareas programadas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            Hoy
          </button>
          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-1.5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 text-center py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Dom</span>
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span>Sáb</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] bg-slate-50/30 dark:bg-slate-900/40 p-1.5" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayFormatted = String(dayNum).padStart(2, '0');
            const monthFormatted = String(month + 1).padStart(2, '0');
            const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;
            const isToday = dateStr === todayStr;

            const dayTasks = allCards.filter((item) => item.card.dueDate === dateStr);

            return (
              <div
                key={dateStr}
                className={`min-h-[95px] p-1.5 flex flex-col transition-colors group ${
                  isToday ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-850/50'
                }`}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {dayTasks.length} {dayTasks.length === 1 ? 'tarea' : 'tareas'}
                    </span>
                  )}
                </div>

                {/* Day Tasks */}
                <div className="space-y-1 overflow-y-auto max-h-[85px] custom-scroll flex-1">
                  {dayTasks.map(({ card, columnColor }) => {
                    const isOverdue = !!card.dueDate && card.dueDate < todayStr && !card.completed;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => onCardClick(card)}
                        className={`w-full text-left p-1.5 rounded-lg text-[11px] font-medium leading-tight truncate flex items-center gap-1.5 transition-all ${
                          card.completed
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 line-through opacity-70'
                            : isOverdue
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-semibold'
                            : 'bg-indigo-50/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: columnColor || '#6366f1' }}
                        />
                        <span className="truncate flex-1">{card.text}</span>
                        {card.dueTime && (
                          <span className="text-[9px] opacity-75">{card.dueTime}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
