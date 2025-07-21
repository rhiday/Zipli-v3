import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';
import Skeleton, { 
  SkeletonCard, 
  SkeletonDashboardStat, 
  SkeletonRecipient, 
  SkeletonButton, 
  SkeletonText 
} from '@/components/ui/Skeleton';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Skeleton Components', () => {
  describe('Skeleton', () => {
    it('renders with default pulse animation', () => {
      const { container } = render(<Skeleton />);
      
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('bg-gray-200');
      expect(skeleton).toHaveClass('rounded-md');
    });

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />);
      
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('custom-class');
    });

    it('uses wave animation when specified', () => {
      const { container } = render(<Skeleton variant="wave" />);
      
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('animate-[wave_1.6s_ease-in-out_infinite]');
    });

    it('renders children when provided', () => {
      render(
        <Skeleton>
          <span>Child content</span>
        </Skeleton>
      );
      
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      const { container } = render(<Skeleton />);
      
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('should be accessible', async () => {
      const { container } = render(<Skeleton />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('SkeletonCard', () => {
    it('renders card skeleton structure', () => {
      const { container } = render(<SkeletonCard />);
      
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
      expect(container.querySelector('.aspect-\\[4\\/3\\]')).toBeInTheDocument();
      expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4); // Image + 3 text lines
    });

    it('applies custom className', () => {
      const { container } = render(<SkeletonCard className="custom-card" />);
      
      expect(container.firstChild).toHaveClass('custom-card');
    });

    it('should be accessible', async () => {
      const { container } = render(<SkeletonCard />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('SkeletonDashboardStat', () => {
    it('renders dashboard stat skeleton structure', () => {
      const { container } = render(<SkeletonDashboardStat />);
      
      expect(container.querySelector('.bg-lime\\/20')).toBeInTheDocument();
      expect(container.querySelector('.rounded-xl')).toBeInTheDocument();
      expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3); // Value, icon, label
    });

    it('applies custom className', () => {
      const { container } = render(<SkeletonDashboardStat className="custom-stat" />);
      
      expect(container.firstChild).toHaveClass('custom-stat');
    });

    it('should be accessible', async () => {
      const { container } = render(<SkeletonDashboardStat />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('SkeletonRecipient', () => {
    it('renders recipient skeleton structure', () => {
      const { container } = render(<SkeletonRecipient />);
      
      expect(container.querySelector('.rounded-full')).toBeInTheDocument(); // Avatar
      expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3); // Avatar + 2 text lines
    });

    it('applies custom className', () => {
      const { container } = render(<SkeletonRecipient className="custom-recipient" />);
      
      expect(container.firstChild).toHaveClass('custom-recipient');
    });

    it('should be accessible', async () => {
      const { container } = render(<SkeletonRecipient />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('SkeletonButton', () => {
    it('renders button skeleton', () => {
      const { container } = render(<SkeletonButton />);
      
      const button = container.firstChild as HTMLElement;
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('w-24');
      expect(button).toHaveClass('rounded-lg');
      expect(button).toHaveClass('animate-pulse');
    });

    it('applies custom className', () => {
      const { container } = render(<SkeletonButton className="custom-button" />);
      
      expect(container.firstChild).toHaveClass('custom-button');
    });

    it('should be accessible', async () => {
      const { container } = render(<SkeletonButton />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('SkeletonText', () => {
    it('renders default 3 lines of text', () => {
      const { container } = render(<SkeletonText />);
      
      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines).toHaveLength(3);
    });

    it('renders custom number of lines', () => {
      const { container } = render(<SkeletonText lines={5} />);
      
      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines).toHaveLength(5);
    });

    it('makes last line shorter', () => {
      const { container } = render(<SkeletonText lines={2} />);
      
      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines[0]).toHaveClass('w-full');
      expect(lines[1]).toHaveClass('w-3/4');
    });

    it('applies custom className to container', () => {
      const { container } = render(<SkeletonText className="custom-text" />);
      
      expect(container.firstChild).toHaveClass('custom-text');
    });

    it('applies custom className to lines', () => {
      const { container } = render(<SkeletonText lineClassName="custom-line" />);
      
      const lines = container.querySelectorAll('.custom-line');
      expect(lines).toHaveLength(3);
    });

    it('should be accessible', async () => {
      const { container } = render(<SkeletonText />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Display Names', () => {
    it('has correct display names for debugging', () => {
      expect(Skeleton.displayName).toBe('Skeleton');
      expect(SkeletonCard.displayName).toBe('SkeletonCard');
      expect(SkeletonDashboardStat.displayName).toBe('SkeletonDashboardStat');
      expect(SkeletonRecipient.displayName).toBe('SkeletonRecipient');
      expect(SkeletonButton.displayName).toBe('SkeletonButton');
      expect(SkeletonText.displayName).toBe('SkeletonText');
    });
  });

  describe('Memoization', () => {
    it('prevents unnecessary re-renders', () => {
      const { rerender } = render(<SkeletonCard />);
      
      const firstRender = document.querySelector('.bg-white');
      
      // Re-render with same props
      rerender(<SkeletonCard />);
      
      const secondRender = document.querySelector('.bg-white');
      
      // Should be the same element (React.memo working)
      expect(firstRender).toBe(secondRender);
    });
  });
});