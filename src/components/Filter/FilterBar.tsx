import React, { useState } from 'react';
import {
  IonDatetime,
  IonModal,
} from '@ionic/react';
import { FilterState, DEFAULT_FILTER_STATE } from '../../hooks/useFilteredTasks';
import { useBoardStore } from '../../store/boardStore';
import { LABELS, Label, LABEL_COLORS } from '../../types';

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalFiltered: number;
  isFiltering: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFiltersChange, totalFiltered, isFiltering }) => {
  const { teamMembers } = useBoardStore();
  const [showFromDateModal, setShowFromDateModal] = useState(false);
  const [showToDateModal, setShowToDateModal] = useState(false);

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    onFiltersChange({ ...filters, assigneeIds: selected });
  };

  const handleLabelToggle = (label: Label) => {
    const newLabels = filters.labels.includes(label)
      ? filters.labels.filter((l) => l !== label)
      : [...filters.labels, label];
    onFiltersChange({ ...filters, labels: newLabels });
  };

  const handleFromDateChange = (value: string | string[] | null | undefined) => {
    const date = typeof value === 'string' ? value.split('T')[0] : null;
    onFiltersChange({ ...filters, dueDateFrom: date });
    setShowFromDateModal(false);
  };

  const handleToDateChange = (value: string | string[] | null | undefined) => {
    const date = typeof value === 'string' ? value.split('T')[0] : null;
    onFiltersChange({ ...filters, dueDateTo: date });
    setShowToDateModal(false);
  };

  return (
    <div className="bg-white border-b border-[#E5E7EB] px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="6" cy="5" r="2.5" stroke="#6B7280" strokeWidth="1.5" />
            <path d="M1 14c0-2.5 2-4.5 5-4.5s5 2 5 4.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="5" r="2" stroke="#6B7280" strokeWidth="1.5" />
            <path d="M11 14c0-1.5 1-3 3-3" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <select
            multiple
            value={filters.assigneeIds}
            onChange={handleAssigneeChange}
            className="bg-[#F3F4F6] rounded-md px-3 py-1.5 text-sm text-[#374151] outline-none min-w-[140px] h-8"
          >
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-[#6B7280]">Labels:</span>
          {LABELS.map((label) => (
            <button
              key={label}
              onClick={() => handleLabelToggle(label)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: filters.labels.includes(label) ? LABEL_COLORS[label] : 'transparent',
                border: filters.labels.includes(label) ? 'none' : `1px solid ${LABEL_COLORS[label]}`,
                color: filters.labels.includes(label) ? 'white' : LABEL_COLORS[label],
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <rect x="2" y="3" width="12" height="11" rx="2" stroke="#6B7280" strokeWidth="1.5" />
            <path d="M5 1v3M11 1v3M2 7h12" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <button
            onClick={() => setShowFromDateModal(true)}
            className="px-3 py-1.5 border border-[#E5E7EB] rounded-md text-xs text-[#374151] hover:bg-[#F3F4F6] transition-colors"
          >
            {filters.dueDateFrom ? `From: ${filters.dueDateFrom}` : 'From'}
          </button>
          <button
            onClick={() => setShowToDateModal(true)}
            className="px-3 py-1.5 border border-[#E5E7EB] rounded-md text-xs text-[#374151] hover:bg-[#F3F4F6] transition-colors"
          >
            {filters.dueDateTo ? `To: ${filters.dueDateTo}` : 'To'}
          </button>
        </div>

        {isFiltering && (
          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-xs text-[#6B7280]">Showing {totalFiltered} tasks</span>
            <button
              onClick={() => onFiltersChange(DEFAULT_FILTER_STATE)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Clear all
            </button>
          </div>
        )}
      </div>

      <IonModal isOpen={showFromDateModal} onDidDismiss={() => setShowFromDateModal(false)}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
          <h3 className="text-base font-semibold text-[#1F2937]">From Date</h3>
          <button onClick={() => setShowFromDateModal(false)} className="px-3 py-1.5 bg-[#3B82F6] text-white rounded-md text-sm font-medium">
            Done
          </button>
        </div>
        <div className="p-4">
          <IonDatetime
            presentation="date"
            value={filters.dueDateFrom || undefined}
            onIonChange={(e) => handleFromDateChange(e.detail.value)}
          />
        </div>
      </IonModal>

      <IonModal isOpen={showToDateModal} onDidDismiss={() => setShowToDateModal(false)}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
          <h3 className="text-base font-semibold text-[#1F2937]">To Date</h3>
          <button onClick={() => setShowToDateModal(false)} className="px-3 py-1.5 bg-[#3B82F6] text-white rounded-md text-sm font-medium">
            Done
          </button>
        </div>
        <div className="p-4">
          <IonDatetime
            presentation="date"
            value={filters.dueDateTo || undefined}
            onIonChange={(e) => handleToDateChange(e.detail.value)}
          />
        </div>
      </IonModal>
    </div>
  );
};

export default FilterBar;
