export interface BujoItem {
  id: string;
  type: 'task' | 'event' | 'note';
  status: 'open' | 'completed' | 'migrated' | 'scheduled' | 'cancelled';
  content: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  subtasks?: { id: string; content: string; completed: boolean }[];
  priority?: boolean;
  delegatedTo?: string;
  icon?: string;
}

export interface BujoSettings {
  theme: 'light' | 'dark';
  font: 'sans' | 'dyslexic' | 'mono';
  highlightColor: string;
  accentColor: string;
  firstTime: boolean;
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
