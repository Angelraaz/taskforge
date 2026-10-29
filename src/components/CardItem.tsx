import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Calendar,
  Clock,
  ArrowRightLeft,
  Copy,
  MoreVertical,
  CheckSquare,
  Trash2,
  GripVertical,
  User,
} from 'lucide-react';
import { TaskCard, BoardColumn, BoardMember } from '../types';
import confetti from 'canvas-confetti';
import { playSuccessChime } from '../lib/sound';
import { getLocalDateString } from '../lib/dateUtils';

interface CardItemProps {
  card: TaskCard;
  column: BoardColumn;
  allColumns: BoardColumn[];
  members?: BoardMember[];
  onCardClick: () => void;
  onToggleComplete: () => void;
  onMoveToColumn: (targetColumnId: string) => void;
  onCopyToColumn: (targetColumnId: string) => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, card: TaskCard) => void;
  onDragEnd: () => void;
}

const COLOR_CONFIG: Record<
  string,
  { bar: string; border: string; hex: string; lightTint: string; darkTint: string; name: string }
> = {
  indigo: {
    bar: 'bg-indigo-500',
    border: 'border-l-indigo-500',
    hex: '#6366f1',
    lightTint: 'hover:border-indigo-300',
    darkTint: 'dark:hover:border-indigo-500/50',
    name: 'Índigo',
  },
  violet: {
    bar: 'bg-purple-500',
    border: 'border-l-purple-500',
    hex: '#8b5cf6',
    lightTint: 'hover:border-purple-300',
    darkTint: 'dark:hover:border-purple-500/50',
    name: 'Violeta',
  },
  cyan: {
    bar: 'bg-cyan-500',
    border: 'border-l-cyan-500',
    hex: '#06b6d4',
    lightTint: 'hover:border-cyan-300',
    darkTint: 'dark:hover:border-cyan-500/50',
    name: 'Cian',
  },
  emerald: {
    bar: 'bg-emerald-500',
    border: 'border-l-emerald-500',
    hex: '#10b981',
    lightTint: 'hover:border-emerald-300',
    darkTint: 'dark:hover:border-emerald-500/50',
    name: 'Esmeralda',
  },
  amber: {
    bar: 'bg-amber-500',
    border: 'border-l-amber-500',
    hex: '#f59e0b',
    lightTint: 'hover:border-amber-300',
    darkTint: 'dark:hover:border-amber-500/50',
    name: 'Ámbar',
  },
  rose: {
    bar: 'bg-rose-500',
    border: 'border-l-rose-500',
    hex: '#f43f5e',
    lightTint: 'hover:border-rose-300',
    darkTint: 'dark:hover:border-rose-500/50',
    name: 'Rosa',
  },
};

export const CardItem: React.FC<CardItemProps> = ({
  card,
  column,
  allColumns,
  members = [],
  onCardClick,
  onToggleComplete,
  onMoveToColumn,
  onCopyToColumn,
  onDelete,
  onDragStart,
  onDragEnd,
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const moveMenuRef = useRef<HTMLDivElement>(null);
  const copyMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moveMenuRef.current && !moveMenuRef.current.contains(e.target as Node)) {
        setShowMoveMenu(false);
      }
      if (copyMenuRef.current && !copyMenuRef.current.contains(e.target as Node)) {
        setShowCopyMenu(false);
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

  // Resolve color accent
  const colorKey = card.colorTag || 'indigo';
  const colorPreset = COLOR_CONFIG[colorKey] || COLOR_CONFIG.indigo;
  const isHexColor = colorKey.startsWith('#');
  const accentHex = isHexColor ? colorKey : colorPreset.hex;

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!card.completed) {
      playSuccessChime();
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'],
      });
    }
    onToggleComplete();
  };

  const otherColumns = allColumns.filter((c) => c.id !== column.id);
  const assignedMember = members.find((m) => m.id === card.assigneeId);

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
      style={{
        borderLeftColor: accentHex,
      }}
      className={`print-card group relative bg-white dark:bg-slate-800/95 rounded-xl p-3.5 shadow-sm hover:shadow-md border-t border-r border-b border-l-4 border-slate-200/80 dark:border-slate-700/70 transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
        card.completed
          ? 'opacity-60 bg-slate-50/80 dark:bg-slate-800/50'
          : `${colorPreset.lightTint} ${colorPreset.darkTint}`
      }`}
    >
      {/* Top Vibrant Color Strip */}
      <div
        className="absolute top-0 left-3.5 right-3.5 h-1 rounded-b-sm opacity-90 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: accentHex }}
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

          {/* Description Preview */}
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

      {/* Labels / Tags */}
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

      {/* Dates, Checklist & Assigned Member Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Start Date & Due Date badge */}
          {(card.startDate || card.dueDate) && (
            <div
              className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                isOverdue
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                  : isDueToday
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <Calendar className="w-3 h-3 text-indigo-500" />
              {card.startDate && card.dueDate ? (
                <span>
                  {card.startDate.slice(5)} → {card.dueDate.slice(5)}
                </span>
              ) : card.startDate ? (
                <span>Inicio: {card.startDate.slice(5)}</span>
              ) : (
                <span>Fin: {card.dueDate.slice(5)}</span>
              )}
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

          {/* Assigned Member Avatar Pill */}
          {assignedMember && (
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/60 text-[10px] font-semibold text-slate-700 dark:text-slate-200"
              title={`Asignado a: ${assignedMember.name} (${assignedMember.email})`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full text-white text-[8px] flex items-center justify-center font-bold"
                style={{ backgroundColor: assignedMember.avatarColor || '#6366f1' }}
              >
                {assignedMember.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="truncate max-w-[80px]">{assignedMember.name.split(' ')[0]}</span>
            </div>
          )}
        </div>

        {/* ACCESSIBLE MOVER, COPIER & QUICK OPTIONS */}
        <div className="flex items-center gap-1 relative ml-auto no-print" onClick={(e) => e.stopPropagation()}>
          {/* 1. Mover a columna Dropdown */}
          {otherColumns.length > 0 && (
            <div className="relative" ref={moveMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowMoveMenu(!showMoveMenu);
                  setShowCopyMenu(false);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                title="Mover a otra columna"
                aria-haspopup="true"
                aria-expanded={showMoveMenu}
              >
                <ArrowRightLeft className="w-3 h-3 text-indigo-500" />
                <span className="hidden sm:inline">Mover</span>
              </button>

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

          {/* 2. Copiar a columna Dropdown (User requested feature!) */}
          <div className="relative" ref={copyMenuRef}>
            <button
              type="button"
              onClick={() => {
                setShowCopyMenu(!showCopyMenu);
                setShowMoveMenu(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
              title="Copiar / Duplicar tarea en una columna"
              aria-haspopup="true"
              aria-expanded={showCopyMenu}
            >
              <Copy className="w-3 h-3 text-emerald-500" />
              <span className="hidden sm:inline">Copiar</span>
            </button>

            <AnimatePresence>
              {showCopyMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 bottom-full mb-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-30"
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Copiar tarea en:
                  </div>
                  {allColumns.map((targetCol) => (
                    <button
                      key={targetCol.id}
                      type="button"
                      onClick={() => {
                        onCopyToColumn(targetCol.id);
                        setShowCopyMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors text-left"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: targetCol.color || '#6366f1' }}
                        />
                        <span className="truncate">{targetCol.name}</span>
                      </span>
                      {targetCol.id === column.id && (
                        <span className="text-[10px] text-slate-400 ml-1 flex-shrink-0">(esta)</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
