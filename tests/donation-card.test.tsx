import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';
import DonationCard from '@/components/donations/DonationCard';
import { DonationWithFoodItem } from '@/types/supabase';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Next.js router and Link
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return React.cloneElement(children, {
      ...props,
      href,
      onClick: (e: any) => {
        e.preventDefault();
        console.log(`Navigate to: ${href}`);
      },
    });
  };
});

// Mock Next.js Image component
jest.mock('next/image', () => {
  const MockImage = ({ src, alt, fill, className, onError, ...props }: any) => {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={onError}
        {...props}
        style={fill ? { position: 'absolute', inset: 0 } : undefined}
      />
    );
  };
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('DonationCard', () => {
  const mockDonation: DonationWithFoodItem = {
    id: 'test-donation-1',
    food_item_id: 'test-food-1',
    donor_id: 'test-donor-1',
    quantity: 5,
    unit: 'kg',
    status: 'available',
    pickup_slots: JSON.stringify([
      {
        start: '2024-12-01T10:00:00Z',
        end: '2024-12-01T18:00:00Z',
      },
    ]),
    pickup_time: '2024-12-01T10:00:00Z',
    instructions_for_driver: 'Please ring the doorbell',
    claimed_at: null,
    picked_up_at: null,
    receiver_id: null,
    created_at: '2024-12-01T08:00:00Z',
    updated_at: '2024-12-01T08:00:00Z',
    food_item: {
      id: 'test-food-1',
      name: 'Fresh Apples',
      description: 'Organic red apples from local farm',
      image_url: '/test-image.jpg',
      allergens: JSON.stringify(['none']),
      quantity: 5,
      unit: 'kg',
      food_type: 'fruit',
      user_id: 'test-user-1',
      donor_id: 'test-donor-1',
      created_at: '2024-12-01T08:00:00Z',
      updated_at: '2024-12-01T08:00:00Z',
    },
    donor: {
      id: 'test-donor-1',
      email: 'donor@example.com',
      role: 'food_donor',
      full_name: 'Test Donor',
      organization_name: 'Test Donor Organization',
      contact_number: '+1234567890',
      address: '123 Donor Street',
      city: 'Donor City',
      country: 'Test Country',
      postal_code: '12345',
      street_address: '123 Donor Street',
      created_at: '2024-12-01T08:00:00Z',
      updated_at: '2024-12-01T08:00:00Z',
    },
  };

  const defaultProps = {
    donation: mockDonation,
    donorName: 'Test Donor',
    pickupTime: '2024-12-01T18:00:00Z',
  };

  it('renders donation information correctly', () => {
    render(<DonationCard {...defaultProps} />);

    expect(screen.getByText('Fresh Apples')).toBeInTheDocument();
    expect(screen.getByText(/5kg/)).toBeInTheDocument();
    expect(screen.getByText(/from Test Donor/)).toBeInTheDocument();
  });

  it('displays correct pickup time formatting', () => {
    render(<DonationCard {...defaultProps} />);

    // Should format time correctly
    expect(screen.getByText(/Until \d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('handles missing food item gracefully', () => {
    const donationWithoutFoodItem = {
      ...mockDonation,
      food_item: undefined as any,
    };

    const { container } = render(
      <DonationCard donation={donationWithoutFoodItem} donorName="Test Donor" />
    );

    // Should return null and not render anything
    expect(container.firstChild).toBeNull();
  });

  it('shows placeholder image when image fails to load', () => {
    render(<DonationCard {...defaultProps} />);

    const image = screen.getByAltText('Fresh Apples');
    fireEvent.error(image);

    expect(screen.getByAltText('Placeholder image')).toBeInTheDocument();
  });

  it('handles null/undefined props correctly', () => {
    const minimalProps = {
      donation: {
        ...mockDonation,
        food_item: {
          ...mockDonation.food_item,
          image_url: null,
          description: null,
        },
      },
    };

    render(<DonationCard {...minimalProps} />);

    expect(screen.getByText('Fresh Apples')).toBeInTheDocument();
    expect(screen.getByText(/from Unknown Donor/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DonationCard {...defaultProps} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('navigates to detail page on click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<DonationCard {...defaultProps} />);

    const card = screen.getByRole('link');
    fireEvent.click(card);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Navigate to: /donate/detail/test-donation-1'
    );

    consoleSpy.mockRestore();
  });

  it('displays distance badge', () => {
    const donationWithDistance = {
      ...mockDonation,
      distance: '3.2km',
    };

    render(
      <DonationCard donation={donationWithDistance} donorName="Test Donor" />
    );

    expect(screen.getByText('3.2km')).toBeInTheDocument();
  });

  it('handles numeric quantity correctly', () => {
    const donationWithNumericQuantity = {
      ...mockDonation,
      quantity: 10,
    };

    render(
      <DonationCard
        donation={donationWithNumericQuantity}
        donorName="Test Donor"
      />
    );

    expect(screen.getByText(/10kg/)).toBeInTheDocument();
  });

  it('should be accessible', async () => {
    const { container } = render(<DonationCard {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper ARIA attributes', () => {
    render(<DonationCard {...defaultProps} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/donate/detail/test-donation-1');

    const image = screen.getByAltText('Fresh Apples');
    expect(image).toHaveAttribute('alt');
  });

  it('handles tomorrow pickup time formatting', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);

    const donationWithTomorrowPickup = {
      ...defaultProps,
      pickupTime: tomorrow.toISOString(),
    };

    render(<DonationCard {...donationWithTomorrowPickup} />);

    expect(screen.getByText(/Tomorrow until 18:00/)).toBeInTheDocument();
  });

  it('memoizes correctly to prevent unnecessary re-renders', () => {
    const { rerender } = render(<DonationCard {...defaultProps} />);

    const firstRender = screen.getByText('Fresh Apples');

    // Re-render with same props
    rerender(<DonationCard {...defaultProps} />);

    const secondRender = screen.getByText('Fresh Apples');

    // Should be the same element (React.memo working)
    expect(firstRender).toBe(secondRender);
  });
});
