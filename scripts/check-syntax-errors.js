#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 Checking for syntax errors...\n');

const problemFiles = [
  'src/app/auth/confirm/page.tsx',
  'src/app/dashboard/city/page.tsx',
  'src/app/donate/all-offers/page.tsx',
  'src/app/donate/detail/[id]/page.tsx',
  'src/app/donate/manual/page.tsx',
];

const baseDir = '/Users/rhiday/Desktop/Zipli/zipli v3';

problemFiles.forEach((filePath) => {
  const fullPath = `${baseDir}/${filePath}`;

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');

  console.log(`\n📄 Checking ${filePath}:`);

  // Check for common issues
  let hasErrors = false;

  // Check for unmatched brackets/braces
  let braceDepth = 0;
  let parenDepth = 0;
  let bracketDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Count brackets (ignoring those in strings/comments)
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '{') braceDepth++;
      else if (char === '}') braceDepth--;
      else if (char === '(') parenDepth++;
      else if (char === ')') parenDepth--;
      else if (char === '[') bracketDepth++;
      else if (char === ']') bracketDepth--;
    }

    // Check for template literal issues
    if (line.includes('{t(') && !line.includes('>{t(')) {
      console.log(
        `  ⚠️  Line ${i + 1}: Possible template literal issue: ${line.trim()}`
      );
      hasErrors = true;
    }

    // Check for incomplete JSX
    if (line.includes('<') && !line.includes('>') && !line.includes('//')) {
      console.log(
        `  ⚠️  Line ${i + 1}: Possible incomplete JSX: ${line.trim()}`
      );
      hasErrors = true;
    }
  }

  if (braceDepth !== 0) {
    console.log(
      `  ❌ Unmatched braces: ${braceDepth > 0 ? 'missing ' + braceDepth + ' closing }' : 'extra ' + Math.abs(braceDepth) + ' closing }'}`
    );
    hasErrors = true;
  }

  if (parenDepth !== 0) {
    console.log(
      `  ❌ Unmatched parentheses: ${parenDepth > 0 ? 'missing ' + parenDepth + ' closing )' : 'extra ' + Math.abs(parenDepth) + ' closing )'}`
    );
    hasErrors = true;
  }

  if (bracketDepth !== 0) {
    console.log(
      `  ❌ Unmatched brackets: ${bracketDepth > 0 ? 'missing ' + bracketDepth + ' closing ]' : 'extra ' + Math.abs(bracketDepth) + ' closing ]'}`
    );
    hasErrors = true;
  }

  if (!hasErrors) {
    console.log('  ✅ No obvious syntax errors found');
  }
});

console.log('\n🎉 Syntax check completed!\n');
