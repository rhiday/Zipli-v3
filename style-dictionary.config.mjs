const StyleDictionary = require('style-dictionary');

// Custom format for Tailwind colors
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

module.exports = {
  source: ['tokens/figma.tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'tokens/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
        },
      ],
      options: {
        outputReferences: true,
      },
    },
    tailwind: {
      transformGroup: 'js',
      buildPath: 'tokens/',
      files: [
        {
          destination: 'tailwind.colors.js',
          format: 'tailwind/colors',
        },
      ],
    },
  },
}; 