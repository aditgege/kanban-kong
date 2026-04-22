import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IonProgressBar } from '@ionic/react';
import { Task, LABEL_COLORS } from '../../types';
import { useBoardStore } from '../../store/boardStore';

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isOverlay, onClick }) => {
  const teamMembers = useBoardStore((state) => state.teamMembers);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignees = task.assigneeIds
    .map((id) => teamMembers.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0;

  const handleClick = () => {
    if (!isDragging && onClick) onClick();
  };

  const visibleAssignees = assignees.slice(0, 3);
  const remainingCount = assignees.length - 3;

  return (
    <div
      ref={setNodeRef}
      className={`bg-card-bg rounded-2xl shadow-card cursor-grab touch-manipulation select-none transition-[box-shadow,transform] ${isDragging ? 'opacity-40' : ''} ${isOverlay ? 'shadow-card-drag rotate-3 cursor-grabbing' : ''} hover:shadow-card-hover hover:-translate-y-px`}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
    >
      <div className="p-4">
        {task.coverImage && (
          <img
            src={task.coverImage}
            alt=""
            className="w-full h-[140px] object-cover rounded-lg mb-3 -mt-1"
          />
        )}

        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium border"
          style={{ borderColor: LABEL_COLORS[task.label], color: LABEL_COLORS[task.label] }}
        >
          {task.label}
        </span>

        {totalSubtasks > 0 && (
          <div className="mt-2">
            <IonProgressBar
              value={subtaskProgress}
              style={{ '--background': '#E0E0E0', '--progress-background': '#1976D2', height: '3px', borderRadius: '2px' }}
            />
          </div>
        )}

        <p className="text-sm text-[#333333] leading-snug mt-3 mb-3 line-clamp-2">
          {task.title}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${isOverdue ? 'border-red-400 text-red-500' : 'border-[#1976D2] text-[#1976D2]'}`}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 1v3M11 1v3M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {formatDate(task.dueDate)}
              </span>
            )}

            {totalSubtasks > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#666666]">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}

            {task.attachments.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#666666]">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M8.5 2.5L3.5 7.5a2.83 2.83 0 004 4l6-6a1.41 1.41 0 00-2-2l-6 6a.71.71 0 001 1l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {task.attachments.length}
              </span>
            )}
          </div>

          {assignees.length > 0 && (
            <div className="flex items-center">
              {visibleAssignees.map((member, index) => (
                <img
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  className="w-7 h-7 rounded-full border-2 border-white object-cover"
                  style={{ marginLeft: index > 0 ? '-8px' : '0', zIndex: 3 - index, position: 'relative' }}
                />
              ))}
              {remainingCount > 0 && (
                <span
                  className="w-7 h-7 rounded-full bg-[#3B82F6] text-white text-[10px] font-semibold flex items-center justify-center border-2 border-white relative"
                  style={{ marginLeft: '-8px' }}
                >
                  +{remainingCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
