#!/usr/bin/env node

/**
 * COMPONENT AUDIT SCRIPT
 *
 * Analyzes current component usage to plan design system migration
 * Run: node scripts/audit-components.js
 */

const { execSync } = require('child_process');

console.log('🔍 Auditing Zipli components for design system migration...\n');

// Components to audit (most impactful first)
const componentsToAudit = [
  'Button',
  'button',
  'Input',
  'input',
  'Card',
  'TimeSlot',
  'Nav',
];

// Styling patterns to check
const stylingPatterns = [
  'bg-\\[#[a-fA-F0-9]+\\]', // Arbitrary colors
  'text-\\[#[a-fA-F0-9]+\\]',
  'w-\\[\\d+px\\]', // Arbitrary spacing
  'h-\\[\\d+px\\]',
  'p-\\[\\d+px\\]',
  'm-\\[\\d+px\\]',
  'rounded-\\[\\d+px\\]', // Arbitrary radius
  'bg-green-[0-9]+', // Non-design-system colors
  'bg-blue-[0-9]+',
  'bg-red-[0-9]+',
];

function runSearch(pattern, description) {
  try {
    const result = execSync(`rg "${pattern}" src --type tsx -c`, {
      encoding: 'utf8',
    });
    const matches = result
      .trim()
      .split('\n')
      .filter((line) => line.includes(':'));

    console.log(`📊 ${description}:`);
    if (matches.length > 0) {
      console.log(`   Found ${matches.length} files with violations`);
      matches.slice(0, 5).forEach((match) => {
        const [file, count] = match.split(':');
        console.log(`   • ${file}: ${count} occurrences`);
      });
      if (matches.length > 5) {
        console.log(`   • ... and ${matches.length - 5} more files`);
      }
    } else {
      console.log(`   ✅ No violations found`);
    }
    console.log('');

    return matches.length;
  } catch {
    console.log(`   ❌ Could not search for "${pattern}"`);
    console.log('');
    return 0;
  }
}

function auditComponents() {
  console.log('🧩 COMPONENT USAGE ANALYSIS\n');

  componentsToAudit.forEach((component) => {
    try {
      const result = execSync(`rg "${component}" src --type tsx -c`, {
        encoding: 'utf8',
      });
      const matches = result
        .trim()
        .split('\n')
        .filter((line) => line.includes(':'));

      console.log(`📦 ${component} component:`);
      console.log(`   Used in ${matches.length} files`);

      // Show top files by usage
      const sortedMatches = matches
        .map((line) => {
          const [file, count] = line.split(':');
          return { file, count: parseInt(count) };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      sortedMatches.forEach(({ file, count }) => {
        console.log(`   • ${file}: ${count} uses`);
      });
      console.log('');
    } catch {
      console.log(`   ❌ No usage found for ${component}\n`);
    }
  });
}

function auditStylingPatterns() {
  console.log('🎨 DESIGN SYSTEM VIOLATIONS\n');

  let totalViolations = 0;

  stylingPatterns.forEach((pattern) => {
    let description = '';

    if (pattern.includes('bg-\\[#'))
      description = 'Arbitrary background colors';
    else if (pattern.includes('text-\\[#'))
      description = 'Arbitrary text colors';
    else if (pattern.includes('w-\\[')) description = 'Arbitrary widths';
    else if (pattern.includes('h-\\[')) description = 'Arbitrary heights';
    else if (pattern.includes('p-\\[')) description = 'Arbitrary padding';
    else if (pattern.includes('m-\\[')) description = 'Arbitrary margins';
    else if (pattern.includes('rounded-\\['))
      description = 'Arbitrary border radius';
    else if (pattern.includes('bg-green'))
      description = 'Non-design-system green colors';
    else if (pattern.includes('bg-blue'))
      description = 'Non-design-system blue colors';
    else if (pattern.includes('bg-red'))
      description = 'Non-design-system red colors';

    const violations = runSearch(pattern, description);
    totalViolations += violations;
  });

  console.log(
    `📈 SUMMARY: Found ${totalViolations} total styling violations to fix\n`
  );
}

function generateMigrationPlan() {
  console.log('📋 RECOMMENDED MIGRATION ORDER\n');

  console.log('Phase 1 - High Impact (Week 1):');
  console.log('  1. Button component - Most reused, biggest visual impact');
  console.log('  2. Input components - Forms are critical user flows');
  console.log('  3. Card components - Layout consistency');
  console.log('');

  console.log('Phase 2 - Medium Impact (Week 2):');
  console.log('  4. Navigation components - User experience');
  console.log('  5. Layout containers - Page structure');
  console.log('');

  console.log('Phase 3 - Low Impact (Week 3-4):');
  console.log('  6. Content components - Visual polish');
  console.log('  7. Specialized components - Feature-specific');
  console.log('');

  console.log('🎯 Next Steps:');
  console.log('  1. Commit design system foundation tools');
  console.log('  2. Start with Button component migration');
  console.log('  3. Test thoroughly before moving to next component');
  console.log('  4. Update DESIGN_SYSTEM_ROLLOUT.md with progress');
  console.log('');
}

// Run the audit
auditComponents();
auditStylingPatterns();
generateMigrationPlan();

console.log('🚀 Ready to start design system migration!');
console.log('📖 See DESIGN_SYSTEM_ROLLOUT.md for detailed plan');
console.log('📋 See CLAUDE_INSTRUCTIONS.md for development rules');
