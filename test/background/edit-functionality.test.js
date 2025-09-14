/** */
const simulateEditLoad = (editingGroup) => {
  const getMatchers = () => {
    if (editingGroup.matchers) {
      return editingGroup.matchers.map(matcher => ({ 
        value: matcher.value, 
        type: matcher.type 
      }));
    }
    
    if (editingGroup.matchType === 'regex' && editingGroup.regexPatterns) {
      return editingGroup.regexPatterns.map(pattern => ({ 
        value: pattern, 
        type: 'regex' 
      }));
    }
    
    const urlPrefixes = editingGroup.urlPrefixes || (editingGroup.urlPrefix ? [editingGroup.urlPrefix] : null);
    if (urlPrefixes) {
      return urlPrefixes.map(prefix => ({ 
        value: prefix, 
        type: 'prefix' 
      }));
    }
    
    // Default fallback
    return [{ value: '', type: 'prefix' }];
  };
  
  return {
    groupName: editingGroup.name,
    matchers: getMatchers()
  };
};

/** */
const simulateFormValidation = (groupName, matchers) => {
  const validMatchers = matchers.filter(matcher => matcher.value && matcher.value.trim());      

  if (!groupName || !groupName.trim() || validMatchers.length === 0) {
    return { 
      valid: false, 
      error: 'Please provide a group name and at least one matcher' 
    };
  }    

  /* Test regex patterns */
  const regexMatchers = validMatchers.filter(matcher => matcher.type === 'regex');
  for (const matcher of regexMatchers) {
    try {
      new RegExp(matcher.value);
    } catch (error) {
      return { 
        valid: false, 
        error: `Invalid regex pattern "${matcher.value}": ${error.message}` 
      };
    }
  }   

  return { valid: true, validMatchers };
};

test('loads group with mixed matcher types correctly', () => {
  const testGroup = {
    name: 'Test Mixed Group',
    matchers: [
      { value: 'https://example.com/', type: 'prefix' },
      { value: '^https://.*\\.github\\.io/.*', type: 'regex' },
      { value: 'https://*/docs/**', type: 'glob' }
    ]
  };

  const result = simulateEditLoad(testGroup);

  expect(result.groupName).toBe('Test Mixed Group');
  expect(result.matchers).toEqual([
    { value: 'https://example.com/', type: 'prefix' },
    { value: '^https://.*\\.github\\.io/.*', type: 'regex' },
    { value: 'https://*/docs/**', type: 'glob' }
  ]);
});

test('preserves matcher order when loading', () => {
  const testGroup = {
    name: 'Order Test Group',
    matchers: [
      { value: 'third', type: 'glob' },
      { value: 'first', type: 'prefix' },
      { value: 'second', type: 'regex' }
    ]
  };

  const result = simulateEditLoad(testGroup);

  expect(result.matchers).toEqual([
    { value: 'third', type: 'glob' },
    { value: 'first', type: 'prefix' },
    { value: 'second', type: 'regex' }
  ]);
});

test('handles empty matchers array', () => {
  const testGroup = {
    name: 'Empty Group',
    matchers: []
  };

  const result = simulateEditLoad(testGroup);

  expect(result.groupName).toBe('Empty Group');
  expect(result.matchers).toEqual([]);
});

test('loads single urlPrefix format', () => {
  const oldGroup = {
    name: 'Single URL Prefix Group',
    urlPrefix: 'https://example.com/'
  };

  const result = simulateEditLoad(oldGroup);

  expect(result.groupName).toBe('Single URL Prefix Group');
  expect(result.matchers).toEqual([
    { value: 'https://example.com/', type: 'prefix' }
  ]);
});

test('loads multiple urlPrefixes array format', () => {
  const oldGroup = {
    name: 'Multiple URL Prefixes Group',
    urlPrefixes: ['https://site1.com/', 'https://site2.com/']
  };

  const result = simulateEditLoad(oldGroup);

  expect(result.groupName).toBe('Multiple URL Prefixes Group');
  expect(result.matchers).toEqual([
    { value: 'https://site1.com/', type: 'prefix' },
    { value: 'https://site2.com/', type: 'prefix' }
  ]);
});

test('loads regex patterns format', () => {
  const regexGroup = {
    name: 'Regex Group',
    matchType: 'regex',
    regexPatterns: ['^https://.*\\.example\\.com', 'test.*pattern']
  };

  const result = simulateEditLoad(regexGroup);

  expect(result.groupName).toBe('Regex Group');
  expect(result.matchers).toEqual([
    { value: '^https://.*\\.example\\.com', type: 'regex' },
    { value: 'test.*pattern', type: 'regex' }
  ]);
});

