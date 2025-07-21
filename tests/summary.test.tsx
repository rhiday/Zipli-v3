// 🚨 Snapshot test to freeze the donation summary UI layout. If this test fails, review any UI changes carefully before updating the snapshot.
import React from 'react';
import { render } from '@testing-library/react';
import SummaryPage from '../src/app/donate/summary/page';

describe('SummaryPage UI', () => {
  it('renders the summary UI and matches the snapshot', () => {
    const { container } = render(<SummaryPage />);
    expect(container).toMatchSnapshot();
  });
}); 