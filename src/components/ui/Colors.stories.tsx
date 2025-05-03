import type { Meta } from '@storybook/react';

const meta: Meta = {
  title: 'Tokens/Colors',
};
export default meta;

const colors = [
  { name: 'primary', className: 'bg-primary text-white' },
  { name: 'primary-75', className: 'bg-primary-75 text-white' },
  { name: 'primary-50', className: 'bg-primary-50 text-white' },
  { name: 'cream', className: 'bg-cream text-primary' },
  { name: 'cloud', className: 'bg-cloud text-primary' },
  { name: 'lime', className: 'bg-lime text-primary' },
  { name: 'rose', className: 'bg-rose text-white' },
  { name: 'negative', className: 'bg-negative text-white' },
  { name: 'negative-hover', className: 'bg-negative-hover text-white' },
  { name: 'border', className: 'bg-border text-primary' },
  { name: 'inactive', className: 'bg-inactive text-primary' },
];

export const Palette = () => (
  <div className="flex flex-wrap gap-4">
    {colors.map((color) => (
      <div key={color.name} className={`w-24 h-16 flex flex-col items-center justify-center rounded-md shadow ${color.className}`}> 
        <span className="text-xs font-mono">{color.name}</span>
      </div>
    ))}
  </div>
); 