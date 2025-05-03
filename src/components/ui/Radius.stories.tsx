import type { Meta } from '@storybook/react';

const meta: Meta = {
  title: 'Tokens/Radius',
};
export default meta;

const radii = [
  { name: 'rounded-none', className: 'rounded-none' },
  { name: 'rounded-sm', className: 'rounded-sm' },
  { name: 'rounded', className: 'rounded' },
  { name: 'rounded-md', className: 'rounded-md' },
  { name: 'rounded-lg', className: 'rounded-lg' },
  { name: 'rounded-full', className: 'rounded-full' },
];

export const RadiusBlocks = () => (
  <div className="flex flex-wrap gap-4">
    {radii.map((radius) => (
      <div key={radius.name} className={`bg-primary w-16 h-16 flex items-center justify-center text-white shadow ${radius.className}`}> 
        <span className="text-xs font-mono bg-white/20 px-1 rounded">{radius.name}</span>
      </div>
    ))}
  </div>
); 