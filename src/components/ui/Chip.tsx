import React from 'react';

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({ label, selected, onClick, onRemove, className }) => {
  return (
    <button
      type="button"
      className={[
        'flex items-center gap-2 rounded-full px-4 h-8 text-[14px] font-semibold font-manrope transition-colors',
        selected
          ? 'bg-[#a6f175] text-[#021d13] border-none'
          : 'bg-white border border-[#021d13] text-[#021d13]',
        className,
      ].join(' ')}
      onClick={onClick}
      tabIndex={0}
    >
      <span className="truncate">{label}</span>
      {selected && onRemove && (
        <span
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 flex items-center justify-center w-5 h-5 rounded-full hover:bg-black/10 transition cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M8 1C11.866 1.00002 15 4.13404 15 8C15 11.8659 11.8659 15 8 15C4.13404 15 1.00002 11.866 1 8C1 4.13403 4.13403 1 8 1ZM11.2949 4.70508C11.0215 4.43183 10.5784 4.43175 10.3051 4.70508L8 7.01016L5.69492 4.70508C5.42156 4.43171 4.97845 4.43171 4.70508 4.70508C4.43186 4.97846 4.43176 5.4216 4.70508 5.69492L7.01016 8L4.70508 10.3051C4.43207 10.5784 4.43194 11.0217 4.70508 11.2949C4.97835 11.568 5.42159 11.5679 5.69492 11.2949L8 8.98984L10.3051 11.2949C10.5784 11.568 11.0216 11.5681 11.2949 11.2949C11.5682 11.0216 11.5681 10.5785 11.2949 10.3051L8.98984 8L11.2949 5.69492C11.5682 5.42161 11.5681 4.97846 11.2949 4.70508Z" fill="#021D13"/>
          </svg>
        </span>
      )}
    </button>
  );
};

Chip.displayName = 'Chip'; 