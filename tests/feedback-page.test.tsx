import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock next/navigation router to avoid navigation errors
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Helper to mock language hook
const mockUseLanguage = (lang: 'en' | 'fi') => {
  jest.doMock('@/hooks/useLanguage', () => ({
    useLanguage: () => ({ language: lang }),
  }));
};

describe('Feedback Page layout and labels', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('renders category → comment → rating in English with updated copy', async () => {
    mockUseLanguage('en');
    const Page = (await import('@/app/feedback/page')).default as React.FC;
    const { container } = render(<Page />);

    const categoryLabel = screen.getByText("What's your feedback about?");
    const textLabel = screen.getByText('Tell us more');
    const ratingLabel = screen.getByText('How was it overall using the app?');

    // Ensure order: category before text before rating
    expect(
      categoryLabel.compareDocumentPosition(textLabel) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      textLabel.compareDocumentPosition(ratingLabel) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    // Open select and verify updated option labels are present
    const trigger = container.querySelector('[role="combobox"], button');
    if (trigger) fireEvent.click(trigger);
    // Options may render in a portal; just assert presence of labels
    expect(await screen.findByText('General feedback')).toBeInTheDocument();
    expect(screen.getByText('Development idea')).toBeInTheDocument();
    expect(screen.getByText('Bug in the application')).toBeInTheDocument();
  });

  it('renders Finnish labels with updated rating copy', async () => {
    mockUseLanguage('fi');
    const Page = (await import('@/app/feedback/page')).default as React.FC;
    const { container } = render(<Page />);

    expect(screen.getByText('Mitä palautteesi koskee?')).toBeInTheDocument();
    expect(
      screen.getByText('Miltä sovelluksen käyttäminen on yleisesti tuntunut?')
    ).toBeInTheDocument();

    const trigger = container.querySelector('[role="combobox"], button');
    if (trigger) fireEvent.click(trigger);
    expect(await screen.findByText('Yleinen palaute')).toBeInTheDocument();
    expect(screen.getByText('Kehitysidea')).toBeInTheDocument();
    expect(screen.getByText('Virhe sovelluksessa')).toBeInTheDocument();
  });
});
