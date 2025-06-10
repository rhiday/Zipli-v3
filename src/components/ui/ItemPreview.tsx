import React from 'react';

interface ItemPreviewProps {
  name: string;
  quantity: string;
  imageUrl?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ItemPreview: React.FC<ItemPreviewProps> = ({ name, quantity, imageUrl, onEdit, onDelete }) => {
  return (
    <div className="flex justify-center items-center w-full p-[12px_14px_12px_12px] gap-[18px] rounded-[12px] border border-[#D9DBD5] bg-[#F5F9EF]">
      <div 
        className="bg-cover bg-center bg-no-repeat rounded-md shrink-0 size-[79px] bg-gray-100 flex items-center justify-center"
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        }}
      >
        {!imageUrl && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2Z" fill="#6B7280"/>
            <path d="M21 8V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V8C3 6.89543 3.89543 6 5 6H7L8.5 4H15.5L17 6H19C20.1046 6 21 6.89543 21 8ZM19 8H17H15.5L14 6H10L8.5 8H7H5V18H19V8Z" fill="#6B7280"/>
            <path d="M17 11H13V15H11V11H7V9H11V5H13V9H17V11Z" fill="#6B7280"/>
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-manrope font-semibold text-[#021d13] text-[16px] truncate">{name}</div>
        <div className="font-manrope text-[14px] text-[#021d13] opacity-60 mt-1">Qty: {quantity}</div>
      </div>
      <div className="flex flex-row gap-2 items-center shrink-0">
        <button
          onClick={onEdit}
          className="flex items-center justify-center rounded-full w-[42px] h-[32px] transition-colors bg-white border border-[#021d13] text-[#021d13] hover:bg-black/5"
          aria-label="Edit"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M12.0041 3.71165C12.2257 3.49 12.5851 3.49 12.8067 3.71165L15.8338 6.7387C16.0554 6.96034 16.0554 7.31966 15.8338 7.5413L5.99592 17.3792C5.88954 17.4856 5.74513 17.5454 5.59462 17.5454H2.56757C2.25413 17.5454 2 17.2913 2 16.9778V13.9508C2 13.8003 2.05977 13.6559 2.16615 13.5495L12.0041 3.71165ZM10.9378 6.38324L13.1622 8.60762L14.6298 7.14L12.4054 4.91562L10.9378 6.38324ZM12.3595 9.41034L10.1351 7.18592L3.13513 14.1859V16.4103H5.35949L12.3595 9.41034Z" fill="#024209"/>
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center rounded-full w-[42px] h-[32px] transition-colors bg-white border border-[#CB0003] text-[#CB0003] hover:bg-black/5"
          aria-label="Delete"
        >
          <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.7325 4.6664H3.26824V12.9017C3.26824 13.0797 3.40931 13.224 3.58335 13.224H10.4174C10.5914 13.224 10.7325 13.0797 10.7325 12.9017V4.6664ZM12.0241 12.9017C12.0241 13.8094 11.3048 14.5452 10.4174 14.5452H3.58335C2.69602 14.5452 1.97667 13.8094 1.97667 12.9017V4.6664H0.645774C0.289119 4.6664 0 4.37065 0 4.00581C0 3.64097 0.289119 3.34521 0.645774 3.34521H13.3542L13.3709 3.34542C13.7198 3.35446 14 3.64667 14 4.00581C14 4.36495 13.7198 4.65715 13.3709 4.66619L13.3542 4.6664H12.0241V12.9017Z" fill="#CB0003"/>
            <path d="M9.18653 3.51198V2.59606C9.18653 2.43967 9.03048 2.31287 8.83803 2.31286H5.16197C4.9695 2.31286 4.81345 2.43966 4.81345 2.59606V3.51198L4.81325 3.52575C4.80425 3.8141 4.51376 4.04561 4.15673 4.04561C3.79969 4.04561 3.5092 3.8141 3.5002 3.52575L3.5 3.51198V2.59606C3.5 1.85022 4.24409 1.24561 5.16197 1.24561H8.83803C9.75587 1.24561 10.5 1.85022 10.5 2.59606V3.51198C10.5 3.80669 10.206 4.04561 9.84325 4.04561C9.48055 4.0456 9.18653 3.80669 9.18653 3.51198Z" fill="#CB0003"/>
          </svg>
        </button>
      </div>
    </div>
  );
}; 