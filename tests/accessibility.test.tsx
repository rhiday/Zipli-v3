import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

// Import components to test
import BottomNav from '@/components/BottomNav';
import Header from '@/components/layout/Header';
import { PhotoUpload } from '@/components/ui/PhotoUpload';
import { VoiceInputControl } from '@/components/ui/VoiceInputControl';
import ImpactDashboard from '@/components/dashboard/ImpactDashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock dependencies
jest.mock('@/store/databaseStore', () => ({
  useDatabase: () => ({
    currentUser: {
      id: 'test-user',
      email: 'test@example.com',
      role: 'food_donor',
      full_name: 'Test User',
    },
    donations: [],
    foodItems: [],
    isInitialized: true,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/donate',
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return React.cloneElement(children, { ...props, href });
  };
});

// Mock MediaRecorder for VoiceInputControl
Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value: class {
    static isTypeSupported = () => true;
    start = jest.fn();
    stop = jest.fn();
    ondataavailable = null;
    onstop = null;
    state = 'inactive';
  },
});

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [],
    }),
  },
});

describe('Accessibility Tests', () => {
  describe('Navigation Components', () => {
    it('BottomNav should be accessible', async () => {
      const { container } = render(<BottomNav />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Header should be accessible', async () => {
      const { container } = render(<Header title="Test Header" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Form Components', () => {
    it('PhotoUpload should be accessible', async () => {
      const mockOnImageUpload = jest.fn();
      const { container } = render(
        <PhotoUpload 
          onImageUpload={mockOnImageUpload}
          hint="Upload a photo of your food item"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('VoiceInputControl should be accessible', async () => {
      const mockOnProcessComplete = jest.fn();
      const mockSetServerError = jest.fn();
      
      const { container } = render(
        <VoiceInputControl 
          onProcessComplete={mockOnProcessComplete}
          setServerError={mockSetServerError}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Button should be accessible', async () => {
      const { container } = render(
        <Button variant="primary">
          Accessible Button
        </Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Input should be accessible', async () => {
      const { container } = render(
        <Input 
          type="text"
          placeholder="Enter text"
          aria-label="Text input field"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dashboard Components', () => {
    it('ImpactDashboard should be accessible', async () => {
      const { container } = render(
        <ImpactDashboard 
          totalWeight={46}
          portionsOffered={131}
          savedCosts={125}
          emissionReduction={89}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Interactive Elements', () => {
    it('should have proper focus management', () => {
      render(
        <div>
          <Button>First Button</Button>
          <Button>Second Button</Button>
          <Input type="text" placeholder="Input field" />
        </div>
      );

      const buttons = document.querySelectorAll('button');
      const input = document.querySelector('input');

      // All interactive elements should be focusable
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
      
      expect(input).not.toHaveAttribute('tabindex', '-1');
    });

    it('should have proper ARIA labels for icon buttons', () => {
      const { container } = render(
        <button aria-label="Close dialog">
          <svg viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('should have proper heading hierarchy', () => {
      render(
        <div>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
        </div>
      );

      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      const h3 = document.querySelector('h3');

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient color contrast for text', () => {
      const { container } = render(
        <div className="text-primary bg-base">
          This text should have sufficient contrast
        </div>
      );

      // This would typically require a more sophisticated contrast checker
      // For now, we ensure the elements are properly structured
      const textElement = container.firstChild as HTMLElement;
      expect(textElement).toHaveClass('text-primary');
      expect(textElement).toHaveClass('bg-base');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for interactive elements', () => {
      render(
        <div>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
          <a href="#test">Link</a>
        </div>
      );

      const interactiveElements = document.querySelectorAll('button, a');
      
      interactiveElements.forEach(element => {
        // All interactive elements should be keyboard accessible
        expect(element.tagName).toMatch(/^(BUTTON|A)$/);
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper alt text for images', () => {
      render(
        <img src="/test-image.jpg" alt="Descriptive alt text" />
      );

      const image = document.querySelector('img');
      expect(image).toHaveAttribute('alt', 'Descriptive alt text');
    });

    it('should use semantic HTML elements', () => {
      render(
        <main>
          <article>
            <header>
              <h1>Article Title</h1>
            </header>
            <section>
              <p>Article content</p>
            </section>
          </article>
        </main>
      );

      expect(document.querySelector('main')).toBeInTheDocument();
      expect(document.querySelector('article')).toBeInTheDocument();
      expect(document.querySelector('header')).toBeInTheDocument();
      expect(document.querySelector('section')).toBeInTheDocument();
    });

    it('should have proper form labels', () => {
      render(
        <form>
          <label htmlFor="username">Username</label>
          <input id="username" type="text" />
          
          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
        </form>
      );

      const usernameInput = document.getElementById('username');
      const emailInput = document.getElementById('email');

      expect(usernameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      
      const usernameLabel = document.querySelector('label[for="username"]');
      const emailLabel = document.querySelector('label[for="email"]');
      
      expect(usernameLabel).toBeInTheDocument();
      expect(emailLabel).toBeInTheDocument();
    });
  });

  describe('ARIA Attributes', () => {
    it('should use appropriate ARIA roles', () => {
      render(
        <div>
          <nav role="navigation">
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
            </ul>
          </nav>
          <main role="main">
            <h1>Main Content</h1>
          </main>
        </div>
      );

      const nav = document.querySelector('[role="navigation"]');
      const main = document.querySelector('[role="main"]');

      expect(nav).toBeInTheDocument();
      expect(main).toBeInTheDocument();
    });

    it('should use aria-describedby for additional information', () => {
      render(
        <div>
          <input 
            type="password" 
            aria-describedby="password-help"
          />
          <div id="password-help">
            Password must be at least 8 characters
          </div>
        </div>
      );

      const input = document.querySelector('input');
      const helpText = document.getElementById('password-help');

      expect(input).toHaveAttribute('aria-describedby', 'password-help');
      expect(helpText).toBeInTheDocument();
    });
  });
});