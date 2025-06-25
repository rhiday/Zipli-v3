// 🚨 Snapshot test to freeze the ItemPreview UI layout. If this test fails, review any UI changes carefully before updating the snapshot.
import React from 'react';
import { render } from '@testing-library/react';
import { ItemPreview } from '../src/components/ui/ItemPreview';

describe('ItemPreview UI', () => {
  it('renders the ItemPreview with mock data and matches the snapshot', () => {
    const { container } = render(
      <ItemPreview
        name="Test Food"
        quantity="2 kg"
        description="A tasty test item"
        imageUrl="/images/placeholder.svg"
        allergens={["Milk", "Eggs"]}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });
}); 