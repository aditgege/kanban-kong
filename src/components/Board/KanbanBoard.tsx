import React, { useState, useCallback, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
  UniqueIdentifier,
  MeasuringStrategy,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardStore } from '../../store/boardStore';
import { Task, ColumnId, COLUMN_ORDER } from '../../types';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';

interface KanbanBoardProps {
  filteredTasksByColumn?: Record<ColumnId, Task[]> | null;
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: ColumnId) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ filteredTasksByColumn, onTaskClick, onAddTask }) => {
  const { columns, tasks, moveTask, reorderTask } = useBoardStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const pointerCollisions = pointerWithin(args);
      if (pointerCollisions.length > 0) {
        return pointerCollisions;
      }

      const rectCollisions = rectIntersection(args);
      if (rectCollisions.length > 0) {
        return rectCollisions;
      }

      return closestCorners(args);
    },
    []
  );

  const findColumnByTaskId = useCallback(
    (taskId: UniqueIdentifier): ColumnId | null => {
      for (const colId of COLUMN_ORDER) {
        if (columns[colId].taskIds.includes(taskId as string)) {
          return colId;
        }
      }
      return null;
    },
    [columns]
  );

  const getTaskIndexInColumn = useCallback(
    (taskId: UniqueIdentifier, columnId: ColumnId): number => {
      return columns[columnId].taskIds.indexOf(taskId as string);
    },
    [columns]
  );

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const task = tasks[active.id as string];
      if (task) {
        setActiveTask(task);
      }
    },
    [tasks]
  );

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id;

      if (activeId === overId) return;

      const activeTaskData = tasks[activeId];
      if (!activeTaskData) return;

      const sourceColumnId = activeTaskData.columnId;
      let targetColumnId: ColumnId | null = null;
      let targetIndex = 0;

      if (COLUMN_ORDER.includes(overId as ColumnId)) {
        targetColumnId = overId as ColumnId;
        targetIndex = columns[targetColumnId].taskIds.length;
      } else {
        targetColumnId = findColumnByTaskId(overId);
        if (targetColumnId) {
          targetIndex = getTaskIndexInColumn(overId, targetColumnId);
        }
      }

      if (!targetColumnId) return;

      if (sourceColumnId !== targetColumnId) {
        if (lastOverId.current !== overId) {
          moveTask(activeId, targetColumnId, targetIndex);
          lastOverId.current = overId;
        }
      }
    },
    [tasks, columns, moveTask, findColumnByTaskId, getTaskIndexInColumn]
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const activeId = active.id as string;
        const overId = over.id;
        const activeTaskData = tasks[activeId];

        if (activeTaskData) {
          const sourceColumnId = activeTaskData.columnId;
          let targetColumnId: ColumnId | null = null;

          if (COLUMN_ORDER.includes(overId as ColumnId)) {
            targetColumnId = overId as ColumnId;
          } else {
            targetColumnId = findColumnByTaskId(overId);
          }

          if (targetColumnId && targetColumnId === sourceColumnId) {
            const fromIndex = getTaskIndexInColumn(activeId, sourceColumnId);
            const toIndex = getTaskIndexInColumn(overId, sourceColumnId);

            if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
              reorderTask(sourceColumnId, fromIndex, toIndex);
            }
          }
        }
      }

      setActiveTask(null);
      lastOverId.current = null;
    },
    [tasks, findColumnByTaskId, getTaskIndexInColumn, reorderTask]
  );

  const getColumnTasks = useCallback(
    (columnId: ColumnId): Task[] => {
      if (filteredTasksByColumn) {
        return filteredTasksByColumn[columnId] || [];
      }
      return columns[columnId].taskIds
        .map(id => tasks[id])
        .filter(Boolean);
    },
    [columns, tasks, filteredTasksByColumn]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      <SortableContext
        items={COLUMN_ORDER}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex overflow-x-auto gap-3 md:gap-4 p-3 md:p-4 min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-56px)] bg-board-bg scroll-smooth snap-x snap-mandatory md:snap-none">
          {COLUMN_ORDER.map((columnId) => {
            const column = columns[columnId];
            const columnTasks = getColumnTasks(columnId);
            
            return (
              <KanbanColumn
                key={columnId}
                column={column}
                tasks={columnTasks}
                onTaskClick={onTaskClick}
                onAddTask={onAddTask}
              />
            );
          })}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;