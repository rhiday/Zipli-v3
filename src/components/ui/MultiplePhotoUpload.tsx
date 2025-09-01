import React, { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';

interface MultiplePhotoUploadProps {
  isMobile?: boolean;
  hint?: string;
  onImagesUpload?: (imageUrls: string[]) => void;
  uploadedImages?: string[];
  maxImages?: number;
}

export const MultiplePhotoUpload: React.FC<MultiplePhotoUploadProps> = ({
  isMobile,
  hint,
  onImagesUpload,
  uploadedImages = [],
  maxImages = 5,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (
    file: File,
    maxWidth: number = 800,
    quality: number = 0.8
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    if (onImagesUpload) {
      onImagesUpload(newImages);
    }
  };

  const handleFileSelect = async (files: FileList) => {
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB per image
    setError(null);
    setUploading(true);

    if (uploadedImages.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images.`);
      setUploading(false);
      return;
    }

    const newImageUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > maxSizeInBytes) {
        setError('Image size too big. Please select an image under 5MB.');
        setUploading(false);
        return;
      }

      if (
        file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'image/webp'
      ) {
        try {
          // Compress image for better performance
          const compressedImage = await compressImage(file);
          newImageUrls.push(compressedImage);
        } catch (error) {
          // Fallback to original if compression fails
          const reader = new FileReader();
          const result = await new Promise<string>((resolve) => {
            reader.onload = (e) => {
              resolve(e.target?.result as string);
            };
            reader.readAsDataURL(file);
          });
          newImageUrls.push(result);
        }
      } else {
        setError('Please select JPEG, PNG, or WebP image files only.');
        setUploading(false);
        return;
      }
    }

    if (onImagesUpload) {
      onImagesUpload([...uploadedImages, ...newImageUrls]);
    }
    setUploading(false);
  };

  const handleClick = () => {
    if (!uploading && uploadedImages.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Grid Layout - Images + Add Button */}
      <div className="grid grid-cols-3 gap-3">
        {/* Uploaded Images */}
        {uploadedImages.map((image, index) => (
          <div key={index} className="relative aspect-square">
            <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100">
              <img
                src={image}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              disabled={uploading}
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        ))}

        {/* Add Photo Button */}
        {uploadedImages.length < maxImages && (
          <div className="aspect-square">
            <button
              onClick={handleClick}
              disabled={uploading}
              className={`w-full h-full rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center transition-colors
                ${
                  uploading
                    ? 'bg-gray-50 cursor-not-allowed opacity-50'
                    : 'bg-gray-50 hover:bg-gray-100 hover:border-gray-400 cursor-pointer'
                }`}
            >
              <Plus
                size={24}
                className={uploading ? 'text-gray-400' : 'text-gray-600'}
              />
              <p
                className={`text-xs mt-2 text-center px-2 ${uploading ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {uploading
                  ? 'Uploading...'
                  : uploadedImages.length === 0
                    ? 'Add photos'
                    : 'Add more'}
              </p>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) =>
                e.target.files && handleFileSelect(e.target.files)
              }
              className="hidden"
              disabled={uploading}
            />
          </div>
        )}
      </div>

      {/* Upload Info */}
      <p className="text-xs text-gray-500 text-center mt-3">
        {uploadedImages.length}/{maxImages} photos • Max 5MB each
      </p>
    </div>
  );
};
