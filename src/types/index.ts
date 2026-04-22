export type ColumnId = 'todo' | 'doing' | 'review' | 'done' | 'rework';

export type Label = 'Feature' | 'Bug' | 'Issue' | 'Undefined';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'spreadsheet' | 'pdf' | 'other';
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string | null;
  assigneeIds: string[];
  dueDate: string | null;
  label: Label;
  priority: Priority | null;
  subtasks: Subtask[];
  attachments: Attachment[];
  coverImage: string | null;
  commentCount: number;
  columnId: ColumnId;
  createdAt: string;
  order: number;
}

export interface Column {
  id: ColumnId;
  title: string;
  color: string;
  taskIds: string[];
}

export interface BoardState {
  columns: Record<ColumnId, Column>;
  tasks: Record<string, Task>;
  teamMembers: TeamMember[];
}

export const COLUMN_ORDER: ColumnId[] = ['todo', 'doing', 'review', 'done', 'rework'];

export const COLUMN_CONFIG: Record<ColumnId, { title: string; color: string }> = {
  todo: { title: 'To Do', color: '#6366f1' },
  doing: { title: 'Doing', color: '#3b82f6' },
  review: { title: 'Review', color: '#f59e0b' },
  done: { title: 'Done', color: '#10b981' },
  rework: { title: 'Rework', color: '#ef4444' },
};

export const LABELS: Label[] = ['Feature', 'Bug', 'Issue', 'Undefined'];

export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Critical'];

export const LABEL_COLORS: Record<Label, string> = {
  Feature: '#1976D2',
  Bug: '#D32F2F',
  Issue: '#F57C00',
  Undefined: '#546E7A',
};

export const LABEL_BG_COLORS: Record<Label, string> = {
  Feature: '#E3F2FD',
  Bug: '#FFEBEE',
  Issue: '#FFF3E0',
  Undefined: '#ECEFF1',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#f97316',
  Critical: '#ef4444',
};
