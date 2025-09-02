/**
 * PhotoActionSheet - Camera and Gallery selection drawer with dark mode support
 */

import React from 'react';
import { Camera, Image, X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useCommonTranslation } from '@/hooks/useTranslations';

interface PhotoActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCameraSelect: () => void;
  onGallerySelect: () => void;
  showCameraOption?: boolean;
  showGalleryOption?: boolean;
  title?: string;
  cameraLabel?: string;
  galleryLabel?: string;
  cancelLabel?: string;
}

export const PhotoActionSheet: React.FC<PhotoActionSheetProps> = ({
  open,
  onOpenChange,
  onCameraSelect,
  onGallerySelect,
  showCameraOption = true,
  showGalleryOption = true,
  title,
  cameraLabel,
  galleryLabel,
  cancelLabel,
}) => {
  const { t } = useCommonTranslation();

  const handleCameraSelect = () => {
    onOpenChange(false);
    onCameraSelect();
  };

  const handleGallerySelect = () => {
    onOpenChange(false);
    onGallerySelect();
  };

  const finalTitle = title || t('photoOptions') || 'Photo Options';
  const finalCameraLabel = cameraLabel || t('takePhoto') || 'Take Photo';
  const finalGalleryLabel =
    galleryLabel || t('chooseFromGallery') || 'Choose from Gallery';
  const finalCancelLabel = cancelLabel || t('cancel') || 'Cancel';

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-lg mx-auto dark:bg-gray-800">
        <DrawerHeader className="text-center border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DrawerTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                {finalTitle}
              </DrawerTitle>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="p-2 dark:text-white dark:hover:bg-gray-700">
                <X size={20} />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="p-4 space-y-3">
          {showCameraOption && (
            <Button
              variant="secondary"
              size="lg"
              className="w-full flex items-center justify-start gap-4 h-14 text-left font-medium dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              onClick={handleCameraSelect}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Camera size={18} className="text-blue-600 dark:text-blue-300" />
              </div>
              <span className="text-gray-900 dark:text-white">{finalCameraLabel}</span>
            </Button>
          )}

          {showGalleryOption && (
            <Button
              variant="secondary"
              size="lg"
              className="w-full flex items-center justify-start gap-4 h-14 text-left font-medium dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              onClick={handleGallerySelect}
            >
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Image size={18} className="text-green-600 dark:text-green-300" />
              </div>
              <span className="text-gray-900 dark:text-white">{finalGalleryLabel}</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="lg"
            className="w-full mt-4 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            onClick={() => onOpenChange(false)}
          >
            {finalCancelLabel}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PhotoActionSheet;