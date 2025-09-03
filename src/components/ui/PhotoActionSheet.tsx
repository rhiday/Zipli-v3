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
    // Delay to ensure modal closes before triggering camera (iOS needs more time)
    setTimeout(() => {
      onCameraSelect();
    }, 300);
  };

  const handleGallerySelect = () => {
    onOpenChange(false);
    // Delay to ensure modal closes before triggering gallery (iOS needs more time)
    setTimeout(() => {
      onGallerySelect();
    }, 300);
  };

  const finalTitle = title || t('photoOptions') || 'Photo Options';
  const finalCameraLabel = cameraLabel || t('takePhoto') || 'Take Photo';
  const finalGalleryLabel =
    galleryLabel || t('chooseFromGallery') || 'Choose from Gallery';
  const finalCancelLabel = cancelLabel || t('cancel') || 'Cancel';

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-base">
        <DrawerHeader className="text-center border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DrawerTitle className="text-lg font-semibold text-primary">
                {finalTitle}
              </DrawerTitle>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="p-2">
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
              className="w-full justify-start py-5 text-left"
              onClick={handleCameraSelect}
            >
              <div className="w-8 h-8 mr-3 rounded-full bg-cream flex items-center justify-center">
                <Camera size={18} className="text-blue" />
              </div>
              <div>
                <p className="font-semibold text-primary">{finalCameraLabel}</p>
              </div>
            </Button>
          )}

          {showGalleryOption && (
            <Button
              variant="secondary"
              size="lg"
              className="w-full justify-start py-5 text-left"
              onClick={handleGallerySelect}
            >
              <div className="w-8 h-8 mr-3 rounded-full bg-cream flex items-center justify-center">
                <Image size={18} className="text-earth" />
              </div>
              <div>
                <p className="font-semibold text-primary">
                  {finalGalleryLabel}
                </p>
              </div>
            </Button>
          )}

          <Button
            variant="secondary"
            size="lg"
            className="w-full mt-4"
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
