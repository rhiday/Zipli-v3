'use client';

import React, { useEffect, useState } from 'react';
import { useAutoSave } from '@/lib/auto-save';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveFormWrapperProps {
  children: React.ReactNode;
  formId: string;
  formData: Record<string, any>;
  enabled?: boolean;
  intervalMs?: number;
  onRestore?: (data: Record<string, any>) => void;
  onSave?: () => void;
  onClear?: () => void;
  showStatus?: boolean;
  className?: string;
  preventRestore?: boolean; // Prevent showing restore prompt for fresh forms
}

export const AutoSaveFormWrapper: React.FC<AutoSaveFormWrapperProps> = ({
  children,
  formId,
  formData,
  enabled = true,
  intervalMs = 3000,
  onRestore,
  onSave,
  onClear,
  showStatus = true,
  className = '',
  preventRestore = false,
}) => {
  const [hasRestoredData, setHasRestoredData] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  const { hasUnsaved, restore, clear } = useAutoSave({
    key: formId,
    data: formData,
    enabled,
    intervalMs,
    // Remove onSave callback as it's not supported by the hook
  });

  // Check for saved data on mount
  useEffect(() => {
    if (!hasRestoredData && !preventRestore) {
      const savedData = restore();
      if (savedData && Object.keys(savedData).length > 0) {
        // Check if saved data is different from current data
        const hasSignificantData = Object.values(savedData).some((value) => {
          if (typeof value === 'string') return value.trim().length > 0;
          if (Array.isArray(value)) return value.length > 0;
          return value != null;
        });

        if (hasSignificantData) {
          setShowRestorePrompt(true);
        }
      }
      setHasRestoredData(true);
    } else if (preventRestore) {
      // If preventRestore is true, clear any saved data and don't show restore prompt
      clear();
      setHasRestoredData(true);
    }
  }, [hasRestoredData, restore, preventRestore, clear]);

  const handleRestore = () => {
    const savedData = restore();
    if (savedData) {
      onRestore?.(savedData);
      setShowRestorePrompt(false);
      toast({
        title: 'Data restored',
        description: 'Your previous form data has been restored',
        variant: 'success',
      });
    }
  };

  const handleDismissRestore = () => {
    setShowRestorePrompt(false);
  };

  const handleClearSaved = () => {
    clear();
    onClear?.();
    setShowRestorePrompt(false);
    toast({
      title: 'Saved data cleared',
      description: 'Auto-saved form data has been removed',
      variant: 'info',
    });
  };

  // Remove lastSaved functionality for now since it's not available in the hook

  return (
    <div className={cn('relative', className)}>
      {/* Restore Data Prompt */}
      {showRestorePrompt && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900">
                Restore Previous Data?
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                We found previously saved form data. Would you like to restore
                it?
              </p>
              <div className="mt-3 flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleRestore}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restore
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDismissRestore}
                >
                  Start Fresh
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearSaved}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear Saved
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-save Status */}
      {showStatus && enabled && !showRestorePrompt && (
        <div className="mb-3 flex items-center justify-between p-2 bg-gray-50 rounded text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Auto-save enabled</span>
          </div>
          {hasUnsaved && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <span className="text-xs">Auto-saving...</span>
            </div>
          )}
        </div>
      )}

      {/* Form Content */}
      {children}
    </div>
  );
};

export default AutoSaveFormWrapper;
