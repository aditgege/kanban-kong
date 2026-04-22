import { useMemo } from 'react';
import { Task, ColumnId, Label, COLUMN_ORDER } from '../types';
import { useBoardStore } from '../store/boardStore';

export interface FilterState {
  searchQuery: string;
  assigneeIds: string[];
  labels: Label[];
  dueDateFrom: string | null;
  dueDateTo: string | null;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  searchQuery: '',
  assigneeIds: [],
  labels: [],
  dueDateFrom: null,
  dueDateTo: null,
};

export function useFilteredTasks(filters: FilterState): {
  filteredTasksByColumn: Record<ColumnId, Task[]>;
  totalFiltered: number;
  isFiltering: boolean;
} {
  const { columns, tasks } = useBoardStore();

  const isFiltering = 
    filters.searchQuery.trim() !== '' ||
    filters.assigneeIds.length > 0 ||
    filters.labels.length > 0 ||
    filters.dueDateFrom !== null ||
    filters.dueDateTo !== null;

  const result = useMemo(() => {
    const filteredTasksByColumn: Record<ColumnId, Task[]> = {} as Record<ColumnId, Task[]>;
    let totalFiltered = 0;

    COLUMN_ORDER.forEach((columnId) => {
      const column = columns[columnId];
      if (!column) {
        filteredTasksByColumn[columnId] = [];
        return;
      }

      const columnTasks = column.taskIds
        .map((taskId) => tasks[taskId])
        .filter((task): task is Task => task !== undefined);

      const filtered = columnTasks.filter((task) => {
        if (filters.searchQuery.trim() !== '') {
          const query = filters.searchQuery.toLowerCase();
          const titleMatch = task.title.toLowerCase().includes(query);
          const descMatch = task.description?.toLowerCase().includes(query);
          if (!titleMatch && !descMatch) return false;
        }

        if (filters.assigneeIds.length > 0) {
          if (!task.assigneeId || !filters.assigneeIds.includes(task.assigneeId)) {
            return false;
          }
        }

        if (filters.labels.length > 0) {
          if (!filters.labels.includes(task.label)) {
            return false;
          }
        }

        if (filters.dueDateFrom !== null) {
          if (!task.dueDate || task.dueDate < filters.dueDateFrom) {
            return false;
          }
        }

        if (filters.dueDateTo !== null) {
          if (!task.dueDate || task.dueDate > filters.dueDateTo) {
            return false;
          }
        }

        return true;
      });

      filteredTasksByColumn[columnId] = filtered;
      totalFiltered += filtered.length;
    });

    return { filteredTasksByColumn, totalFiltered };
  }, [columns, tasks, filters]);

  return {
    ...result,
    isFiltering,
  };
}
