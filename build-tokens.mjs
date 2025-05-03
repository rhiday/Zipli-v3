import StyleDictionary from 'style-dictionary';

// Register custom Tailwind color format
StyleDictionary.registerFormat({
  name: 'tailwind/colors',
  formatter({ dictionary }) {
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

const config = (await import('./style-dictionary.config.mjs')).default;

StyleDictionary.extend(config).buildAllPlatforms();
console.log('✅ Style Dictionary build complete (programmatic ESM)'); 