import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonContent,
  IonFooter,
  IonIcon,
  IonCheckbox,
  IonProgressBar,
  IonAlert,
} from '@ionic/react';
import {
  closeOutline,
  pencilOutline,
  calendarOutline,
  trashOutline,
  chevronDownOutline,
  addOutline,
  imageOutline,
  documentOutline,
  attachOutline,
  cloudUploadOutline,
} from 'ionicons/icons';
import { Task, LABEL_COLORS, LABEL_BG_COLORS, PRIORITY_COLORS, COLUMN_CONFIG } from '../../types';
import { useBoardStore } from '../../store/boardStore';

interface TaskDetailModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, task, onClose, onEdit, onDelete }) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const teamMembers = useBoardStore((state) => state.teamMembers);

  if (!task) return null;

  const taskAssignees = task.assigneeIds
    .map((id) => teamMembers.find((m) => m.id === id))
    .filter(Boolean) as Array<{ id: string; name: string; avatar: string }>;

  const columnConfig = COLUMN_CONFIG[task.columnId];
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progressValue = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return imageOutline;
      case 'pdf':
      case 'document':
      case 'spreadsheet':
        return documentOutline;
      default:
        return attachOutline;
    }
  };

  const handleDelete = () => {
    setShowDeleteAlert(false);
    onDelete(task.id);
    onClose();
  };

  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={onClose}
        style={{ '--border-radius': '12px' }}
      >
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ '--background': 'white' }}>
            <div className="flex items-center justify-between px-6 py-2">
              <button
                onClick={() => setIsComplete(!isComplete)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] rounded-md text-sm text-[#374151] hover:bg-[#E5E7EB] transition-colors"
              >
                <IonCheckbox
                  checked={isComplete}
                  onIonChange={(e) => setIsComplete(e.detail.checked)}
                  className="pointer-events-none"
                />
                <span>Mark Complete</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#F3F4F6] rounded-md transition-colors"
              >
                <IonIcon icon={closeOutline} className="text-2xl text-[#9CA3AF]" />
              </button>
            </div>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding" style={{ '--background': 'white' }}>
          <div className="px-2 py-2">
            {task.coverImage ? (
              <img
                src={task.coverImage}
                alt="Cover"
                className="w-full h-[200px] object-cover rounded-lg mb-6"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-5 bg-[#F3F4F6] rounded-lg border-2 border-dashed border-[#E5E7EB] hover:border-[#3B82F6] transition-colors cursor-pointer mb-6">
                <IonIcon icon={imageOutline} className="text-5xl text-[#9CA3AF] mb-3" />
                <span className="text-sm text-[#3B82F6]">Add Cover Image</span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-semibold text-[#1F2937] flex-1">{task.title}</h2>
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 hover:bg-[#F3F4F6] rounded-md transition-colors"
              >
                <IonIcon icon={pencilOutline} className="text-base text-[#9CA3AF]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Assignee</label>
                <div className="bg-[#F3F4F6] rounded-md px-3 py-2.5 flex items-center justify-between">
                  <div className="flex items-center">
                    {taskAssignees.length > 0 ? (
                      <div className="flex items-center">
                        {taskAssignees.slice(0, 3).map((member, index) => (
                          <div
                            key={member.id}
                            className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm"
                            style={{ marginLeft: index > 0 ? '-8px' : '0', zIndex: 3 - index, position: 'relative' }}
                            title={member.name}
                          >
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {taskAssignees.length > 3 && (
                          <span
                            className="w-8 h-8 rounded-full bg-[#3B82F6] text-white text-xs font-semibold flex items-center justify-center relative"
                            style={{ marginLeft: '-8px' }}
                          >
                            +{taskAssignees.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-[#6B7280]">Not assigned</span>
                    )}
                  </div>
                  <button className="w-6 h-6 rounded-full bg-[#E5E7EB] flex items-center justify-center hover:bg-[#D1D5DB] transition-colors">
                    <IonIcon icon={addOutline} className="text-sm text-[#6B7280]" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Due Date</label>
                <div className={`bg-[#F3F4F6] rounded-md px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#E5E7EB] transition-colors ${isOverdue(task.dueDate) ? 'bg-red-50' : ''}`}>
                  <span className={`text-sm ${isOverdue(task.dueDate) ? 'text-red-500' : 'text-[#374151]'}`}>
                    {formatDate(task.dueDate) || 'Not set'}
                  </span>
                  <IonIcon icon={calendarOutline} className="text-base text-[#9CA3AF]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Board</label>
                <div className="bg-[#F3F4F6] rounded-md px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#E5E7EB] transition-colors">
                  <span className="text-sm text-[#374151]">Adhivasindo</span>
                  <IonIcon icon={chevronDownOutline} className="text-base text-[#9CA3AF]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Column</label>
                <div className="bg-[#F3F4F6] rounded-md px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#E5E7EB] transition-colors">
                  <span className="text-sm text-[#374151]">{columnConfig.title}</span>
                  <IonIcon icon={chevronDownOutline} className="text-base text-[#9CA3AF]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Label</label>
                <div className="bg-[#F3F4F6] rounded-md px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#E5E7EB] transition-colors">
                  {task.label !== 'Undefined' ? (
                    <span
                      className="px-2.5 py-1 text-xs font-medium rounded"
                      style={{ backgroundColor: LABEL_BG_COLORS[task.label], color: LABEL_COLORS[task.label] }}
                    >
                      {task.label}
                    </span>
                  ) : (
                    <span className="text-sm text-[#6B7280]">None</span>
                  )}
                  <IonIcon icon={chevronDownOutline} className="text-base text-[#9CA3AF]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Priority</label>
                <div className="bg-[#F3F4F6] rounded-md px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#E5E7EB] transition-colors">
                  {task.priority ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[task.priority] }} />
                      <span className="text-sm text-[#374151]">{task.priority}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-[#6B7280]">Not set</span>
                  )}
                  <IonIcon icon={chevronDownOutline} className="text-base text-[#9CA3AF]" />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-[#1F2937]">Description</h3>
                <button onClick={() => onEdit(task)} className="p-1.5 hover:bg-[#F3F4F6] rounded-md transition-colors">
                  <IonIcon icon={pencilOutline} className="text-sm text-[#9CA3AF]" />
                </button>
              </div>
              <div className="bg-[#F3F4F6] rounded-lg p-3 min-h-20">
                {task.description ? (
                  <p className="text-sm text-[#374151] whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-sm text-[#9CA3AF] italic">No description</p>
                )}
              </div>
            </div>

            <div className="h-px bg-[#E5E7EB] my-4" />

            <div className="mb-6">
              <h3 className="text-base font-semibold text-[#1F2937] mb-3">Attachments</h3>
              <div className="bg-[#F3F4F6] rounded-lg p-5 text-center border-2 border-dashed border-[#E5E7EB] hover:border-[#3B82F6] transition-colors cursor-pointer">
                <IonIcon icon={cloudUploadOutline} className="text-4xl text-[#9CA3AF] mb-3" />
                <p className="text-sm text-[#374151]">Drag & Drop files here</p>
                <p className="text-sm text-[#374151]">
                  or <span className="text-[#3B82F6] cursor-pointer hover:underline">browse from device</span>
                </p>
              </div>
              {task.attachments.length > 0 && (
                <div className="mt-3">
                  {task.attachments.map((attachment) => (
                    <div key={attachment.id} className="bg-[#F3F4F6] rounded-md mb-2 py-2.5 px-3 flex items-center gap-3">
                      <IonIcon icon={getAttachmentIcon(attachment.type)} className="text-xl text-[#9CA3AF]" />
                      <span className="text-sm text-[#374151]">{attachment.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-[#E5E7EB] my-4" />

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-[#1F2937]">Check List</h3>
                <span className="text-sm text-[#9CA3AF]">{completedSubtasks}/{totalSubtasks}</span>
              </div>
              <IonProgressBar
                value={progressValue}
                style={{ '--background': '#E5E7EB', '--progress-background': '#3B82F6' }}
                className="rounded mb-3 h-1"
              />
              <div className="mb-3">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-start gap-3 py-1.5">
                    <IonCheckbox checked={subtask.completed} disabled className="mt-0.5" />
                    <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-[#9CA3AF]' : 'text-[#374151]'}`}>
                      {subtask.text}
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full py-2.5 px-4 bg-[#F3F4F6] rounded-md text-sm text-[#6B7280] hover:bg-[#E5E7EB] transition-colors text-left">
                + Add subtask
              </button>
            </div>

            <div className="h-px bg-[#E5E7EB] my-4" />

            <div className="mb-6">
              <h3 className="text-base font-semibold text-[#1F2937] mb-3">Activity</h3>
              <div className="py-8 text-center text-[#9CA3AF]">
                <p className="text-sm">No activity yet</p>
              </div>
            </div>
          </div>
        </IonContent>

        <IonFooter className="ion-no-border" style={{ background: 'white' }}>
          <IonToolbar style={{ '--background': 'white' }}>
            <div className="flex items-center justify-between px-6 py-2">
              <button
                onClick={() => setShowDeleteAlert(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <IonIcon icon={trashOutline} className="text-base" />
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#F3F4F6] text-[#374151] rounded-md text-sm font-medium hover:bg-[#E5E7EB] transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={() => onEdit(task)}
                  className="px-4 py-2 bg-[#3B82F6] text-white rounded-md text-sm font-medium hover:bg-[#2563EB] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </IonToolbar>
        </IonFooter>
      </IonModal>

      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Delete', role: 'destructive', handler: handleDelete },
        ]}
      />
    </>
  );
};

export default TaskDetailModal;
