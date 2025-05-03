import type { Meta } from '@storybook/react';

const meta: Meta = {
  title: 'Tokens/Spacing',
};
export default meta;

const spacings = [
  { name: 'p-2', className: 'p-2' },
  { name: 'p-4', className: 'p-4' },
  { name: 'p-6', className: 'p-6' },
  { name: 'm-2', className: 'm-2' },
  { name: 'm-4', className: 'm-4' },
  { name: 'gap-2', className: 'gap-2' },
  { name: 'gap-4', className: 'gap-4' },
];

export const SpacingBlocks = () => (
  <div className="flex flex-col gap-4">
    {spacings.map((space) => (
      <div key={space.name} className={`bg-cloud rounded shadow flex items-center ${space.className}`}> 
        <span className="text-xs font-mono p-2">{space.name}</span>
        <div className="bg-primary w-8 h-8 rounded" />
      </div>
    ))}
  </div>
); 