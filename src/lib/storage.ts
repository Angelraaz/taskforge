import { Board, NotificationSettings, TaskCard, BoardColumn } from '../types';

const STORAGE_KEY = 'taskforge_app_state_v2';
const NOTIF_STORAGE_KEY = 'taskforge_notifications_config';

export const VIBRANT_COLORS = {
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-400' },
  violet: { bg: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-400' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-400' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-400' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-400' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-400' },
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  sound: true,
  advanceDays: 1,
  notifiedIds: {},
};

export function getInitialBoards(): Board[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // fallback to defaults
    }
  }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const defaultBoard: Board = {
    id: 'board-default-1',
    name: '🚀 Proyecto Principal',
    description: 'Gestor de sprint, entregables y objetivos clave.',
    backgroundColor: '#0f172a',
    accentColor: '#6366f1',
    columns: [
      {
        id: 'col-1',
        boardId: 'board-default-1',
        name: 'Por Hacer',
        position: 0,
        color: '#6366f1',
        cards: [
          {
            id: 'card-1',
            columnId: 'col-1',
            text: 'Diseñar interfaz minimalista con paleta vibrante',
            description: 'Aplicar micro-animaciones fluidas, paleta con colores enérgicos y excelente legibilidad.',
            dueDate: todayStr,
            dueTime: '18:00',
            completed: false,
            colorTag: 'indigo',
            labels: [
              { id: 'lbl-1', name: 'UI / UX', color: '#6366f1' },
              { id: 'lbl-2', name: 'Prioridad Alta', color: '#f43f5e' },
            ],
            checklist: [
              { id: 'chk-1', text: 'Selector de vistas fluido con motion', completed: true },
              { id: 'chk-2', text: 'Botón de mover columna accesible', completed: false },
              { id: 'chk-3', text: 'Soporte PWA Android e iOS', completed: false },
            ],
            position: 0,
          },
          {
            id: 'card-2',
            columnId: 'col-1',
            text: 'Configurar Service Worker para funcionamiento sin conexión',
            description: 'Garantizar que la aplicación cargue de inmediato incluso sin internet.',
            dueDate: tomorrowStr,
            dueTime: '12:00',
            completed: false,
            colorTag: 'cyan',
            labels: [
              { id: 'lbl-3', name: 'PWA', color: '#06b6d4' },
              { id: 'lbl-4', name: 'Performance', color: '#10b981' },
            ],
            checklist: [
              { id: 'chk-4', text: 'Manifest.json con iconos optimizados', completed: true },
              { id: 'chk-5', text: 'Caché estático de assets', completed: true },
            ],
            position: 1,
          },
        ],
      },
      {
        id: 'col-2',
        boardId: 'board-default-1',
        name: 'En Curso',
        position: 1,
        color: '#f59e0b',
        cards: [
          {
            id: 'card-3',
            columnId: 'col-2',
            text: 'Mover tarjetas con selector accesible y Drag & Drop',
            description: 'Permitir arrastrar intuitivamente o elegir la columna destino con un menú desplegable de un solo toque.',
            dueDate: todayStr,
            dueTime: '20:30',
            completed: false,
            colorTag: 'amber',
            labels: [
              { id: 'lbl-5', name: 'Accesibilidad', color: '#f59e0b' },
              { id: 'lbl-6', name: 'Interactividad', color: '#8b5cf6' },
            ],
            checklist: [
              { id: 'chk-6', text: 'Soporte táctil móvil', completed: true },
              { id: 'chk-7', text: 'Animación de transición entre columnas', completed: true },
            ],
            position: 0,
          },
        ],
      },
      {
        id: 'col-3',
        boardId: 'board-default-1',
        name: 'Revisión & Alertas',
        position: 2,
        color: '#8b5cf6',
        cards: [
          {
            id: 'card-4',
            columnId: 'col-3',
            text: 'Probar alarmas sonoras y notificaciones programadas',
            description: 'Verificar la alarma con Web Audio API y el detector de fechas límite.',
            dueDate: tomorrowStr,
            dueTime: '16:00',
            completed: false,
            colorTag: 'violet',
            labels: [{ id: 'lbl-7', name: 'Notificaciones', color: '#8b5cf6' }],
            checklist: [
              { id: 'chk-8', text: 'Comprobar audio sintetizado', completed: true },
              { id: 'chk-9', text: 'Badge de pendientes en el header', completed: true },
            ],
            position: 0,
          },
        ],
      },
      {
        id: 'col-4',
        boardId: 'board-default-1',
        name: 'Completado',
        position: 3,
        color: '#10b981',
        cards: [
          {
            id: 'card-5',
            columnId: 'col-4',
            text: 'Soporte para modo oscuro automático',
            description: 'Detección inteligente de preferencia de sistema operativo con switch manual.',
            dueDate: todayStr,
            dueTime: '10:00',
            completed: true,
            colorTag: 'emerald',
            labels: [{ id: 'lbl-8', name: 'Dark Mode', color: '#10b981' }],
            checklist: [
              { id: 'chk-10', text: 'Sincronizar prefers-color-scheme', completed: true },
            ],
            position: 0,
          },
        ],
      },
    ],
  };

  return [defaultBoard];
}

export function saveBoards(boards: Board[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch (e) {
    console.error('Error saving boards:', e);
  }
}

export function getNotificationSettings(): NotificationSettings {
  try {
    const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (saved) return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) };
  } catch {
    // fallback
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving notifications:', e);
  }
}
