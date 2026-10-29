import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Calendar,
  Clock,
  CheckSquare,
  Trash2,
  Tag,
  Palette,
  ArrowRightLeft,
  Copy,
  Users,
} from 'lucide-react';
import { TaskCard, BoardColumn, LabelItem, ChecklistItem, BoardMember } from '../types';
import confetti from 'canvas-confetti';
import { playSuccessChime } from '../lib/sound';

interface CardDetailModalProps {
  card: TaskCard | null;
  columns: BoardColumn[];
  members?: BoardMember[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: TaskCard) => void;
  onDelete: (cardId: string) => void;
  onCopy?: (card: TaskCard, targetColumnId: string) => void;
}

const AVAILABLE_PALETTES = [
  { id: 'indigo', name: 'Índigo', hex: '#6366f1' },
  { id: 'violet', name: 'Violeta', hex: '#8b5cf6' },
  { id: 'cyan', name: 'Cian Eléctrico', hex: '#06b6d4' },
  { id: 'emerald', name: 'Esmeralda', hex: '#10b981' },
  { id: 'amber', name: 'Ámbar Cálido', hex: '#f59e0b' },
  { id: 'rose', name: 'Rosa Coral', hex: '#f43f5e' },
];

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  columns,
  members = [],
  isOpen,
  onClose,
  onSave,
  onDelete,
  onCopy,
}) => {
  if (!isOpen || !card) return null;

  const [text, setText] = useState(card.text);
  const [description, setDescription] = useState(card.description || '');
  const [completed, setCompleted] = useState(card.completed);
  const [startDate, setStartDate] = useState(card.startDate || '');
  const [startTime, setStartTime] = useState(card.startTime || '');
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  const [dueTime, setDueTime] = useState(card.dueTime || '');
  const [columnId, setColumnId] = useState(card.columnId);
  const [colorTag, setColorTag] = useState(card.colorTag || 'indigo');
  const [assigneeId, setAssigneeId] = useState(card.assigneeId || '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(card.checklist || []);
  const [labels, setLabels] = useState<LabelItem[]>(card.labels || []);

  const [newCheckText, setNewCheckText] = useState('');
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedLabelColor, setSelectedLabelColor] = useState('#6366f1');

  useEffect(() => {
    setText(card.text);
    setDescription(card.description || '');
    setCompleted(card.completed);
    setStartDate(card.startDate || '');
    setStartTime(card.startTime || '');
    setDueDate(card.dueDate || '');
    setDueTime(card.dueTime || '');
    setColumnId(card.columnId);
    setColorTag(card.colorTag || 'indigo');
    setAssigneeId(card.assigneeId || '');
    setChecklist(card.checklist || []);
    setLabels(card.labels || []);
  }, [card]);

  const activePalette =
    AVAILABLE_PALETTES.find((p) => p.id === colorTag) ||
    AVAILABLE_PALETTES[0];

  const handleToggleComplete = () => {
    const nextVal = !completed;
    setCompleted(nextVal);
    if (nextVal) {
      playSuccessChime();
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckText.trim()) return;
    const newItem: ChecklistItem = {
      id: 'chk-' + Date.now(),
      text: newCheckText.trim(),
      completed: false,
    };
    setChecklist([...checklist, newItem]);
    setNewCheckText('');
  };

  const handleToggleCheckItem = (id: string) => {
    const updated = checklist.map((item) => {
      if (item.id === id) {
        const next = !item.completed;
        if (next) playSuccessChime();
        return { ...item, completed: next };
      }
      return item;
    });
    setChecklist(updated);
  };

  const handleDeleteCheckItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    const newLbl: LabelItem = {
      id: 'lbl-' + Date.now(),
      name: newLabelName.trim(),
      color: selectedLabelColor,
    };
    setLabels([...labels, newLbl]);
    setNewLabelName('');
  };

  const handleDeleteLabel = (id: string) => {
    setLabels(labels.filter((lbl) => lbl.id !== id));
  };

  const handleSaveAndClose = () => {
    onSave({
      ...card,
      text: text.trim() || card.text,
      description: description.trim(),
      completed,
      startDate,
      startTime,
      dueDate,
      dueTime,
      columnId,
      colorTag,
      assigneeId: assigneeId || undefined,
      checklist,
      labels,
    });
    onClose();
  };

  const handleQuickCopy = (targetColId: string) => {
    if (onCopy) {
      const currentCardSnapshot: TaskCard = {
        ...card,
        text: text.trim() || card.text,
        description: description.trim(),
        completed,
        startDate,
        startTime,
        dueDate,
        dueTime,
        columnId,
        colorTag,
        assigneeId: assigneeId || undefined,
        checklist,
        labels,
      };
      onCopy(currentCardSnapshot, targetColId);
      onClose();
    }
  };

  // Checklist calculations
  const totalCheck = checklist.length;
  const completedCheck = checklist.filter((i) => i.completed).length;
  const progressPercent = totalCheck > 0 ? Math.round((completedCheck / totalCheck) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Top Accent Strip with selected color */}
        <div
          className="h-1.5 w-full transition-colors duration-200"
          style={{ backgroundColor: activePalette.hex }}
        />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleComplete}
              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                completed
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                  : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent'
              }`}
              title={completed ? 'Marcar como pendiente' : 'Marcar como completada'}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Detalles de Tarea
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: activePalette.hex }}
                />
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Color {activePalette.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onDelete(card.id)}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              title="Eliminar tarea"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 custom-scroll flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Título
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full text-base font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
              placeholder="Escribe el nombre de la tarea..."
            />
          </div>

          {/* Column Switcher + Color Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                  Columna Actual
                </span>
              </label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vibrant Card Accent Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-500" />
                  Color de Acento
                </span>
              </label>
              <div className="flex items-center gap-2 pt-1">
                {AVAILABLE_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => setColorTag(pal.id)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      colorTag === pal.id
                        ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900'
                        : 'hover:scale-110 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: pal.hex }}
                    title={pal.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Grupo de Trabajo / Asignar Responsable */}
          {members.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  Responsable / Asignado
                </span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                <option value="">(Sin asignar)</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — ({m.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade detalles, notas o instrucciones sobre esta tarea..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-y"
            />
          </div>

          {/* DATES: Fecha de Inicio y Fecha Final/Límite */}
          <div className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Fechas y Plazos del Proyecto
            </span>

            {/* Start Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-emerald-500" />
                    Fecha de Inicio
                  </span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-emerald-500" />
                    Hora de Inicio
                  </span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Due Date & Time (Fin / Límite) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-rose-500" />
                    Fecha Final / Límite
                  </span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-rose-500" />
                    Hora de Alarma / Límite
                  </span>
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Copy to Another Column */}
          {onCopy && (
            <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 text-emerald-500" />
                  Copiar esta tarea
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Duplica la tarea y sus subtareas a otra columna
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  id="copy-col-select"
                  defaultValue={columnId}
                  className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white"
                >
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const sel = document.getElementById('copy-col-select') as HTMLSelectElement;
                    if (sel) handleQuickCopy(sel.value);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Copy className="w-3 h-3" />
                  Copiar
                </button>
              </div>
            </div>
          )}

          {/* Checklist */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                Checklist ({completedCheck}/{totalCheck})
              </label>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {progressPercent}%
              </span>
            </div>

            {/* Progress bar */}
            {totalCheck > 0 && (
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* Checklist items list */}
            <div className="space-y-1.5">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 group"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleCheckItem(item.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      item.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span
                    className={`flex-1 text-xs text-slate-800 dark:text-slate-200 ${
                      item.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCheckItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add checklist input */}
            <form onSubmit={handleAddChecklist} className="flex gap-2">
              <input
                type="text"
                placeholder="Añadir subtarea..."
                value={newCheckText}
                onChange={(e) => setNewCheckText(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 text-xs font-semibold rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
              >
                + Añadir
              </button>
            </form>
          </div>

          {/* Labels & Tags */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              Etiquetas
            </label>

            {/* Existing labels */}
            <div className="flex flex-wrap items-center gap-2">
              {labels.map((lbl) => (
                <span
                  key={lbl.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: lbl.color || '#6366f1' }}
                  />
                  <span>{lbl.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteLabel(lbl.id)}
                    className="ml-1 text-slate-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add label form */}
            <form onSubmit={handleAddLabel} className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
              <input
                type="text"
                placeholder="Nueva etiqueta..."
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
              <div className="flex items-center gap-1.5">
                {['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedLabelColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      selectedLabelColor === c ? 'scale-125 ring-2 ring-indigo-500' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 text-xs font-semibold rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
              >
                + Etiqueta
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
