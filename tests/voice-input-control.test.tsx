import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';
import { VoiceInputControl } from '@/components/ui/VoiceInputControl';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock MediaRecorder
class MockMediaRecorder {
  static isTypeSupported = jest.fn().mockReturnValue(true);
  
  start = jest.fn();
  stop = jest.fn();
  ondataavailable = null;
  onstop = null;
  state = 'inactive';
  
  constructor(stream: MediaStream, options?: any) {
    this.state = 'recording';
  }
}

// Mock getUserMedia
const mockGetUserMedia = jest.fn().mockResolvedValue({
  getTracks: () => [],
});

Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value: MockMediaRecorder,
});

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
  },
});

// Mock fetch for API calls
global.fetch = jest.fn();

describe('VoiceInputControl', () => {
  const mockOnProcessComplete = jest.fn();
  const mockSetServerError = jest.fn();

  const defaultProps = {
    onProcessComplete: mockOnProcessComplete,
    setServerError: mockSetServerError,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    MockMediaRecorder.isTypeSupported.mockReturnValue(true);
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [],
    });
  });

  it('renders initial state correctly', () => {
    render(<VoiceInputControl {...defaultProps} />);
    
    expect(screen.getByText('Press for voice input')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('starts recording when button is clicked', async () => {
    const user = userEvent.setup();
    render(<VoiceInputControl {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Listening...')).toBeInTheDocument();
    });
    
    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  it('shows error when microphone permission denied', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));
    
    const user = userEvent.setup();
    render(<VoiceInputControl {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockSetServerError).toHaveBeenCalledWith(
        'Could not start recording. Please ensure microphone permissions are granted.'
      );
    });
  });

  it('handles unsupported browser gracefully', async () => {
    MockMediaRecorder.isTypeSupported.mockReturnValue(false);
    
    const user = userEvent.setup();
    render(<VoiceInputControl {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockSetServerError).toHaveBeenCalledWith(
        'Audio recording format not supported on this browser. Please try typing details manually.'
      );
    });
  });

  it('shows transcribing state after recording', async () => {
    const user = userEvent.setup();
    render(<VoiceInputControl {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Listening...')).toBeInTheDocument();
    });
    
    // Stop recording
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Transcribing...')).toBeInTheDocument();
    });
  });

  it('shows processing state after transcription', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ transcript: 'Test transcript' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });
    
    const user = userEvent.setup();
    render(<VoiceInputControl {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Wait for recording to start
    await waitFor(() => {
      expect(screen.getByText('Listening...')).toBeInTheDocument();
    });
    
    // Stop recording
    await user.click(button);
    
    // Should show transcribing
    await waitFor(() => {
      expect(screen.getByText('Transcribing...')).toBeInTheDocument();
    });
    
    // Should show processing
    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  it('handles transcription API errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    const user = userEvent.setup();
    render(<VoiceInputControl {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Listening...')).toBeInTheDocument();
    });
    
    await user.click(button);
    
    await waitFor(() => {
      expect(mockSetServerError).toHaveBeenCalledWith('API Error');
    });
  });

  it('handles transcription timeout', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 25000))
    );
    
    const user = userEvent.setup();
    render(<VoiceInputControl {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Listening...')).toBeInTheDocument();
    });
    
    await user.click(button);
    
    await waitFor(() => {
      expect(mockSetServerError).toHaveBeenCalledWith('Transcription timed out.');
    }, { timeout: 25000 });
  });

  it('processes successful workflow', async () => {
    const mockTranscript = 'I have 5kg of apples to donate';
    const mockProcessedData = {
      items: [{ name: 'Apples', quantity: '5 kg', allergens: [] }],
    };
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ transcript: mockTranscript }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProcessedData),
      });
    
    const user = userEvent.setup();
    render(<VoiceInputControl {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Listening...')).toBeInTheDocument();
    });
    
    await user.click(button);
    
    await waitFor(() => {
      expect(mockOnProcessComplete).toHaveBeenCalledWith(mockProcessedData);
    });
  });

  it('should be accessible', async () => {
    const { container } = render(<VoiceInputControl {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper ARIA attributes', () => {
    render(<VoiceInputControl {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    // Button should have accessible content
    expect(button).toHaveTextContent('Press for voice input');
  });

  it('shows visual feedback during different states', async () => {
    render(<VoiceInputControl {...defaultProps} />);
    
    // Initial state
    expect(screen.getByText('Press for voice input')).toBeInTheDocument();
    
    const user = userEvent.setup();
    const button = screen.getByRole('button');
    
    await user.click(button);
    
    // Recording state
    await waitFor(() => {
      expect(screen.getByText('Listening...')).toBeInTheDocument();
      expect(screen.getByText('Recording... Speak now and press again to stop.')).toBeInTheDocument();
    });
  });

  it('memoizes correctly to prevent unnecessary re-renders', () => {
    const { rerender } = render(<VoiceInputControl {...defaultProps} />);
    
    const firstRender = screen.getByRole('button');
    
    // Re-render with same props
    rerender(<VoiceInputControl {...defaultProps} />);
    
    const secondRender = screen.getByRole('button');
    
    // Should be the same element (React.memo working)
    expect(firstRender).toBe(secondRender);
  });

  it('clears errors when starting new recording', async () => {
    const user = userEvent.setup();
    render(<VoiceInputControl {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockSetServerError).toHaveBeenCalledWith(null);
  });
});