import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, ColumnId, Column } from '../../types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: ColumnId) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks, onTaskClick, onAddTask }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[85vw] max-w-[85vw] sm:min-w-[320px] sm:max-w-[320px] shrink-0 bg-column-bg rounded-xl flex flex-col transition-shadow snap-center${isOver ? ' ring-2 ring-primary-blue' : ''}`}
    >
      <div className="flex items-center justify-between px-3 py-3.5">
        <div className='flex items-center gap-2'>
         <span className="font-semibold text-[15px] text-[#1A1A1A]">{column.title}</span>
          <button className="w-[30px] h-[30px] border-none bg-[#E3F2FD] rounded-lg cursor-pointer flex items-center justify-center transition-colors hover:bg-[#BBDEFB]" onClick={() => onAddTask(column.id)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="#1976D2" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button className="w-7 h-7 border-none bg-transparent rounded-md cursor-pointer flex items-center justify-center transition-colors hover:bg-[#E8EAED]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="3" r="1.2" fill="#5F6368" />
              <circle cx="8" cy="8" r="1.2" fill="#5F6368" />
              <circle cx="8" cy="13" r="1.2" fill="#5F6368" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="w-7 h-7 border-none bg-transparent rounded-md cursor-pointer flex items-center justify-center transition-colors hover:bg-[#E8EAED]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 2L14 2L14 6" stroke="#5F6368" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 14L2 14L2 10" stroke="#5F6368" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 min-h-[100px]">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-text-muted text-sm">No tasks</div>
        ) : (
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
