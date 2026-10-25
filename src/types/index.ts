export type ViewMode = 'tablero' | 'calendario' | 'cronograma';
export type BoardLayoutMode = 'horizontal' | 'vertical';
export type ThemeMode = 'auto' | 'light' | 'dark';

export interface LabelItem {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskCard {
  id: string;
  columnId: string;
  text: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  completed: boolean;
  colorTag: string; // 'indigo' | 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose'
  labels: LabelItem[];
  checklist: ChecklistItem[];
  position: number;
  createdAt?: string;
}

export interface BoardColumn {
  id: string;
  boardId: string;
  name: string;
  position: number;
  color?: string;
  cards: TaskCard[];
}

export interface Board {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  accentColor?: string;
  columns: BoardColumn[];
  createdAt?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  advanceDays: number;
  notifiedIds: Record<string, boolean>;
}

export interface UserSession {
  id: string;
  email: string;
}
