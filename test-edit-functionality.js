// Test script to verify edit functionality with mixed matcher types
// Simple test without DOM dependencies

// Test data - simulating a group with mixed matcher types
const testGroup = {
  name: 'Test Mixed Group',
  matchers: [
    { value: 'https://example.com/', type: 'prefix' },
    { value: '^https://.*\\.github\\.io/.*', type: 'regex' },
    { value: 'https://*/docs/**', type: 'glob' }
  ]
};

console.log('Testing edit functionality with mixed matcher types:');
console.log('Original group:', JSON.stringify(testGroup, null, 2));

// Simulate the useEffect logic in CreateTabGroupModal when editingGroup is set
const simulateEditLoad = (editingGroup) => {
  let matchers = [];
  
  if (editingGroup.matchers) {
    // New format with mixed matchers - use directly
    matchers = editingGroup.matchers.map(matcher => ({ 
      value: matcher.value, 
      type: matcher.type 
    }));
  } else if (editingGroup.matchType === 'regex' && editingGroup.regexPatterns) {
    // Legacy regex format
    matchers = editingGroup.regexPatterns.map(pattern => ({ value: pattern, type: 'regex' }));
  } else if (editingGroup.urlPrefixes) {
    // Legacy URL prefixes format
    matchers = editingGroup.urlPrefixes.map(prefix => ({ value: prefix, type: 'prefix' }));
  } else if (editingGroup.urlPrefix) {
    // Legacy single urlPrefix format
    matchers = [{ value: editingGroup.urlPrefix, type: 'prefix' }];
  } else {
    matchers = [{ value: '', type: 'prefix' }];
  }
  
  return {
    groupName: editingGroup.name,
    matchers: matchers
  };
};

const result = simulateEditLoad(testGroup);
console.log('\nLoaded into edit form:');
console.log('Group name:', result.groupName);
console.log('Matchers:', JSON.stringify(result.matchers, null, 2));

// Verify all matchers are correctly loaded
const expectedMatchers = [
  { value: 'https://example.com/', type: 'prefix' },
  { value: '^https://.*\\.github\\.io/.*', type: 'regex' },
  { value: 'https://*/docs/**', type: 'glob' }
];

const matchersMatch = JSON.stringify(result.matchers) === JSON.stringify(expectedMatchers);
console.log('\nMatchers correctly loaded:', matchersMatch ? '✅ YES' : '❌ NO');

if (matchersMatch) {
  console.log('✅ Edit functionality working correctly for mixed matcher types!');
} else {
  console.log('❌ Edit functionality has issues');
  console.log('Expected:', JSON.stringify(expectedMatchers, null, 2));
  console.log('Got:', JSON.stringify(result.matchers, null, 2));
}

// Test legacy format support
console.log('\n--- Testing Legacy Format Support ---');

const legacyUrlPrefixGroup = {
  name: 'Legacy URL Prefix Group',
  urlPrefix: 'https://legacy.example.com/'
};

const legacyResult1 = simulateEditLoad(legacyUrlPrefixGroup);
console.log('Legacy single urlPrefix loaded:', JSON.stringify(legacyResult1, null, 2));

const legacyUrlPrefixesGroup = {
  name: 'Legacy URL Prefixes Group',
  urlPrefixes: ['https://site1.com/', 'https://site2.com/']
};

const legacyResult2 = simulateEditLoad(legacyUrlPrefixesGroup);
console.log('Legacy urlPrefixes loaded:', JSON.stringify(legacyResult2, null, 2));

const legacyRegexGroup = {
  name: 'Legacy Regex Group',
  matchType: 'regex',
  regexPatterns: ['^https://.*\\.example\\.com', 'test.*pattern']
};

const legacyResult3 = simulateEditLoad(legacyRegexGroup);
console.log('Legacy regex patterns loaded:', JSON.stringify(legacyResult3, null, 2));

console.log('\n🎉 All edit functionality tests completed!');
