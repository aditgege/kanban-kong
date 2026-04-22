import React, { useState, useCallback } from 'react';
import {
  IonContent,
  IonPage,
} from '@ionic/react';
import { Task, ColumnId } from '../types';
import { useBoardStore, CreateTaskInput } from '../store/boardStore';
import { FilterState, DEFAULT_FILTER_STATE, useFilteredTasks } from '../hooks/useFilteredTasks';
import FilterBar from '../components/Filter/FilterBar';
import Toolbar from '../components/Toolbar/Toolbar';
import KanbanBoard from '../components/Board/KanbanBoard';
import TaskDetailModal from '../components/Task/TaskDetailModal';
import TaskFormModal from '../components/Task/TaskFormModal';

const BoardPage: React.FC = () => {
  const { addTask, updateTask, deleteTask } = useBoardStore();

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const { filteredTasksByColumn, totalFiltered, isFiltering } = useFilteredTasks(filters);

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<ColumnId>('todo');

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  }, []);

  const handleAddTask = useCallback((columnId: ColumnId) => {
    setEditingTask(null);
    setDefaultColumnId(columnId);
    setIsFormOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setIsDetailOpen(false);
    setEditingTask(task);
    setIsFormOpen(true);
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    deleteTask(taskId);
    setIsDetailOpen(false);
    setSelectedTask(null);
  }, [deleteTask]);

  const handleSaveTask = useCallback((data: CreateTaskInput | { taskId: string; updates: Partial<Task> }) => {
    if ('taskId' in data) {
      updateTask(data.taskId, data.updates);
    } else {
      addTask(data);
    }
    setIsFormOpen(false);
    setEditingTask(null);
  }, [addTask, updateTask]);

  return (
    <IonPage>
      <IonContent scrollY={false}>
        <Toolbar
          filters={filters}
          onFiltersChange={setFilters}
          onFilterToggle={() => setShowFilterPanel((prev) => !prev)}
          showFilterPanel={showFilterPanel}
        />
        {showFilterPanel && (
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            totalFiltered={totalFiltered}
            isFiltering={isFiltering}
          />
        )}
        <KanbanBoard
          filteredTasksByColumn={isFiltering ? filteredTasksByColumn : null}
          onTaskClick={handleTaskClick}
          onAddTask={handleAddTask}
        />
        <TaskDetailModal
          isOpen={isDetailOpen}
          task={selectedTask}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedTask(null);
          }}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />
        <TaskFormModal
          isOpen={isFormOpen}
          task={editingTask}
          defaultColumnId={defaultColumnId}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      </IonContent>
    </IonPage>
  );
};

export default BoardPage;
