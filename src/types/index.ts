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

export interface BoardMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  avatarColor: string;
  joinedAt: string;
}

export interface TaskCard {
  id: string;
  columnId: string;
  text: string;
  description: string;
  startDate?: string; // YYYY-MM-DD (Fecha de inicio)
  startTime?: string; // HH:mm (Hora de inicio)
  dueDate: string; // YYYY-MM-DD (Fecha de finalización / límite)
  dueTime: string; // HH:mm (Hora final)
  completed: boolean;
  colorTag: string; // 'indigo' | 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose'
  labels: LabelItem[];
  checklist: ChecklistItem[];
  position: number;
  assigneeId?: string; // ID of assigned team member
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
  members?: BoardMember[]; // Grupo de trabajo / Colaboradores del tablero
  inviteCode?: string; // Código de invitación para compartir
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
