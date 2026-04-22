import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  Task,
  Column,
  ColumnId,
  Label,
  Priority,
  Subtask,
  Attachment,
  TeamMember,
  COLUMN_ORDER,
} from '../types';
import {
  TEAM_MEMBERS,
  buildInitialColumns,
  buildInitialTasks,
} from '../data/initialData';

export interface CreateTaskInput {
  title: string;
  description: string;
  assigneeId: string | null;
  assigneeIds?: string[];
  dueDate: string | null;
  label: Label;
  priority: Priority | null;
  columnId: ColumnId;
  subtasks?: { text: string }[];
  attachments?: Omit<Attachment, 'id'>[];
  coverImage?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assigneeId?: string | null;
  assigneeIds?: string[];
  dueDate?: string | null;
  label?: Label;
  priority?: Priority | null;
  subtasks?: Subtask[];
  attachments?: Attachment[];
  coverImage?: string | null;
  commentCount?: number;
}

interface BoardStore {
  columns: Record<ColumnId, Column>;
  tasks: Record<string, Task>;
  teamMembers: TeamMember[];

  // Task CRUD
  addTask: (input: CreateTaskInput) => string;
  updateTask: (taskId: string, input: UpdateTaskInput) => void;
  deleteTask: (taskId: string) => void;

  // Drag & Drop
  moveTask: (taskId: string, toColumnId: ColumnId, toIndex: number) => void;
  reorderTask: (columnId: ColumnId, fromIndex: number, toIndex: number) => void;

  // Subtasks
  addSubtask: (taskId: string, text: string) => void;
  removeSubtask: (taskId: string, subtaskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  updateSubtaskText: (taskId: string, subtaskId: string, text: string) => void;

  // Attachments
  addAttachment: (taskId: string, attachment: Omit<Attachment, 'id'>) => void;
  removeAttachment: (taskId: string, attachmentId: string) => void;

  // Helpers
  getTasksByColumn: (columnId: ColumnId) => Task[];
  getColumnOrder: () => ColumnId[];
}

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      columns: buildInitialColumns(),
      tasks: buildInitialTasks(),
      teamMembers: TEAM_MEMBERS,

      addTask: (input: CreateTaskInput) => {
        const taskId = uuidv4();
        const column = get().columns[input.columnId];
        const newTask: Task = {
          id: taskId,
          title: input.title,
          description: input.description,
          assigneeId: input.assigneeId,
          assigneeIds: input.assigneeIds || (input.assigneeId ? [input.assigneeId] : []),
          dueDate: input.dueDate,
          label: input.label,
          priority: input.priority,
          subtasks: (input.subtasks || []).map((s) => ({
            id: uuidv4(),
            text: s.text,
            completed: false,
          })),
          attachments: (input.attachments || []).map((a) => ({
            id: uuidv4(),
            ...a,
          })),
          coverImage: input.coverImage || null,
          commentCount: 0,
          columnId: input.columnId,
          createdAt: new Date().toISOString(),
          order: column.taskIds.length,
        };

        set((state) => ({
          tasks: { ...state.tasks, [taskId]: newTask },
          columns: {
            ...state.columns,
            [input.columnId]: {
              ...state.columns[input.columnId],
              taskIds: [...state.columns[input.columnId].taskIds, taskId],
            },
          },
        }));

        return taskId;
      },

      updateTask: (taskId: string, input: UpdateTaskInput) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;

