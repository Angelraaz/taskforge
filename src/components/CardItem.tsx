import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Calendar,
  Clock,
  ArrowRightLeft,
  MoreVertical,
  CheckSquare,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { TaskCard, BoardColumn } from '../types';
import confetti from 'canvas-confetti';
import { playSuccessChime } from '../lib/sound';
import { getLocalDateString } from '../lib/dateUtils';

interface CardItemProps {
  card: TaskCard;
  column: BoardColumn;
  allColumns: BoardColumn[];
  onCardClick: () => void;
  onToggleComplete: () => void;
  onMoveToColumn: (targetColumnId: string) => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, card: TaskCard) => void;
  onDragEnd: () => void;
}

const COLOR_ACCENTS: Record<string, { bar: string; badge: string; border: string }> = {
  indigo: {
    bar: 'bg-indigo-500',
    badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
    border: 'border-l-indigo-500',
  },
  violet: {
    bar: 'bg-purple-500',
    badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300',
    border: 'border-l-purple-500',
  },
  cyan: {
    bar: 'bg-cyan-500',
    badge: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300',
    border: 'border-l-cyan-500',
  },
  emerald: {
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
    border: 'border-l-emerald-500',
  },
  amber: {
    bar: 'bg-amber-500',
    badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
    border: 'border-l-amber-500',
  },
  rose: {
    bar: 'bg-rose-500',
    badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
    border: 'border-l-rose-500',
  },
};

export const CardItem: React.FC<CardItemProps> = ({
  card,
  column,
  allColumns,
  onCardClick,
  onToggleComplete,
  onMoveToColumn,
  onDelete,
  onDragStart,
  onDragEnd,
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const moveMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moveMenuRef.current && !moveMenuRef.current.contains(e.target as Node)) {
        setShowMoveMenu(false);
      }
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target as Node)) {
        setShowOptionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalChecklist = card.checklist?.length || 0;
  const completedChecklist = card.checklist?.filter((c) => c.completed).length || 0;

  // Deadline calculation (using local date)
  const todayStr = getLocalDateString();
  const isOverdue = !!card.dueDate && card.dueDate < todayStr && !card.completed;
  const isDueToday = !!card.dueDate && card.dueDate === todayStr && !card.completed;

  const colorTag = COLOR_ACCENTS[card.colorTag || 'indigo'] || COLOR_ACCENTS.indigo;

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!card.completed) {
      playSuccessChime();
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
      });
    }
    onToggleComplete();
  };

  const otherColumns = allColumns.filter((c) => c.id !== column.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, card)}
      onDragEnd={onDragEnd}
      onClick={onCardClick}
      className={`group relative bg-white dark:bg-slate-800/95 rounded-xl p-3.5 shadow-sm hover:shadow-md border border-slate-200/80 dark:border-slate-700/70 transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
        card.completed
          ? 'opacity-60 bg-slate-50/80 dark:bg-slate-800/50'
          : 'hover:border-indigo-300 dark:hover:border-indigo-500/50'
      }`}
    >
      {/* Top Vibrant Color Strip */}
      <div
        className={`absolute top-0 left-3.5 right-3.5 h-1 rounded-b-sm ${colorTag.bar} opacity-80 group-hover:opacity-100 transition-opacity`}
      />

      {/* Card Content Header: Checkbox + Title + Accessible Column Move */}
      <div className="flex items-start gap-2.5 pt-1">
        {/* Completion Checkmark Button */}
        <button
          type="button"
          onClick={handleCompleteClick}
          aria-label={card.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
            card.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-transparent'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Task Title */}
        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-semibold leading-snug tracking-tight text-slate-800 dark:text-slate-100 line-clamp-2 ${
              card.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }`}
          >
            {card.text}
          </h4>

          {/* Description Preview (Clean typography, no pills) */}
          {card.description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {card.description}
            </p>
          )}
        </div>

        {/* Drag Grip Indicator & Options */}
        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="p-1 text-slate-400 dark:text-slate-500 hidden sm:block">
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Labels / Tags (Clean inline tags with vibrant colored dots, avoiding clunky pills) */}
      {card.labels && card.labels.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
          {card.labels.map((lbl) => (
            <span
              key={lbl.id}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: lbl.color || '#6366f1' }}
              />
              {lbl.name}
            </span>
          ))}
        </div>
      )}

      {/* Due Date & Checklist Indicators */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Due date badge */}
          {card.dueDate && (
            <div
              className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                isOverdue
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                  : isDueToday
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{card.dueDate.slice(5)}</span>
              {card.dueTime && (
                <>
                  <Clock className="w-2.5 h-2.5 ml-0.5" />
                  <span>{card.dueTime}</span>
                </>
              )}
            </div>
          )}

          {/* Checklist progress */}
          {totalChecklist > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <CheckSquare className="w-3 h-3" />
              <span>
                {completedChecklist}/{totalChecklist}
              </span>
            </div>
          )}
        </div>

        {/* ACCESSIBLE COLUMN MOVER & QUICK ACTIONS */}
        <div className="flex items-center gap-1 relative ml-auto" onClick={(e) => e.stopPropagation()}>
          {/* Mover Dropdown Button (Crucial user request for accessibility without dragging) */}
          {otherColumns.length > 0 && (
            <div className="relative" ref={moveMenuRef}>
              <button
                type="button"
                onClick={() => setShowMoveMenu(!showMoveMenu)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                title="Mover a otra columna"
                aria-haspopup="true"
                aria-expanded={showMoveMenu}
              >
                <ArrowRightLeft className="w-3 h-3 text-indigo-500" />
                <span className="hidden sm:inline">Mover</span>
              </button>

              {/* Accessible Dropdown Popover */}
              <AnimatePresence>
                {showMoveMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 bottom-full mb-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-30"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Mover a columna:
                    </div>
                    {otherColumns.map((targetCol) => (
                      <button
                        key={targetCol.id}
                        type="button"
                        onClick={() => {
                          onMoveToColumn(targetCol.id);
                          setShowMoveMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors text-left"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: targetCol.color || '#6366f1' }}
                        />
                        <span className="truncate">{targetCol.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Quick Options Menu */}
          <div className="relative" ref={optionsMenuRef}>
            <button
              type="button"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
              title="Más opciones"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            <AnimatePresence>
              {showOptionsMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 bottom-full mb-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-30"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      onCardClick();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    Editar detalles
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      onDelete();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
