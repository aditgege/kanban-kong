import React, { useState } from 'react';
import {
  IonItem,
  IonCheckbox,
  IonInput,
  IonButton,
  IonIcon,
  IonProgressBar,
  IonLabel,
  IonList,
  IonItemGroup,
} from '@ionic/react';
import { addOutline, trashOutline } from 'ionicons/icons';
import { v4 as uuidv4 } from 'uuid';

interface SubtaskItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistSectionProps {
  subtasks: SubtaskItem[];
  onChange: (subtasks: SubtaskItem[]) => void;
  readOnly?: boolean;
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ subtasks, onChange, readOnly }) => {
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const completedCount = subtasks.filter(st => st.completed).length;
  const totalCount = subtasks.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const handleToggle = (id: string) => {
    const updated = subtasks.map(st =>
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    onChange(updated);
  };

  const handleTextChange = (id: string, text: string) => {
    const updated = subtasks.map(st =>
      st.id === id ? { ...st, text } : st
    );
    onChange(updated);
  };

  const handleDelete = (id: string) => {
    const updated = subtasks.filter(st => st.id !== id);
    onChange(updated);
  };

  const handleAdd = () => {
    if (!newSubtaskText.trim()) return;
    const newSubtask: SubtaskItem = {
      id: uuidv4(),
      text: newSubtaskText.trim(),
      completed: false,
    };
    onChange([...subtasks, newSubtask]);
    setNewSubtaskText('');
  };

  return (
    <div className="checklist-section mt-4">
      <IonItem lines="none">
        <IonLabel className="font-bold">Checklist</IonLabel>
        <IonLabel slot="end" className="text-sm text-[var(--ion-color-medium)]">
          {completedCount} of {totalCount}
        </IonLabel>
      </IonItem>
      <IonProgressBar value={progress} className="rounded mb-3" />

      <IonList>
        {subtasks.map(subtask => (
          <IonItem lines="none" key={subtask.id}>
            <IonCheckbox
              slot="start"
              checked={subtask.completed}
              onIonChange={() => handleToggle(subtask.id)}
              disabled={readOnly}
            />
            <IonInput
              value={subtask.text}
              onIonInput={(e) => handleTextChange(subtask.id, e.detail.value || '')}
              readonly={readOnly}
              className="flex-1"
            />
            {!readOnly && (
              <IonButton
                slot="end"
                fill="clear"
                color="danger"
                onClick={() => handleDelete(subtask.id)}
              >
                <IonIcon icon={trashOutline} />
              </IonButton>
            )}
          </IonItem>
        ))}

        {!readOnly && (
          <IonItem lines="none">
            <IonInput
              value={newSubtaskText}
              onIonInput={(e) => setNewSubtaskText(e.detail.value || '')}
              placeholder="Add new subtask"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              className="flex-1"
            />
            <IonButton
              slot="end"
              fill="clear"
              onClick={handleAdd}
              disabled={!newSubtaskText.trim()}
            >
              <IonIcon icon={addOutline} />
            </IonButton>
          </IonItem>
        )}
      </IonList>
    </div>
  );
};

export default ChecklistSection;
