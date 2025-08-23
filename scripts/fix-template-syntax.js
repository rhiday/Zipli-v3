#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Starting template literal syntax fix...\n');

// Patterns to fix: {t('key')} should be t('key') in non-JSX contexts
const fixPatterns = [
  // Object property values: displayName = {t('key')} -> displayName = t('key')
  {
    pattern: /(\w+)\s*=\s*\{t\(([^}]+)\)\}/g,
    replacement: '$1 = t($2)',
    description: 'Object property assignments'
  },
  
  // Function parameters and object values: {t('key')} -> t('key')
  {
    pattern: /:\s*\{t\(([^}]+)\)\}/g,
    replacement: ': t($1)',
    description: 'Object property values'
  },
  
  // Console.log and function call parameters
  {
    pattern: /console\.(log|error|warn)\(\{t\(([^}]+)\)\}/g,
    replacement: 'console.$1(t($2)',
    description: 'Console statements'
  },
  
  // Array elements
  {
    pattern: /,\s*\{t\(([^}]+)\)\}/g,
    replacement: ', t($1)',
    description: 'Array elements'
  },
  
  // Function parameters in parentheses
  {
    pattern: /\(\{t\(([^}]+)\)\}/g,
    replacement: '(t($1)',
    description: 'Function parameters'
  }
];

// Get all TypeScript/JavaScript files
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', { 
  cwd: '/Users/rhiday/Desktop/Zipli/zipli v3',
  absolute: true 
});

let totalReplacements = 0;
let filesModified = 0;

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let fileReplacements = 0;

  fixPatterns.forEach(({ pattern, replacement, description }) => {
    const matches = modifiedContent.match(pattern);
    if (matches) {
      modifiedContent = modifiedContent.replace(pattern, replacement);
      fileReplacements += matches.length;
    }
  });

  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, modifiedContent);
    console.log(`✅ Fixed ${fileReplacements} issues in ${path.relative('/Users/rhiday/Desktop/Zipli/zipli v3', filePath)}`);
    totalReplacements += fileReplacements;
    filesModified++;
  }
});

console.log(`\n🎉 Template syntax fix completed!`);
console.log(`📊 Fixed ${totalReplacements} syntax issues in ${filesModified} files\n`);