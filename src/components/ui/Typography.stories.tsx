import type { Meta } from '@storybook/react';

const meta: Meta = {
  title: 'Tokens/Typography',
};
export default meta;

export const Headings = () => (
  <div className="space-y-4">
    <h1 className="text-displayXs font-display">Display XS</h1>
    <h2 className="text-titleXs font-display">Title XS</h2>
    <h3 className="text-title font-display">Title</h3>
    <h4 className="text-body font-sans">Body</h4>
    <p className="text-caption">Caption</p>
    <p className="text-label">Label</p>
  </div>
);

export const BodyText = () => (
  <div className="space-y-2">
    <p className="text-body">Regular body text</p>
    <p className="text-label">Label text</p>
    <p className="text-caption">Caption text</p>
  </div>
); 