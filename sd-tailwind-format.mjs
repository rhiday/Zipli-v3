import StyleDictionary from 'style-dictionary';

export function registerTailwindColorFormat() {
  StyleDictionary.registerFormat({
    name: 'tailwind/colors',
    formatter: function({ dictionary }) {
      const colors = {};
      dictionary.allProperties.forEach(token => {
        if (token.attributes && token.attributes.category === 'color') {
          // Flatten token name, e.g. zipli-brand-primary-black -> primary_black
          const name = token.name.replace(/^zipli-brand-/, '').replace(/-/g, '_');
          colors[name] = token.value.replace(/ff$/, ''); // Remove alpha if present
        }
      });
      return `module.exports = ${JSON.stringify(colors, null, 2)};`;
    }
  });
} 