          return {
            tasks: {
              ...state.tasks,
              [taskId]: { ...task, ...input },
            },
          };
        });
      },

      deleteTask: (taskId: string) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;

          const column = state.columns[task.columnId];
          const newTasks = { ...state.tasks };
          delete newTasks[taskId];

          return {
            tasks: newTasks,
            columns: {
              ...state.columns,
              [task.columnId]: {
                ...column,
                taskIds: column.taskIds.filter((id) => id !== taskId),
              },
            },
          };
        });
      },

      moveTask: (taskId: string, toColumnId: ColumnId, toIndex: number) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;

          const fromColumnId = task.columnId;
          const fromColumn = state.columns[fromColumnId];
          const toColumn = state.columns[toColumnId];

          if (!fromColumn || !toColumn) return state;

          const newFromTaskIds = fromColumn.taskIds.filter((id) => id !== taskId);

          let newToTaskIds: string[];
          if (fromColumnId === toColumnId) {
            newToTaskIds = [...newFromTaskIds];
            const clampedIndex = Math.min(toIndex, newToTaskIds.length);
            newToTaskIds.splice(clampedIndex, 0, taskId);
          } else {
            newToTaskIds = [...toColumn.taskIds];
            const clampedIndex = Math.min(toIndex, newToTaskIds.length);
            newToTaskIds.splice(clampedIndex, 0, taskId);
          }

          return {
            tasks: {
              ...state.tasks,
              [taskId]: { ...task, columnId: toColumnId },
            },
            columns: {
              ...state.columns,
              [fromColumnId]: {
                ...fromColumn,
                taskIds: fromColumnId === toColumnId ? newToTaskIds : newFromTaskIds,
              },
              ...(fromColumnId !== toColumnId
                ? {
                    [toColumnId]: {
                      ...toColumn,
                      taskIds: newToTaskIds,
                    },
                  }
                : {}),
            },
          };
        });
      },

      reorderTask: (columnId: ColumnId, fromIndex: number, toIndex: number) => {
        set((state) => {
          const column = state.columns[columnId];
          if (!column) return state;

          const newTaskIds = [...column.taskIds];
          const [removed] = newTaskIds.splice(fromIndex, 1);
          newTaskIds.splice(toIndex, 0, removed);

          return {
            columns: {
              ...state.columns,
              [columnId]: { ...column, taskIds: newTaskIds },
            },
          };
        });
      },

      addSubtask: (taskId: string, text: string) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;

          return {
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...task,
                subtasks: [
                  ...task.subtasks,
                  { id: uuidv4(), text, completed: false },
                ],
              },
            },
          };
        });
      },

      removeSubtask: (taskId: string, subtaskId: string) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;

          return {
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...task,
                subtasks: task.subtasks.filter((s) => s.id !== subtaskId),
              },
            },
          };
        });
      },

      toggleSubtask: (taskId: string, subtaskId: string) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;

          return {
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...task,
                subtasks: task.subtasks.map((s) =>
                  s.id === subtaskId ? { ...s, completed: !s.completed } : s
                ),
              },
            },
          };
        });
      },

      updateSubtaskText: (taskId: string, subtaskId: string, text: string) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;

          return {
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...task,
                subtasks: task.subtasks.map((s) =>
                  s.id === subtaskId ? { ...s, text } : s
                ),
              },
            },
          };
        });
      },

      addAttachment: (taskId: string, attachment: Omit<Attachment, 'id'>) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;

          return {
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...task,
                attachments: [
                  ...task.attachments,
                  { id: uuidv4(), ...attachment },
                ],
              },
            },
          };
        });
      },

      removeAttachment: (taskId: string, attachmentId: string) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;

          return {
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...task,
                attachments: task.attachments.filter((a) => a.id !== attachmentId),
              },
            },
          };
        });
      },

      getTasksByColumn: (columnId: ColumnId) => {
        const state = get();
        const column = state.columns[columnId];
        if (!column) return [];
        return column.taskIds
          .map((id) => state.tasks[id])
          .filter(Boolean);
      },

      getColumnOrder: () => COLUMN_ORDER,
    }),
    {
      name: 'kanban-board-storage',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        columns: state.columns,
        tasks: state.tasks,
      }),
      migrate: (persistedState, version) => {
        if (version < 2) {
          return {
            columns: buildInitialColumns(),
            tasks: buildInitialTasks(),
          };
        }
        return persistedState as { columns: Record<ColumnId, Column>; tasks: Record<string, Task> };
      },
    }
  )
);
