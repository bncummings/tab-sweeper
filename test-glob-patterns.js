// Test the glob functionality
console.log('Testing glob patterns...');

// Utility function to convert glob pattern to regex
const globToRegex = (globPattern) => {
  const escapedPattern = globPattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  
  return new RegExp(`^${escapedPattern}$`);
};

// Test cases
const testCases = [
  {
    pattern: 'https://*/docs/**',
    urls: [
      'https://react.dev/docs/getting-started',
      'https://vuejs.org/docs/guide',
      'https://angular.io/docs/tutorial',
      'https://example.com/api',  // Should not match
      'http://react.dev/docs/hooks'  // Should not match (http vs https)
    ],
    expectedMatches: 3
  },
  {
    pattern: 'https://github.com/*/issues/*',
    urls: [
      'https://github.com/facebook/react/issues/123',
      'https://github.com/vuejs/vue/issues/456',
      'https://github.com/facebook/react/pulls/789',  // Should not match
      'https://gitlab.com/user/repo/issues/111'  // Should not match
    ],
    expectedMatches: 2
  },
  {
    pattern: '*://localhost:*/**',
    urls: [
      'http://localhost:3000/app',
      'https://localhost:8080/admin',
      'http://localhost:5000/api/users',
      'https://example.com:3000/app'  // Should not match
    ],
    expectedMatches: 3
  }
];

// Run tests
testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: Pattern "${testCase.pattern}"`);
  const regex = globToRegex(testCase.pattern);
  console.log(`Converted to regex: ${regex}`);
  
  let matches = 0;
  testCase.urls.forEach(url => {
    const isMatch = regex.test(url);
    console.log(`  ${isMatch ? '✅' : '❌'} ${url}`);
    if (isMatch) matches++;
  });
  
  const passed = matches === testCase.expectedMatches;
  console.log(`Result: ${passed ? '✅ PASS' : '❌ FAIL'} (${matches}/${testCase.expectedMatches} matches)`);
});

console.log('\nGlob pattern testing complete!');
