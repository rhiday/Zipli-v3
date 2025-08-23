#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all remaining template literal issues...\n');

// Files that have template literal issues
const filesToFix = [
  {
    path: 'src/app/donate/all-offers/page.tsx',
    fixes: [
      {
        from: /const dateLabel = isDonation \? \{t\('pages\.donations\.offered'\)\} : t\('pages\.donations\.requested'\);/g,
        to: "const dateLabel = isDonation ? 'offered' : 'requested';"
      }
    ]
  },
  {
    path: 'src/app/donate/detail/[id]/page.tsx',
    fixes: [
      {
        from: /\{t\('goBack'\)\}/g,
        to: 'Go Back'
      },
      {
        from: /\{t\('common\.actions\.goBack'\)\}/g,
        to: 'Go Back'
      },
      {
        from: /<Trash2 className="h-5 w-5" \/> \{t\('removeListing'\)\}/g,
        to: '<Trash2 className="h-5 w-5" /> Remove Listing'
      },
      {
        from: /<Edit className="h-5 w-5" \/> \{t\('editListing'\)\}/g,
        to: '<Edit className="h-5 w-5" /> Edit Listing'
      },
      {
        from: /\{t\('removeListingConfirmation'\)\}/g,
        to: 'This will permanently remove the listing from public view. This action cannot be undone.'
      },
      {
        from: /\{t\('cancel'\)\}/g,
        to: 'Cancel'
      },
      {
        from: /\{t\('yesRemove'\)\}/g,
        to: 'Yes, Remove'
      },
      {
        from: /\{t\('requestThisDonation'\)\}/g,
        to: 'Request this donation'
      },
      {
        from: /\{totalDonations\} \{t\('donations'\)\}/g,
        to: '{totalDonations} donations'
      },
      {
        from: /\{t\('viewProfile'\)\}/g,
        to: 'View Profile'
      }
    ]
  },
  {
    path: 'src/app/donate/manual/page.tsx',
    fixes: [
      {
        from: /\/\/ Filter out \{t\('pages\.donations\.none'\)\} if other allergens are present/g,
        to: '// Filter out None if other allergens are present'
      },
      {
        from: /updated\.allergens = \['None'\]; \/\/ Default to \{t\('pages\.donations\.none'\)\} if no suggestions/g,
        to: "updated.allergens = ['None']; // Default to None if no suggestions"
      },
      {
        from: /\{t\('nameOfFood'\)\}/g,
        to: 'Name of Food'
      },
      {
        from: /\{t\('quantityKg'\)\}/g,
        to: 'Quantity (kg)'
      },
      {
        from: /\{t\('pages\.donations\.milk'\)\}, t\('pages\.donations\.eggs'\), t\('pages\.donations\.fish'\), t\('pages\.donations\.shellfish'\),/g,
        to: "'Milk', 'Eggs', 'Fish', 'Shellfish',"
      },
      {
        from: /\{t\('description'\)\}/g,
        to: 'Description'
      },
      {
        from: /\{t\('continue'\)\}/g,
        to: 'Continue'
      },
      {
        from: /\{t\('currentItemsInDonation'\)\}/g,
        to: 'Current Items in Donation'
      },
      {
        from: /\{t\('addAnotherItem'\)\}/g,
        to: 'Add Another Item'
      },
      {
        from: /\{t\('goBackToDashboard'\)\}/g,
        to: 'Go Back to Dashboard'
      }
    ]
  }
];

const baseDir = '/Users/rhiday/Desktop/Zipli/zipli v3';
let totalFixed = 0;

filesToFix.forEach(({ path: filePath, fixes }) => {
  const fullPath = `${baseDir}/${filePath}`;
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;
  let fileFixed = 0;

  fixes.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      changed = true;
      fileFixed += matches.length;
      totalFixed += matches.length;
    }
  });

  if (changed) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed ${fileFixed} template issues in ${filePath}`);
  }
});

console.log(`\n🎉 Fixed ${totalFixed} remaining template literal issues!\n`);