import React, { useState, useCallback } from 'react';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { useCommonTranslation } from '@/lib/i18n-enhanced';

interface ItemPreviewProps {
  name: string;
  quantity: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  allergens?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ItemPreview: React.FC<ItemPreviewProps> = React.memo(
  ({
    name,
    quantity,
    description,
    imageUrl,
    imageUrls,
    allergens,
    onEdit,
    onDelete,
  }) => {
    const { t } = useCommonTranslation();
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Get the primary image from either imageUrls array or single imageUrl
    const primaryImage = imageUrls?.[0] || imageUrl;
    const additionalImagesCount =
      imageUrls && imageUrls.length > 1 ? imageUrls.length - 1 : 0;

    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
      setImageError(false);
    }, []);

    const handleImageError = useCallback(() => {
      setImageError(true);
      setImageLoaded(false);
    }, []);

    // Test if image URL is accessible
    React.useEffect(() => {
      if (primaryImage && !imageError) {
        const img = new Image();
        img.onload = handleImageLoad;
        img.onerror = handleImageError;
        img.src = primaryImage;
      }
    }, [primaryImage, imageError, handleImageLoad, handleImageError]);

    const shouldShowPlaceholder = !primaryImage || imageError || !imageLoaded;

    // Inline SVG placeholder for better performance
    const placeholderSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='79' height='79' viewBox='0 0 79 79'%3E%3Crect width='79' height='79' fill='%23f3f4f6'/%3E%3Cpath fill='%239ca3af' d='M39.5 25c-7.73 0-14 6.27-14 14s6.27 14 14 14 14-6.27 14-14-6.27-14-14-14zm0 22c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z'/%3E%3C/svg%3E`;

    return (
      <div className="flex justify-center items-center w-full p-[12px_14px_12px_12px] gap-[18px] rounded-[12px] border border-[#D9DBD5] bg-[#F5F9EF]">
        <div className="relative rounded-md shrink-0 size-[79px] bg-gray-100 overflow-hidden">
          {!shouldShowPlaceholder && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${primaryImage})` }}
            />
          )}
          {shouldShowPlaceholder && (
            <img
              src={placeholderSVG}
              alt="Placeholder image"
              className="w-full h-full object-cover opacity-50"
            />
          )}
          {additionalImagesCount > 0 && (
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full">
              +{additionalImagesCount}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-earth truncate">{name}</p>
          <p className="text-sm text-gray-500 truncate">
            {t('qtyLabel')}: {quantity}
          </p>
          {allergens && allergens.length > 0 && (
            <p className="text-sm text-gray-500 truncate">
              {t('allergens')}: {allergens.join(', ')}
            </p>
          )}
          {description && description !== name && description.trim() && (
            <p className="text-sm text-gray-500 truncate">
              {t('descriptionLabel')}:{' '}
              {description.length > 50
                ? `${description.substring(0, 47)}...`
                : description}
            </p>
          )}
        </div>
        <div className="flex flex-row gap-2 items-center shrink-0">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center justify-center rounded-full w-[42px] h-[32px] transition-colors bg-white border border-[#021d13] text-[#021d13] hover:bg-black/5"
              title={t('edit')}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.0041 3.71165C12.2257 3.49 12.5851 3.49 12.8067 3.71165L15.8338 6.7387C16.0554 6.96034 16.0554 7.31966 15.8338 7.5413L5.99592 17.3792C5.88954 17.4856 5.74513 17.5454 5.59462 17.5454H2.56757C2.25413 17.5454 2 17.2913 2 16.9778V13.9508C2 13.8003 2.05977 13.6559 2.16615 13.5495L12.0041 3.71165ZM10.9378 6.38324L13.1622 8.60762L14.6298 7.14L12.4054 4.91562L10.9378 6.38324ZM12.3595 9.41034L10.1351 7.18592L3.13513 14.1859V16.4103H5.35949L12.3595 9.41034Z"
                  fill="#024209"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center justify-center rounded-full w-[42px] h-[32px] transition-colors bg-white border border-[#CB0003] text-[#CB0003] hover:bg-black/5"
              title={t('delete')}
            >
              <svg
                width="14"
                height="15"
                viewBox="0 0 14 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.7325 4.6664H3.26824V12.9017C3.26824 13.0797 3.40931 13.224 3.58335 13.224H10.4174C10.5914 13.224 10.7325 13.0797 10.7325 12.9017V4.6664ZM12.0241 12.9017C12.0241 13.8094 11.3048 14.5452 10.4174 14.5452H3.58335C2.69602 14.5452 1.97667 13.8094 1.97667 12.9017V4.6664H0.645774C0.289119 4.6664 0 4.37065 0 4.00581C0 3.64097 0.289119 3.34521 0.645774 3.34521H13.3542L13.3709 3.34542C13.7198 3.35446 14 3.64667 14 4.00581C14 4.36495 13.7198 4.65715 13.3709 4.66619L13.3542 4.6664H12.0241V12.9017Z"
                  fill="#CB0003"
                />
                <path
                  d="M9.18653 3.51198V2.59606C9.18653 2.43967 9.03048 2.31287 8.83803 2.31286H5.16197C4.9695 2.31286 4.81345 2.43966 4.81345 2.59606V3.51198L4.81325 3.52575C4.80425 3.8141 4.51376 4.04561 4.15673 4.04561C3.79969 4.04561 3.5092 3.8141 3.5002 3.52575L3.5 3.51198V2.59606C3.5 1.85022 4.24409 1.24561 5.16197 1.24561H8.83803C9.75587 1.24561 10.5 1.85022 10.5 2.59606V3.51198C10.5 3.80669 10.206 4.04561 9.84325 4.04561C9.48055 4.0456 9.18653 3.80669 9.18653 3.51198Z"
                  fill="#CB0003"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }
);

ItemPreview.displayName = 'ItemPreview';
