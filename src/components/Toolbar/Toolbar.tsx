import React, { useState, useRef, useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { FilterState } from '../../hooks/useFilteredTasks';

interface ToolbarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onFilterToggle: () => void;
  showFilterPanel: boolean;
}

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="7" rx="2" stroke="#6B7280" strokeWidth="1.5" />
    <path d="M5 7V5a3 3 0 016 0v2" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <path d="M4 6l4 4 4-4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PersonAddIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M1 14c0-2.5 2-4.5 5-4.5s5 2 5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13 4v4M11 6h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FunnelIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 3h12l-4.5 5.5V13l-3-1.5V8.5L2 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const SwapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M11 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 5H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 14l-3-3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 11h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="4.5" stroke="#9CA3AF" strokeWidth="1.5" />
    <path d="M10.5 10.5L14 14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const Toolbar: React.FC<ToolbarProps> = ({ filters, onFiltersChange, onFilterToggle, showFilterPanel }) => {
  const { teamMembers } = useBoardStore();
  const [searchValue, setSearchValue] = useState(filters.searchQuery);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayedMembers = teamMembers.slice(0, 4);
  const remainingCount = teamMembers.length - 4;

  useEffect(() => {
    setSearchValue(filters.searchQuery);
  }, [filters.searchQuery]);

  const handleSearchInput = (value: string) => {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFiltersChange({ ...filters, searchQuery: value });
    }, 300);
  };

  return (
    <div className="bg-white border-b border-[#E5E7EB]">
      <div className="flex items-center justify-between h-[52px] px-4 md:px-5">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-[#F3F4F6] transition-colors shrink-0">
            <LockIcon />
            <span className="text-sm font-medium text-[#1F2937] hidden sm:inline">Adhivasindo</span>
            <ChevronDownIcon />
          </button>

          <div className="flex items-center shrink-0">
            {displayedMembers.map((member, index) => (
              <img
                key={member.id}
                src={member.avatar}
                alt={member.name}
                className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white object-cover"
                style={{ marginLeft: index === 0 ? '0' : '-10px', zIndex: displayedMembers.length - index, position: 'relative' }}
              />
            ))}
            {remainingCount > 0 && (
              <div
                className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#3B82F6] text-white text-[10px] md:text-xs font-semibold flex items-center justify-center border-2 border-white relative"
                style={{ marginLeft: '-10px' }}
              >
                +{remainingCount}
              </div>
            )}
          </div>

          <button className="hidden sm:flex items-center gap-1.5 h-8 px-3 bg-[#F3F4F6] rounded-lg text-[13px] font-medium text-[#374151] hover:bg-[#E5E7EB] transition-colors shrink-0">
            <PersonAddIcon />
            <span>Invite</span>
          </button>
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <button
            className={`flex items-center gap-1 md:gap-1.5 h-8 px-2 md:px-3 rounded-lg text-[13px] font-medium transition-colors ${
              showFilterPanel ? 'bg-[#3B82F6] text-white' : 'text-[#5F6368] hover:bg-[#F3F4F6]'
            }`}
            onClick={onFilterToggle}
          >
            <FunnelIcon />
            <span className="hidden sm:inline">Filter</span>
          </button>

          <button className="hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium text-[#5F6368] hover:bg-[#F3F4F6] transition-colors">
            <SwapIcon />
            <span>Export / Import</span>
          </button>

          <button
            className="flex sm:hidden items-center justify-center w-8 h-8 rounded-lg text-[#5F6368] hover:bg-[#F3F4F6] transition-colors"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <SearchIcon />
          </button>

          <div className="relative hidden sm:block">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search Tasks"
              value={searchValue}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="w-[160px] md:w-[200px] h-9 pl-9 pr-3 bg-[#F3F4F6] rounded-lg text-sm text-[#1F2937] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#3B82F6] transition-colors"
            />
          </div>
        </div>
      </div>

      {showMobileSearch && (
        <div className="px-4 pb-3 sm:hidden">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search Tasks"
              value={searchValue}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-[#F3F4F6] rounded-lg text-sm text-[#1F2937] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
