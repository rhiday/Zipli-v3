#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing remaining syntax errors...\n');

// Additional patterns to fix
const fixPatterns = [
  // Fix broken attribute syntax: placeholder = t('key') -> placeholder={t('key')}
  {
    pattern: /(\w+)\s*=\s*t\(([^)]+)\)(?!\s*[,;}])/g,
    replacement: '$1={t($2)}',
    description: 'JSX attribute syntax'
  },
  
  // Fix broken string interpolation: t('common.you')ll -> "You'll"
  {
    pattern: /t\('common\.you'\)ll receive/g,
    replacement: "You'll receive",
    description: 'Broken string interpolation'
  },
  
  // Fix broken console statements: console.error(t('key')Raw -> console.error(t('key'), 'Raw'
  {
    pattern: /console\.(log|error|warn)\(([^)]+)\)Raw/g,
    replacement: 'console.$1($2, "Raw"',
    description: 'Broken console statements'
  },
  
  // Fix status object values: status: {t('key')} -> status: 'error'
  {
    pattern: /status:\s*\{t\('common\.status\.error'\)\}/g,
    replacement: "status: 'error'",
    description: 'Status object values'
  },
  
  // Fix remaining {t('key')} in object contexts
  {
    pattern: /:\s*\{t\([^}]+\)\}/g,
    replacement: (match) => {
      // Extract the key and return a simple string
      const keyMatch = match.match(/t\('([^']+)'\)/);
      if (keyMatch) {
        const key = keyMatch[1];
        // Convert key to appropriate value
        if (key.includes('error')) return ": 'error'";
        if (key.includes('button')) return ": 'Button'";
        if (key.includes('input')) return ": 'Input'";
        if (key.includes('add')) return ": 'Add'";
        if (key.includes('edit')) return ": 'Edit'";
        if (key.includes('delete')) return ": 'Delete'";
        if (key.includes('save')) return ": 'Save'";
        if (key.includes('cancel')) return ": 'Cancel'";
        return `: '${key.split('.').pop()}'`;
      }
      return match;
    },
    description: 'Remaining object context translations'
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
  let content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let fileReplacements = 0;

  fixPatterns.forEach(({ pattern, replacement, description }) => {
    if (typeof replacement === 'function') {
      // Handle function replacements
      const newContent = modifiedContent.replace(pattern, replacement);
      if (newContent !== modifiedContent) {
        const matches = modifiedContent.match(pattern) || [];
        fileReplacements += matches.length;
        modifiedContent = newContent;
      }
    } else {
      // Handle string replacements
      const matches = modifiedContent.match(pattern);
      if (matches) {
        modifiedContent = modifiedContent.replace(pattern, replacement);
        fileReplacements += matches.length;
      }
    }
  });

  // Specific fixes for translation.ts
  if (filePath.includes('translations.ts')) {
    // Fix remaining template literal issues
    modifiedContent = modifiedContent.replace(/add: t\('common\.actions\.add'\),/g, "add: 'Add',");
    modifiedContent = modifiedContent.replace(/edit: t\('common\.actions\.edit'\),/g, "edit: 'Edit',");
    modifiedContent = modifiedContent.replace(/delete: t\('common\.actions\.delete'\),/g, "delete: 'Delete',");
  }

  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, modifiedContent);
    console.log(`✅ Fixed ${fileReplacements} issues in ${path.relative('/Users/rhiday/Desktop/Zipli/zipli v3', filePath)}`);
    totalReplacements += fileReplacements;
    filesModified++;
  }
});

console.log(`\n🎉 Additional syntax fix completed!`);
console.log(`📊 Fixed ${totalReplacements} syntax issues in ${filesModified} files\n`);