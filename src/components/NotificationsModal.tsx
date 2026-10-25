import React, { useState } from 'react';
import { Bell, BellRing, Volume2, Calendar, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { NotificationSettings, Board, TaskCard } from '../types';
import { playAlertChime } from '../lib/sound';
import { getLocalDateString } from '../lib/dateUtils';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSaveSettings: (settings: NotificationSettings) => void;
  boards: Board[];
  onCardClick: (boardId: string, card: TaskCard) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  boards,
  onCardClick,
}) => {
  if (!isOpen) return null;

  const [enabled, setEnabled] = useState(settings.enabled);
  const [sound, setSound] = useState(settings.sound);
  const [advanceDays, setAdvanceDays] = useState(settings.advanceDays);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default';
  });

  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no admite notificaciones del sistema.');
      return;
    }

    if (!enabled) {
      const perm = await Notification.requestPermission();
      setPermissionState(perm);
      if (perm === 'granted') {
        setEnabled(true);
        onSaveSettings({ ...settings, enabled: true, sound, advanceDays });
      } else {
        setEnabled(false);
      }
    } else {
      setEnabled(false);
      onSaveSettings({ ...settings, enabled: false, sound, advanceDays });
    }
  };

  const handleTestAlert = () => {
    if (sound) playAlertChime();
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('🔔 Prueba de Alarma Gtajrc', {
          body: 'El sistema de notificaciones sonoras y alertas está configurado correctamente.',
          icon: '/icon.svg',
        });
      } catch {
        // ignore
      }
    }
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      enabled,
      sound,
      advanceDays: Math.max(0, Math.min(30, advanceDays)),
    });
    onClose();
  };

  // Find all tasks with deadlines
  const todayStr = getLocalDateString();
  const tasksWithDates: { boardId: string; boardName: string; card: TaskCard }[] = [];

  boards.forEach((b) => {
    b.columns.forEach((col) => {
      col.cards.forEach((card) => {
        if (card.dueDate && !card.completed) {
          tasksWithDates.push({ boardId: b.id, boardName: b.name, card });
        }
      });
    });
  });

  tasksWithDates.sort((a, b) => (a.card.dueDate + (a.card.dueTime || '')).localeCompare(b.card.dueDate + (b.card.dueTime || '')));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Alertas y Notificaciones</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Planificación de alarmas y vencimientos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scroll flex-1">
          {/* Settings Section */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ajustes del Sistema
            </h4>

            {/* Notification toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Notificaciones del Navegador
                </p>
                <p className="text-[11px] text-slate-500">
                  {permissionState === 'granted'
                    ? 'Permiso activado'
                    : permissionState === 'denied'
                    ? 'Bloqueadas en el navegador'
                    : 'Requiere autorización'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={enabled}
                onChange={handleToggleNotifications}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Sound toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Alarma Sonora (Web Audio)
                  </p>
                  <p className="text-[11px] text-slate-500">Tono sintetizado sin conexión</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={sound}
                onChange={(e) => setSound(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Days in advance */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Días de anticipación
                </p>
                <p className="text-[11px] text-slate-500">0 = avisar el mismo día de entrega</p>
              </div>
              <input
                type="number"
                min="0"
                max="30"
                value={advanceDays}
                onChange={(e) => setAdvanceDays(parseInt(e.target.value) || 0)}
                className="w-16 text-center text-xs font-semibold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            {/* Test button */}
            <button
              type="button"
              onClick={handleTestAlert}
              className="w-full mt-2 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center justify-center gap-2"
            >
              <Bell className="w-3.5 h-3.5" />
              Probar Alarma Sonora y Notificación
            </button>
          </div>

          {/* Pending Deadlines List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Tareas Pendientes con Fecha ({tasksWithDates.length})</span>
            </h4>

            {tasksWithDates.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                No hay tareas pendientes con fecha asignada.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scroll">
                {tasksWithDates.map(({ boardId, boardName, card }) => {
                  const isOverdue = card.dueDate < todayStr;
                  const isToday = card.dueDate === todayStr;

                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        onCardClick(boardId, card);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer flex items-center justify-between gap-2 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {card.text}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          📁 {boardName}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-right flex-shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isOverdue
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                              : isToday
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-indigo-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {isOverdue ? 'VENCIDA' : isToday ? 'HOY' : card.dueDate}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900"
          >
            Cerrar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm"
          >
            Guardar Ajustes
          </button>
        </div>
      </div>
    </div>
  );
};
