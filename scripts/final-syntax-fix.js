#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Final syntax fix...\n');

// Files and their specific fixes
const filesToFix = [
  {
    path: 'src/app/api/process-request-details/route.ts',
    fixes: [
      {
        from: /console\.error\(t\([^)]+\), "Raw" content:', content\);/g,
        to: 'console.error("Error parsing OpenAI JSON response. Raw content:", content);'
      }
    ]
  },
  {
    path: 'src/app/auth/callback/page.tsx',
    fixes: [
      {
        from: /const role = profile\.role as Database\['public'\]\[\{t\('pages\.auth\.enums'\)\}\]\['user_role'\];/g,
        to: "const role = profile.role as Database['public']['Enums']['user_role'];"
      }
    ]
  },
  {
    path: 'src/app/dashboard/city/page.tsx',
    fixes: [
      {
        from: /\{ name: t\('pages\.dashboard\.alice'\)s Restaurant", donations: 32, category: t\('pages\.dashboard\.restaurant'\) \},/g,
        to: '{ name: "Alice\'s Restaurant", donations: 32, category: "Restaurant" },'
      }
    ]
  },
  {
    path: 'src/app/donate/all-offers/page.tsx',
    fixes: [
      {
        from: /type RequestItem = Database\['public'\]\[\{t\('pages\.donations\.tables'\)\}\]\['requests'\]\[\{t\('pages\.donations\.row'\)\}\] & \{/g,
        to: "type RequestItem = Database['public']['Tables']['requests']['Row'] & {"
      }
    ]
  }
];

const baseDir = '/Users/rhiday/Desktop/Zipli/zipli v3';

filesToFix.forEach(({ path: filePath, fixes }) => {
  const fullPath = `${baseDir}/${filePath}`;
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  fixes.forEach(({ from, to }) => {
    if (content.match(from)) {
      content = content.replace(from, to);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed ${filePath}`);
  }
});

console.log('\n🎉 Final syntax fix completed!\n');