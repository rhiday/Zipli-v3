// Simple test script to verify allergen conversion functions
// Run this in browser console or Node.js

// Test conversion functions
const allergenTextFromArray = (allergens) => {
  return allergens.length > 0 ? allergens.join(', ') : '';
};

const arrayFromAllergenText = (text) => {
  if (!text.trim()) return [];
  return text
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

// Test cases
const testCases = [
  {
    name: 'Single allergen',
    input: 'Gluten-free',
    expected: ['Gluten-free'],
  },
  {
    name: 'Multiple allergens with commas',
    input: 'Gluten-free, Lactose-free, Soy-free',
    expected: ['Gluten-free', 'Lactose-free', 'Soy-free'],
  },
  {
    name: 'Multiple allergens with newlines',
    input: 'Gluten-free\nLactose-free\nSoy-free',
    expected: ['Gluten-free', 'Lactose-free', 'Soy-free'],
  },
  {
    name: 'Mixed separators',
    input: 'Gluten-free,\nLactose-free, Soy-free',
    expected: ['Gluten-free', 'Lactose-free', 'Soy-free'],
  },
  {
    name: 'Extra whitespace',
    input: '  Gluten-free  ,  Lactose-free  ',
    expected: ['Gluten-free', 'Lactose-free'],
  },
  {
    name: 'Empty string',
    input: '',
    expected: [],
  },
  {
    name: 'Whitespace only',
    input: '   ',
    expected: [],
  },
  {
    name: 'Complex allergens',
    input: 'Contains nuts & dairy, Gluten-free (certified), No eggs',
    expected: ['Contains nuts & dairy', 'Gluten-free (certified)', 'No eggs'],
  },
];

// Run tests
console.log('🧪 Testing Allergen Conversion Functions');
console.log('=====================================');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = arrayFromAllergenText(testCase.input);
  const isEqual = JSON.stringify(result) === JSON.stringify(testCase.expected);

  console.log(`\nTest ${index + 1}: ${testCase.name}`);
  console.log(`Input: "${testCase.input}"`);
  console.log(`Expected: ${JSON.stringify(testCase.expected)}`);
  console.log(`Got: ${JSON.stringify(result)}`);
  console.log(`Result: ${isEqual ? '✅ PASS' : '❌ FAIL'}`);

  if (isEqual) {
    passed++;
  } else {
    failed++;
  }
});

// Test reverse conversion
console.log('\n🔄 Testing Reverse Conversion (Array to Text)');
console.log('=============================================');

const reverseTests = [
  {
    input: ['Gluten-free', 'Lactose-free'],
    expected: 'Gluten-free, Lactose-free',
  },
  {
    input: [],
    expected: '',
  },
  {
    input: ['Single allergen'],
    expected: 'Single allergen',
  },
];

reverseTests.forEach((testCase, index) => {
  const result = allergenTextFromArray(testCase.input);
  const isEqual = result === testCase.expected;

  console.log(`\nReverse Test ${index + 1}:`);
  console.log(`Input: ${JSON.stringify(testCase.input)}`);
  console.log(`Expected: "${testCase.expected}"`);
  console.log(`Got: "${result}"`);
  console.log(`Result: ${isEqual ? '✅ PASS' : '❌ FAIL'}`);

  if (isEqual) {
    passed++;
  } else {
    failed++;
  }
});

console.log('\n📊 Final Results');
console.log('================');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(
  `📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`
);

if (failed === 0) {
  console.log(
    '\n🎉 All tests passed! Conversion functions are working correctly.'
  );
} else {
  console.log('\n⚠️  Some tests failed. Please check the implementation.');
}
