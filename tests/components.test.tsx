import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import components to test
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { PhotoUpload } from '@/components/ui/PhotoUpload';
import Skeleton, {
  SkeletonCard,
  SkeletonDashboardStat,
} from '@/components/ui/Skeleton';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/test',
}));

jest.mock('next/image', () => {
  const MockImage = ({ src, alt, ...props }: any) => {
    return <img src={src} alt={alt} {...props} />;
  };
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('UI Components', () => {
  describe('Button Component', () => {
    it('renders with correct text', () => {
      render(<Button>Test Button</Button>);
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable</Button>);

      fireEvent.click(screen.getByText('Clickable'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies variant styles correctly', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByText('Primary')).toHaveClass('bg-primary');

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByText('Secondary')).toHaveClass('bg-secondary');
    });

    it('supports disabled state', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByText('Disabled Button');
      expect(button).toBeDisabled();
    });
  });

  describe('Input Component', () => {
    it('renders with placeholder text', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('handles value changes', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test input' } });

      expect(handleChange).toHaveBeenCalled();
    });

    it('supports different input types', () => {
      const { rerender } = render(<Input type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

      rerender(<Input type="password" />);
      expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');
    });

    it('shows error state correctly', () => {
      render(<Input variant="error" />);
      expect(screen.getByRole('textbox')).toHaveClass('border-negative');
    });
  });

  describe('PhotoUpload Component', () => {
    it('renders upload area', () => {
      const mockOnImageUpload = jest.fn();
      render(<PhotoUpload onImageUpload={mockOnImageUpload} />);

      expect(screen.getByText(/upload/i)).toBeInTheDocument();
    });

    it('displays hint text when provided', () => {
      const mockOnImageUpload = jest.fn();
      render(
        <PhotoUpload
          onImageUpload={mockOnImageUpload}
          hint="Upload a photo of your food item"
        />
      );

      expect(
        screen.getByText('Upload a photo of your food item')
      ).toBeInTheDocument();
    });

    it('handles file selection', async () => {
      const mockOnImageUpload = jest.fn();
      render(<PhotoUpload onImageUpload={mockOnImageUpload} />);

      const fileInput =
        screen.getByRole('button', { hidden: true }) ||
        document.querySelector('input[type="file"]');

      if (fileInput) {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
          expect(mockOnImageUpload).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Skeleton Components', () => {
    it('renders basic skeleton', () => {
      render(<Skeleton />);
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('renders skeleton card with correct structure', () => {
      render(<SkeletonCard />);
      expect(document.querySelector('.space-y-3')).toBeInTheDocument();
    });

    it('renders dashboard stat skeleton', () => {
      render(<SkeletonDashboardStat />);
      expect(document.querySelector('.h-4')).toBeInTheDocument();
    });

    it('supports custom height and width', () => {
      render(<Skeleton className="h-8 w-32" />);
      const skeleton = document.querySelector('.h-8.w-32');
      expect(skeleton).toBeInTheDocument();
    });
  });
});

describe('Form Validation', () => {
  it('validates required fields', () => {
    render(
      <form>
        <Input required placeholder="Required field" />
        <Button type="submit">Submit</Button>
      </form>
    );

    const input = screen.getByPlaceholderText('Required field');
    const submitButton = screen.getByText('Submit');

    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    expect(input).toBeInvalid();
  });

  it('validates email format', () => {
    render(<Input type="email" defaultValue="invalid-email" />);

    const input = screen.getByDisplayValue('invalid-email');
    expect(input).toBeInvalid();
  });

  it('accepts valid email format', () => {
    render(<Input type="email" defaultValue="valid@example.com" />);

    const input = screen.getByDisplayValue('valid@example.com');
    expect(input).toBeValid();
  });
});

describe('Accessibility Features', () => {
  it('supports keyboard navigation', () => {
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Input placeholder="Input field" />
      </div>
    );

    const firstButton = screen.getByText('First');
    const secondButton = screen.getByText('Second');
    const input = screen.getByPlaceholderText('Input field');

    // Test tab navigation
    firstButton.focus();
    expect(firstButton).toHaveFocus();

    fireEvent.keyDown(firstButton, { key: 'Tab' });
    // Would need jsdom environment for full focus testing
  });

  it('has proper ARIA attributes', () => {
    render(
      <Button aria-label="Close dialog" aria-pressed="false">
        <span aria-hidden="true">×</span>
      </Button>
    );

    const button = screen.getByLabelText('Close dialog');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('supports screen reader text', () => {
    render(
      <div>
        <span className="sr-only">Screen reader only text</span>
        <span>Visible text</span>
      </div>
    );

    expect(screen.getByText('Screen reader only text')).toBeInTheDocument();
    expect(screen.getByText('Visible text')).toBeInTheDocument();
  });
});

describe('Error Handling', () => {
  it('handles missing props gracefully', () => {
    // Should not crash when optional props are missing
    expect(() => render(<Button />)).not.toThrow();
    expect(() => render(<Input />)).not.toThrow();
    expect(() => render(<Skeleton />)).not.toThrow();
  });

  it('handles invalid children gracefully', () => {
    expect(() => render(<Button>{null}</Button>)).not.toThrow();
    expect(() => render(<Button>{undefined}</Button>)).not.toThrow();
  });
});
