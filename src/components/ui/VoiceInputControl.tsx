'use client';

import React, { useState, useRef } from 'react';
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

export const VoiceInputControl: React.FC<VoiceInputControlProps> = ({
  onProcessComplete,
  setServerError,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isProcessingDetails, setIsProcessingDetails] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleVoiceInput = async () => {
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
          const transcribeResponse = await fetch('/api/transcribe-audio', {
            method: 'POST',
            body: formData,
          });

          if (!transcribeResponse.ok) {
            throw new Error('Failed to transcribe audio.');
          }

          const { transcript } = await transcribeResponse.json();
          setIsTranscribing(false);
          setIsProcessingDetails(true);

          const processResponse = await fetch('/api/process-item-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript }),
          });

          if (!processResponse.ok) {
            throw new Error('Failed to process item details.');
          }
          const data = await processResponse.json();
          onProcessComplete(data);
        } catch (error) {
          logger.error('Error during voice processing pipeline:', error);
          setServerError('An error occurred. Please try again.');
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
  };

  const getButtonState = () => {
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
        action: () => {},
        disabled: true,
      };
    }
    if (isProcessingDetails) {
      return {
        text: 'Processing...',
        icon: <Brain className="h-12 w-12" />,
        action: () => {},
        disabled: true,
      };
    }
    return {
      text: '',
      icon: <Mic className="h-12 w-12" />,
      action: handleVoiceInput,
      disabled: false,
    };
  };

  const buttonState = getButtonState();

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
      </div>
    </div>
  );
}; 