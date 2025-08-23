#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing critical syntax errors for testing...\n');

// Critical fixes needed for compilation
const criticalFixes = [
  {
    file: 'src/app/auth/confirm/page.tsx',
    fixes: [
      { from: /\{t\('pages\.auth\.enter_6digit_code'\)\}/g, to: 'placeholder="Enter 6-digit code"' }
    ]
  },
  {
    file: 'src/app/donate/pickup-slot/page.tsx', 
    fixes: [
      { from: /\{t\('common\.actions\.edit'\)\}/g, to: 'aria-label="Edit"' }
    ]
  },
  {
    file: 'src/app/donate/recurring-form/page.tsx',
    fixes: [
      { from: /\{t\('pages\.donations\.recurring_donation'\)\}/g, to: 'title="Recurring Donation"' }
    ]
  },
  {
    file: 'src/app/donate/recurring-schedule/page.tsx',
    fixes: [
      { from: /\{t\('pages\.donations\.monday'\)\}/g, to: "'Monday'" },
      { from: /t\('pages\.donations\.tuesday'\)/g, to: "'Tuesday'" },
      { from: /t\('pages\.donations\.wednesday'\)/g, to: "'Wednesday'" },
      { from: /t\('pages\.donations\.thursday'\)/g, to: "'Thursday'" },
      { from: /t\('pages\.donations\.friday'\)/g, to: "'Friday'" },
      { from: /t\('pages\.donations\.saturday'\)/g, to: "'Saturday'" },
      { from: /t\('pages\.donations\.sunday'\)/g, to: "'Sunday'" },
      { from: /t\('pages\.donations\.tue'\)/g, to: "'Tue'" },
      { from: /t\('pages\.donations\.wed'\)/g, to: "'Wed'" },
      { from: /t\('pages\.donations\.thu'\)/g, to: "'Thu'" },
      { from: /t\('pages\.donations\.fri'\)/g, to: "'Fri'" },
      { from: /t\('pages\.donations\.sat'\)/g, to: "'Sat'" },
      { from: /t\('pages\.donations\.sun'\)/g, to: "'Sun'" }
    ]
  },
  {
    file: 'src/app/donate/schedule-simple/page.tsx',
    fixes: [
      { from: /\{t\('pages\.donations\.monday'\)\}/g, to: "'Monday'" },
      { from: /t\('pages\.donations\.\w+'\)/g, to: (match) => {
        const day = match.match(/\.(\w+)'/)[1];
        return `'${day.charAt(0).toUpperCase() + day.slice(1)}'`;
      }}
    ]
  },
  {
    file: 'src/app/donate/schedule/page.tsx',
    fixes: [
      { from: /return \{t\('pages\.donations\.schedule'\)\};/g, to: "return 'Schedule';" }
    ]
  },
  {
    file: 'src/app/donate/summary/page.tsx',
    fixes: [
      { from: /\{t\('pages\.donations\._error_creating_food_item'\)\}/g, to: "'Error creating food item'" }
    ]
  },
  {
    file: 'src/app/layout.tsx',
    fixes: [
      { from: /import ErrorBoundary from \{t\('common\.componentserrorboundary'\)\};/g, to: "import ErrorBoundary from '@/components/ErrorBoundary';" }
    ]
  },
  {
    file: 'src/app/profile/page.tsx',
    fixes: [
      { from: /<Button type = 'Submit_disabledsaving_classnam'flex-1">/g, to: '<Button type="submit" disabled={saving} className="flex-1">' }
    ]
  },
  {
    file: 'src/lib/component-utils.ts',
    fixes: [
      { from: /state: t\('common\.default_error'\) \| 'success'/g, to: "state: 'default' | 'error' | 'success'" }
    ]
  },
  {
    file: 'src/lib/mockData.ts',
    fixes: [
      { from: /t\('common\.alice'\)s Kitchen"/g, to: "'Alice\\'s Kitchen'" }
    ]
  },
  {
    file: 'src/lib/monitoring.ts',
    fixes: [
      { from: /type: t\('common\.status\.error'\) \| 'performance'/g, to: "type: 'error' | 'performance'" }
    ]
  },
  {
    file: 'src/lib/performance-monitor.ts',
    fixes: [
      { from: /if \(entry\.entryType == = 'Firstinput_processingstart' in entry\)/g, to: "if (entry.entryType === 'first-input' && 'processingStart' in entry)" }
    ]
  },
  {
    file: 'src/store/databaseStore.ts',
    fixes: [
      { from: /\{t\('common\.sample_organization'\)\}/g, to: "'Sample Organization'" }
    ]
  },
  {
    file: 'src/app/donate/manual/page.tsx',
    fixes: [
      { from: /placeholder = 'PlaceholderFoodName'/g, to: 'placeholder="Enter food name"' },
      { from: /placeholder = 'PlaceholderQuantity'/g, to: 'placeholder="Enter quantity"' },
      { from: /placeholder = 'SelectAllergens'/g, to: 'placeholder="Select allergens"' },
      { from: /placeholder = 'PlaceholderDescription'/g, to: 'placeholder="Enter description"' },
      { from: /label = 'AllergiesIntolerancesDiets'/g, to: 'label="Allergies, Intolerances & Diets"' },
      { from: /hint = 'PhotosHelpIdentify'/g, to: 'hint="Photos help identify your food donation"' },
      { from: /t\('pages\.donations\.peanuts'\)/g, to: "'Peanuts'" },
      { from: /t\('pages\.donations\.wheat'\)/g, to: "'Wheat'" },
      { from: /t\('pages\.donations\.soybeans'\)/g, to: "'Soybeans'" }
    ]
  }
];

const baseDir = '/Users/rhiday/Desktop/Zipli/zipli v3';
let totalFixed = 0;

criticalFixes.forEach(({ file, fixes }) => {
  const fullPath = path.join(baseDir, file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let fileFixed = 0;

  fixes.forEach(({ from, to }) => {
    if (typeof to === 'function') {
      const newContent = content.replace(from, to);
      if (newContent !== content) {
        const matches = content.match(from) || [];
        fileFixed += matches.length;
        content = newContent;
      }
    } else {
      const matches = content.match(from);
      if (matches) {
        content = content.replace(from, to);
        fileFixed += matches.length;
      }
    }
  });

  if (fileFixed > 0) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed ${fileFixed} critical issues in ${file}`);
    totalFixed += fileFixed;
  }
});

console.log(`\n🎉 Fixed ${totalFixed} critical syntax errors!\n`);