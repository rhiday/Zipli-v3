
import { render, screen } from '@testing-library/react';
import { PrimaryButton } from '@/components/ui-kit';

describe('PrimaryButton', () => {
  it('renders correctly', () => {
    render(<PrimaryButton>Test Button</PrimaryButton>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });
});
