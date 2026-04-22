import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonDatetime,
  IonIcon,
} from '@ionic/react';
import {
  closeOutline,
  calendarOutline,
  chevronDownOutline,
  imageOutline,
} from 'ionicons/icons';
import { Task, ColumnId, Label, Priority, LABELS, PRIORITIES, COLUMN_ORDER, COLUMN_CONFIG } from '../../types';
import { useBoardStore, CreateTaskInput } from '../../store/boardStore';
import ChecklistSection from './ChecklistSection';

interface SubtaskItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskFormModalProps {
  isOpen: boolean;
  task: Task | null;
  defaultColumnId?: ColumnId;
  onClose: () => void;
  onSave: (taskData: CreateTaskInput | { taskId: string; updates: Partial<Task> }) => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, task, defaultColumnId, onClose, onSave }) => {
  const teamMembers = useBoardStore((state) => state.teamMembers);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [label, setLabel] = useState<Label>('Undefined');
  const [priority, setPriority] = useState<Priority | null>(null);
  const [columnId, setColumnId] = useState<ColumnId>(defaultColumnId || 'todo');
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
  const [titleError, setTitleError] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const isEditMode = task !== null;

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setAssigneeIds(task.assigneeIds || []);
        setDueDate(task.dueDate);
        setLabel(task.label);
        setPriority(task.priority);
        setColumnId(task.columnId);
        setSubtasks(task.subtasks);
        setCoverImage(task.coverImage || null);
      } else {
        setTitle('');
        setDescription('');
        setAssigneeIds([]);
        setDueDate(null);
        setLabel('Undefined');
        setPriority(null);
        setColumnId(defaultColumnId || 'todo');
        setSubtasks([]);
        setCoverImage(null);
      }
      setTitleError(false);
      setShowAssigneeDropdown(false);
    }
  }, [isOpen, task, defaultColumnId]);

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    const assigneeId = assigneeIds.length > 0 ? assigneeIds[0] : null;

    if (isEditMode) {
      onSave({
        taskId: task.id,
        updates: {
          title,
          description,
          assigneeId,
          assigneeIds,
          dueDate,
          label,
          priority,
          subtasks,
          coverImage,
        },
      });
    } else {
      onSave({
        title,
        description,
        assigneeId,
        assigneeIds,
        dueDate,
        label,
        priority,
        columnId,
        subtasks: subtasks.map(st => ({ text: st.text })),
        coverImage,
      } as CreateTaskInput);
    }

    onClose();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const toggleAssignee = (memberId: string) => {
    setAssigneeIds(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const selectedAssignees = assigneeIds
    .map(id => teamMembers.find(m => m.id === id))
    .filter(Boolean) as Array<{ id: string; name: string; avatar: string }>;

  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={onClose}
        breakpoints={[0.5, 0.95]}
        initialBreakpoint={0.95}
        style={{ '--border-radius': '12px' }}
      >
        <div className="h-full bg-white flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] shrink-0">
            <h2 className="text-lg font-semibold text-[#1F2937]">
              {isEditMode ? 'Edit Task' : 'Create Task'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-[#F3F4F6] rounded-md transition-colors">
              <IonIcon icon={closeOutline} className="text-2xl text-[#9CA3AF]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mb-6">
              {coverImage ? (
                <div className="relative">
                  <img src={coverImage} alt="Cover" className="w-full h-[160px] object-cover rounded-lg" />
                  <button
                    onClick={() => setCoverImage(null)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    <IonIcon icon={closeOutline} className="text-base" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-5 bg-[#F3F4F6] rounded-lg border-2 border-dashed border-[#E5E7EB] hover:border-[#3B82F6] transition-colors cursor-pointer">
                  <IonIcon icon={imageOutline} className="text-4xl text-[#9CA3AF] mb-2" />
                  <span className="text-sm text-[#3B82F6]">Add Cover Image</span>
                </div>
              )}
              <input
                type="text"
                placeholder="Paste image URL..."
                value={coverImage || ''}
                onChange={(e) => setCoverImage(e.target.value || null)}
                className="mt-2 w-full bg-[#F3F4F6] rounded-md px-3 py-2 text-sm text-[#374151] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Title</label>
              <input
                type="text"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setTitleError(false); }}
                className={`w-full bg-[#F3F4F6] rounded-md px-3 py-2.5 text-sm text-[#374151] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#3B82F6] ${titleError ? 'ring-2 ring-red-500' : ''}`}
              />
              {titleError && <p className="text-xs text-red-500 mt-1">Title is required</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Assignees</label>
                <button
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                  className="w-full bg-[#F3F4F6] rounded-md px-3 py-2.5 flex items-center justify-between text-sm text-[#374151] hover:bg-[#E5E7EB] transition-colors"
                >
                  {selectedAssignees.length > 0 ? (
                    <div className="flex items-center">
                      {selectedAssignees.slice(0, 3).map((m, i) => (
                        <img
                          key={m.id}
                          src={m.avatar}
                          alt={m.name}
                          className="w-6 h-6 rounded-full border-2 border-white object-cover"
                          style={{ marginLeft: i > 0 ? '-6px' : '0', position: 'relative', zIndex: 3 - i }}
                        />
                      ))}
                      {selectedAssignees.length > 3 && (
                        <span className="ml-1 text-xs text-[#6B7280]">+{selectedAssignees.length - 3}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#9CA3AF]">Select</span>
                  )}
                  <IonIcon icon={chevronDownOutline} className="text-base text-[#9CA3AF]" />
                </button>
                {showAssigneeDropdown && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-[#E5E7EB] max-h-48 overflow-y-auto">
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => toggleAssignee(member.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#F3F4F6] transition-colors text-left"
                      >
                        <img src={member.avatar} alt={member.name} className="w-7 h-7 rounded-full object-cover" />
                        <span className="text-sm text-[#374151] flex-1">{member.name}</span>
                        {assigneeIds.includes(member.id) && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8l3 3 7-7" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Due Date</label>
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="w-full bg-[#F3F4F6] rounded-md px-3 py-2.5 flex items-center justify-between text-sm hover:bg-[#E5E7EB] transition-colors"
                >
                  <span className={dueDate ? 'text-[#374151]' : 'text-[#9CA3AF]'}>
                    {dueDate ? formatDate(dueDate) : 'Select date'}
                  </span>
                  <IonIcon icon={calendarOutline} className="text-base text-[#9CA3AF]" />
                </button>
                {dueDate && (
                  <button onClick={() => setDueDate(null)} className="text-xs text-red-500 mt-1 hover:underline">
                    Clear date
                  </button>
                )}
              </div>

              {!isEditMode && (
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Column</label>
                  <div className="relative">
                    <select
                      value={columnId}
                      onChange={(e) => setColumnId(e.target.value as ColumnId)}
                      className="w-full bg-[#F3F4F6] rounded-md px-3 py-2.5 text-sm text-[#374151] outline-none appearance-none cursor-pointer hover:bg-[#E5E7EB] transition-colors"
                    >
                      {COLUMN_ORDER.map((colId) => (
                        <option key={colId} value={colId}>{COLUMN_CONFIG[colId].title}</option>
                      ))}
                    </select>
                    <IonIcon icon={chevronDownOutline} className="absolute right-3 top-1/2 -translate-y-1/2 text-base text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Label</label>
                <div className="relative">
                  <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value as Label)}
                    className="w-full bg-[#F3F4F6] rounded-md px-3 py-2.5 text-sm text-[#374151] outline-none appearance-none cursor-pointer hover:bg-[#E5E7EB] transition-colors"
                  >
                    {LABELS.map((lbl) => (
                      <option key={lbl} value={lbl}>{lbl}</option>
                    ))}
                  </select>
                  <IonIcon icon={chevronDownOutline} className="absolute right-3 top-1/2 -translate-y-1/2 text-base text-[#9CA3AF] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Priority</label>
                <div className="relative">
                  <select
                    value={priority || ''}
                    onChange={(e) => setPriority(e.target.value ? e.target.value as Priority : null)}
                    className="w-full bg-[#F3F4F6] rounded-md px-3 py-2.5 text-sm text-[#374151] outline-none appearance-none cursor-pointer hover:bg-[#E5E7EB] transition-colors"
                  >
                    <option value="">None</option>
                    {PRIORITIES.map((pri) => (
                      <option key={pri} value={pri}>{pri}</option>
                    ))}
                  </select>
                  <IonIcon icon={chevronDownOutline} className="absolute right-3 top-1/2 -translate-y-1/2 text-base text-[#9CA3AF] pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Description</label>
              <textarea
                placeholder="Enter task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-[#F3F4F6] rounded-lg px-3 py-2.5 text-sm text-[#374151] placeholder-[#9CA3AF] outline-none resize-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>

            <div className="h-px bg-[#E5E7EB] my-4" />

            <ChecklistSection subtasks={subtasks} onChange={setSubtasks} />
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#F3F4F6] text-[#374151] rounded-md text-sm font-medium hover:bg-[#E5E7EB] transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#3B82F6] text-white rounded-md text-sm font-medium hover:bg-[#2563EB] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </IonModal>

      <IonModal isOpen={showDatePicker} onDidDismiss={() => setShowDatePicker(false)}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
          <h3 className="text-base font-semibold text-[#1F2937]">Select Due Date</h3>
          <button onClick={() => setShowDatePicker(false)} className="px-3 py-1.5 bg-[#3B82F6] text-white rounded-md text-sm font-medium">
            Done
          </button>
        </div>
        <div className="p-4">
          <IonDatetime
            presentation="date"
            value={dueDate || undefined}
            onIonChange={(e) => {
              const val = e.detail.value;
              if (typeof val === 'string') {
                setDueDate(val.split('T')[0]);
              }
              setShowDatePicker(false);
            }}
          />
        </div>
      </IonModal>
    </>
  );
};

export default TaskFormModal;
