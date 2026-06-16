export interface BujoItem {
  id: string;
  type: 'task' | 'event' | 'note';
  status: 'open' | 'completed' | 'migrated' | 'scheduled' | 'cancelled';
  content: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  subtasks?: { id: string; content: string; completed: boolean; icon?: string; executionTime?: number }[];
  priority?: boolean;
  delegatedTo?: string;
  icon?: string;
  energy?: number; // 1-5
  complexity?: number; // 1-5
  executionTime?: number; // in minutes
  category?: string;
  createdAt?: string; // ISO string representing when it was created
}

export interface BujoSettings {
  theme: 'light' | 'dark';
  font: 'sans' | 'dyslexic' | 'mono';
  highlightColor: string;
  accentColor: string;
  firstTime: boolean;
  
  // Custom rhythm schedule settings
  dayStart?: string;
  energyPeakStart?: string;
  energyPeakEnd?: string;
  restStart?: string;
  restEnd?: string;
  secondWindStart?: string;
  secondWindEnd?: string;
  dayEnd?: string;
}

export interface AISubtaskSuggestions {
  high: string[];
  low: string[];
  unlock: string[];
}

export interface CustomIconProps {
  className?: string;
  size?: number | string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: CollectionItem[];
}

export interface CollectionItem {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  notes: string;
  media: MediaItem[];
  subtasks: Subtask[];
  icon?: string;
}

export interface MediaItem {
  id: string;
  type: 'link' | 'image' | 'file';
  name: string;
  url: string;
}

export interface Subtask {
  id: string;
  content: string;
  completed: boolean;
  icon?: string;
  executionTime?: number;
}

export interface DreamItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon?: string;
  conquered: boolean;
  conqueredAt?: string;
}

export interface ConfirmationModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isDanger?: boolean;
}

export interface BragEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'Projeto' | 'Mentoria' | 'Arquitetura' | 'Processo' | 'Aprendizado' | 'Feedback';
  scope: string;
  impact: string;
  okrs?: string;
  subjectId?: string; // Link to StudySubject for XP integration
}

