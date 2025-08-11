// 🚨 Snapshot test to freeze the PickupSlotPage UI layout. If this test fails, review any UI changes carefully before updating the snapshot.
import React from 'react';
import { render } from '@testing-library/react';
import PickupSlotPage from '../src/app/donate/pickup-slot/page';
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

describe('PickupSlotPage UI', () => {
  it('renders the pickup slot UI and matches the snapshot', () => {
    const { container } = render(<PickupSlotPage />);
    expect(container).toMatchSnapshot();
  });
});
