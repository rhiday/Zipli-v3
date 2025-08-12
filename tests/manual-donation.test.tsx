// 🚨 Snapshot test to freeze the manual donation UI layout. If this test fails, review any UI changes carefully before updating the snapshot.
import React from 'react';
import { render } from '@testing-library/react';
import ManualDonationPage from '../src/app/donate/manual/page';

describe('ManualDonationPage UI', () => {
  it('renders the manual donation UI and matches the snapshot', () => {
    const { container } = render(<ManualDonationPage />);
    expect(container).toMatchSnapshot();
  });
}); 