#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Comprehensive template literal fix...\n');

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

  // Remove ALL {t('...')} patterns that are not in JSX contexts
  // This is a nuclear approach to fix all template literal issues

  // 1. Fix array element issues: [{t('key')}] -> ['value']
  const arrayMatches = modifiedContent.match(/\[\{t\([^}]+\)\}/g);
  if (arrayMatches) {
    arrayMatches.forEach(match => {
      // Convert {t('pages.dashboard.january')} -> 'January'
      const keyMatch = match.match(/t\('([^']+)'\)/);
      if (keyMatch) {
        const key = keyMatch[1];
        const lastPart = key.split('.').pop();
        const capitalizedValue = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
        modifiedContent = modifiedContent.replace(match, `['${capitalizedValue}'`);
        fileReplacements++;
      }
    });
  }

  // 2. Fix remaining {t('...')} in arrays: , {t('key')} -> , 'value'
  const remainingArrayMatches = modifiedContent.match(/,\s*\{t\([^}]+\)\}/g);
  if (remainingArrayMatches) {
    remainingArrayMatches.forEach(match => {
      const keyMatch = match.match(/t\('([^']+)'\)/);
      if (keyMatch) {
        const key = keyMatch[1];
        const lastPart = key.split('.').pop();
        const capitalizedValue = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
        modifiedContent = modifiedContent.replace(match, `, '${capitalizedValue}'`);
        fileReplacements++;
      }
    });
  }

  // 3. Fix object property issues: key: {t('...')} -> key: 'value'
  const objectMatches = modifiedContent.match(/:\s*\{t\([^}]+\)\}/g);
  if (objectMatches) {
    objectMatches.forEach(match => {
      const keyMatch = match.match(/t\('([^']+)'\)/);
      if (keyMatch) {
        const key = keyMatch[1];
        const lastPart = key.split('.').pop();
        let value = lastPart;
        
        // Special mappings for common keys
        if (key.includes('milk')) value = 'Milk';
        else if (key.includes('user')) value = 'User';
        else if (key.includes('january')) value = 'January';
        else if (key.includes('february')) value = 'February';
        else if (key.includes('march')) value = 'March';
        else if (key.includes('april')) value = 'April';
        else if (key.includes('may')) value = 'May';
        else if (key.includes('june')) value = 'June';
        else if (key.includes('july')) value = 'July';
        else if (key.includes('august')) value = 'August';
        else if (key.includes('september')) value = 'September';
        else if (key.includes('october')) value = 'October';
        else if (key.includes('november')) value = 'November';
        else if (key.includes('december')) value = 'December';
        else if (key.includes('error')) value = 'error';
        else if (key.includes('tables')) value = 'Tables';
        else if (key.includes('enums')) value = 'Enums';
        else if (key.includes('row')) value = 'Row';
        else value = value.charAt(0).toUpperCase() + value.slice(1);
        
        modifiedContent = modifiedContent.replace(match, `: '${value}'`);
        fileReplacements++;
      }
    });
  }

  // 4. Fix function parameter issues: func({t('...')}) -> func('value')
  const funcMatches = modifiedContent.match(/\(\{t\([^}]+\)\}/g);
  if (funcMatches) {
    funcMatches.forEach(match => {
      const keyMatch = match.match(/t\('([^']+)'\)/);
      if (keyMatch) {
        const key = keyMatch[1];
        const lastPart = key.split('.').pop();
        const value = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
        modifiedContent = modifiedContent.replace(match, `('${value}'`);
        fileReplacements++;
      }
    });
  }

  // 5. Fix assignment issues: var = {t('...')} -> var = 'value'
  const assignmentMatches = modifiedContent.match(/=\s*\{t\([^}]+\)\}/g);
  if (assignmentMatches) {
    assignmentMatches.forEach(match => {
      const keyMatch = match.match(/t\('([^']+)'\)/);
      if (keyMatch) {
        const key = keyMatch[1];
        const lastPart = key.split('.').pop();
        const value = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
        modifiedContent = modifiedContent.replace(match, ` = '${value}'`);
        fileReplacements++;
      }
    });
  }

  // 6. Fix || operator issues: || {t('...')} -> || 'value'
  const orMatches = modifiedContent.match(/\|\|\s*\{t\([^}]+\)\}/g);
  if (orMatches) {
    orMatches.forEach(match => {
      const keyMatch = match.match(/t\('([^']+)'\)/);
      if (keyMatch) {
        const key = keyMatch[1];
        const lastPart = key.split('.').pop();
        const value = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
        modifiedContent = modifiedContent.replace(match, ` || '${value}'`);
        fileReplacements++;
      }
    });
  }

  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, modifiedContent);
    console.log(`✅ Fixed ${fileReplacements} issues in ${path.relative('/Users/rhiday/Desktop/Zipli/zipli v3', filePath)}`);
    totalReplacements += fileReplacements;
    filesModified++;
  }
});

console.log(`\n🎉 Comprehensive template fix completed!`);
console.log(`📊 Fixed ${totalReplacements} template literal issues in ${filesModified} files\n`);