test('handles empty backwards compatible formats', () => {
  const emptyGroup = {
    name: 'Empty Group',
    urlPrefixes: []
  };

  const result = simulateEditLoad(emptyGroup);

  expect(result.groupName).toBe('Empty Group');
  expect(result.matchers).toEqual([]);
});

test('provides default matcher for completely empty group', () => {
  const emptyGroup = {
    name: 'Completely Empty Group'
  };

  const result = simulateEditLoad(emptyGroup);
  
  expect(result.groupName).toBe('Completely Empty Group');
  expect(result.matchers).toEqual([
    { value: '', type: 'prefix' }
  ]);
});

test('prioritizes current matchers format over older formats', () => {
  const mixedGroup = {
    name: 'Mixed Format Group',
    matchers: [{ value: 'https://current.com/', type: 'prefix' }],
    urlPrefixes: ['https://old.com/'], // Should be ignored
    urlPrefix: 'https://older.com/' // Should be ignored
  };

  const result = simulateEditLoad(mixedGroup);

  expect(result.matchers).toEqual([
    { value: 'https://current.com/', type: 'prefix' }
  ]);
});

test('prioritizes regex patterns over URL prefixes', () => {
  const mixedGroup = {
    name: 'Mixed Format Group',
    matchType: 'regex',
    regexPatterns: ['^https://regex\\.com'],
    urlPrefixes: ['https://prefix.com/'] // Should be ignored
  };

  const result = simulateEditLoad(mixedGroup);

  expect(result.matchers).toEqual([
    { value: '^https://regex\\.com', type: 'regex' }
  ]);
});

test('prioritizes array urlPrefixes over single urlPrefix', () => {
  const mixedGroup = {
    name: 'Mixed Format Group',
    urlPrefixes: ['https://array.com/'],
    urlPrefix: 'https://single.com/' // Should be ignored
  };

  const result = simulateEditLoad(mixedGroup);

  expect(result.matchers).toEqual([
    { value: 'https://array.com/', type: 'prefix' }
  ]);
});

test('handles null/undefined group', () => {
  expect(() => simulateEditLoad(null)).toThrow();
  expect(() => simulateEditLoad(undefined)).toThrow();
});

test('handles group with null name', () => {
  const group = {
    name: null,
    matchers: [{ value: 'test', type: 'prefix' }]
  };

  const result = simulateEditLoad(group);

  expect(result.groupName).toBe(null);
  expect(result.matchers).toEqual([{ value: 'test', type: 'prefix' }]);
});

test('handles matchers with missing properties', () => {
  const group = {
    name: 'Malformed Group',
    matchers: [
      { value: 'test' }, // Missing type
      { type: 'prefix' }, // Missing value
      {} // Missing both
    ]
  };

  const result = simulateEditLoad(group);

  expect(result.matchers).toEqual([
    { value: 'test', type: undefined },
    { value: undefined, type: 'prefix' },
    { value: undefined, type: undefined }
  ]);
});

test('validates complete form correctly', () => {
  const result = simulateFormValidation('Test Group', [
    { value: 'https://example.com/', type: 'prefix' },
    { value: '^https://.*\\.test\\.com', type: 'regex' }
  ]);

  expect(result.valid).toBe(true);
  expect(result.validMatchers).toHaveLength(2);}
);
  
test('rejects empty group name', () => {
  
  const result = simulateFormValidation('', [
    { value: 'https://example.com/', type: 'prefix' }
  ]);
  
  expect(result.valid).toBe(false);
  expect(result.error).toBe('Please provide a group name and at least one matcher');}
);
  
test('rejects form with no valid matchers', () => {
  const result = simulateFormValidation('Test Group', [
    { value: '', type: 'prefix' },
    { value: '   ', type: 'prefix' }
  ]);
  
  expect(result.valid).toBe(false);
  expect(result.error).toBe('Please provide a group name and at least one matcher');}
);
  
test('validates regex patterns', () => {
  const result = simulateFormValidation('Test Group', [
    { value: '[invalid regex', type: 'regex' }
  ]);

  expect(result.valid).toBe(false);
  expect(result.error).toContain('Invalid regex pattern');}
);
  
test('filters out empty matchers but keeps valid ones', () => {
  const result = simulateFormValidation('Test Group', [
    { value: 'https://valid.com/', type: 'prefix' },
    { value: '', type: 'prefix' },
    { value: '   ', type: 'prefix' },
    { value: 'https://another.com/', type: 'prefix' }
  ]);

  expect(result.valid).toBe(true);
  expect(result.validMatchers).toHaveLength(2);
  expect(result.validMatchers.map(m => m.value)).toEqual([
    'https://valid.com/',
    'https://another.com/'
  ]);
});
