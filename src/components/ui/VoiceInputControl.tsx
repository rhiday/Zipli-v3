'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle, Brain, Loader2 } from 'lucide-react';
import { logger } from '../../../lib/logger';
import { cn } from '@/lib/utils';

// Helper function to detect iOS
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod',
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
};

const getRecordingMimeType = () => {
  if (isIOS()) {
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      return 'audio/webm;codecs=opus';
    }
    if (MediaRecorder.isTypeSupported('audio/mp4')) {
      return 'audio/mp4';
    } else if (MediaRecorder.isTypeSupported('audio/aac')) {
      return 'audio/aac';
    }
  }
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    return 'audio/webm;codecs=opus';
  }
  if (MediaRecorder.isTypeSupported('audio/webm')) {
    return 'audio/webm';
  }
  return '';
};

interface VoiceInputControlProps {
  onProcessComplete: (data: any) => void;
  setServerError: (error: string | null) => void;
}

export const VoiceInputControl: React.FC<VoiceInputControlProps> = React.memo(({
  onProcessComplete,
  setServerError,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isProcessingDetails, setIsProcessingDetails] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleVoiceInput = useCallback(async () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      return;
    }

    setIsTranscribing(false);
    setIsProcessingDetails(false);
    setServerError(null);

    try {
      const recordingMimeType = getRecordingMimeType();
      if (!recordingMimeType) {
        setServerError(
          'Audio recording format not supported on this browser. Please try typing details manually.'
        );
        logger.error('No suitable recordingMimeType found for this browser.');
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: recordingMimeType,
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recordingMimeType,
        });
        audioChunksRef.current = [];

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
          // Add timeout for fetch
          const transcribePromise = fetch('/api/transcribe-audio', {
            method: 'POST',
            body: formData,
          });
          const transcribeResponse = await Promise.race([
            transcribePromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Transcription timed out.')), 20000)),
          ]);

          if (!(transcribeResponse instanceof Response)) {
            throw new Error('Unexpected error during transcription.');
          }

          if (!transcribeResponse.ok) {
            throw new Error('Failed to transcribe audio.');
          }

          const { transcript } = await transcribeResponse.json();
          setIsTranscribing(false);
          setIsProcessingDetails(true);

          // Add timeout for process fetch
          const processPromise = fetch('/api/process-item-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript }),
          });
          const processResponse = await Promise.race([
            processPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Processing timed out.')), 20000)),
          ]);

          if (!(processResponse instanceof Response)) {
            throw new Error('Unexpected error during processing.');
          }

          if (!processResponse.ok) {
            throw new Error('Failed to process item details.');
          }
          const data = await processResponse.json();
          onProcessComplete(data);
        } catch (error: any) {
          logger.error('Error during voice processing pipeline:', error);
          setServerError(error?.message || 'An error occurred. Please try again.');
          setIsTranscribing(false);
          setIsProcessingDetails(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      logger.error('Error starting recording:', error);
      setServerError(
        'Could not start recording. Please ensure microphone permissions are granted.'
      );
    }
  }, [isRecording, onProcessComplete, setServerError]);

  // Memoized empty function to prevent re-renders
  const noopAction = useCallback(() => {}, []);

  // Memoized button state
  const buttonState = useMemo(() => {
    if (isRecording) {
      return {
        text: 'Listening...',
        icon: <StopCircle className="h-12 w-12" />,
        action: handleVoiceInput,
        disabled: false,
      };
    }
    if (isTranscribing) {
      return {
        text: 'Transcribing...',
        icon: <Loader2 className="h-12 w-12 animate-spin" />,
        action: noopAction,
        disabled: true,
      };
    }
    if (isProcessingDetails) {
      return {
        text: 'Processing...',
        icon: <Brain className="h-12 w-12" />,
        action: noopAction,
        disabled: true,
      };
    }
    return {
      text: '',
      icon: <Mic className="h-12 w-12" />,
      action: handleVoiceInput,
      disabled: false,
    };
  }, [isRecording, isTranscribing, isProcessingDetails, handleVoiceInput, noopAction]);

  return (
    <div className="text-center">
      <div className="flex flex-col items-center justify-center">
        <Button
          onClick={buttonState.action}
          disabled={buttonState.disabled}
          className={cn(
            'w-40 h-40 rounded-full text-white transition-all duration-300 flex items-center justify-center bg-green-500 hover:bg-green-600',
            { 'bg-red-500 hover:bg-red-600': isRecording }
          )}
        >
          {buttonState.icon}
        </Button>
        <p className="mt-6 text-lg font-medium text-gray-700">
          {buttonState.text || 'Press for voice input'}
        </p>
        {isRecording && (
          <p className="mt-2 text-sm text-gray-500 animate-pulse">Recording... Speak now and press again to stop.</p>
        )}
        {isTranscribing && (
          <div className="mt-4 flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <span className="mt-2 text-sm text-gray-500">Transcribing your voice...</span>
          </div>
        )}
        {isProcessingDetails && (
          <div className="mt-4 flex flex-col items-center">
            <Brain className="h-8 w-8 animate-bounce text-green-500" />
            <span className="mt-2 text-sm text-gray-500">Extracting donation details...</span>
          </div>
        )}
      </div>
    </div>
  );
});

VoiceInputControl.displayName = 'VoiceInputControl'; 