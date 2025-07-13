describe('Edit Group Functionality', () => {
  describe('useModalForm hook simulation', () => {
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
        matchers = editingGroup.regexPatterns.map(pattern => ({ 
          value: pattern, 
          type: 'regex' 
        }));
      } else if (editingGroup.urlPrefixes) {
        // Legacy URL prefixes format
        matchers = editingGroup.urlPrefixes.map(prefix => ({ 
          value: prefix, 
          type: 'prefix' 
        }));
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

    describe('Mixed Matcher Types', () => {
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
    });

    describe('Legacy Format Support', () => {
      test('loads legacy single urlPrefix format', () => {
        const legacyGroup = {
          name: 'Legacy URL Prefix Group',
          urlPrefix: 'https://legacy.example.com/'
        };

        const result = simulateEditLoad(legacyGroup);

        expect(result.groupName).toBe('Legacy URL Prefix Group');
        expect(result.matchers).toEqual([
          { value: 'https://legacy.example.com/', type: 'prefix' }
        ]);
      });

      test('loads legacy urlPrefixes array format', () => {
        const legacyGroup = {
          name: 'Legacy URL Prefixes Group',
          urlPrefixes: ['https://site1.com/', 'https://site2.com/']
        };

        const result = simulateEditLoad(legacyGroup);

        expect(result.groupName).toBe('Legacy URL Prefixes Group');
        expect(result.matchers).toEqual([
          { value: 'https://site1.com/', type: 'prefix' },
          { value: 'https://site2.com/', type: 'prefix' }
        ]);
      });

      test('loads legacy regex patterns format', () => {
        const legacyGroup = {
          name: 'Legacy Regex Group',
          matchType: 'regex',
          regexPatterns: ['^https://.*\\.example\\.com', 'test.*pattern']
        };

        const result = simulateEditLoad(legacyGroup);

        expect(result.groupName).toBe('Legacy Regex Group');
        expect(result.matchers).toEqual([
          { value: '^https://.*\\.example\\.com', type: 'regex' },
          { value: 'test.*pattern', type: 'regex' }
        ]);
      });

      test('handles empty legacy formats', () => {
        const legacyGroup = {
          name: 'Empty Legacy Group',
          urlPrefixes: []
        };

        const result = simulateEditLoad(legacyGroup);

        expect(result.groupName).toBe('Empty Legacy Group');
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
    });

    describe('Format Priority', () => {
      test('prioritizes matchers over legacy formats', () => {
        const mixedGroup = {
          name: 'Mixed Format Group',
          matchers: [{ value: 'https://new.com/', type: 'prefix' }],
          urlPrefixes: ['https://old.com/'], // Should be ignored
          urlPrefix: 'https://legacy.com/' // Should be ignored
        };

        const result = simulateEditLoad(mixedGroup);

        expect(result.matchers).toEqual([
          { value: 'https://new.com/', type: 'prefix' }
        ]);
      });

      test('prioritizes regex patterns over urlPrefixes', () => {
        const mixedGroup = {
          name: 'Mixed Legacy Group',
          matchType: 'regex',
          regexPatterns: ['^https://regex\\.com'],
          urlPrefixes: ['https://prefix.com/'] // Should be ignored
        };

        const result = simulateEditLoad(mixedGroup);

        expect(result.matchers).toEqual([
          { value: '^https://regex\\.com', type: 'regex' }
        ]);
      });

      test('prioritizes urlPrefixes over single urlPrefix', () => {
        const mixedGroup = {
          name: 'Mixed Legacy Group',
          urlPrefixes: ['https://prefixes.com/'],
          urlPrefix: 'https://single.com/' // Should be ignored
        };

        const result = simulateEditLoad(mixedGroup);

        expect(result.matchers).toEqual([
          { value: 'https://prefixes.com/', type: 'prefix' }
        ]);
      });
    });

    describe('Edge Cases', () => {
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
    });
  });

  describe('Form Validation Simulation', () => {
    const simulateFormValidation = (groupName, matchers) => {
      const validMatchers = matchers.filter(matcher => matcher.value && matcher.value.trim());
      
      if (!groupName || !groupName.trim() || validMatchers.length === 0) {
        return { valid: false, error: 'Please provide a group name and at least one matcher' };
      }
      
      // Test regex patterns
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

    test('validates complete form correctly', () => {
      const result = simulateFormValidation('Test Group', [
        { value: 'https://example.com/', type: 'prefix' },
        { value: '^https://.*\\.test\\.com', type: 'regex' }
      ]);

      expect(result.valid).toBe(true);
      expect(result.validMatchers).toHaveLength(2);
    });

    test('rejects empty group name', () => {
      const result = simulateFormValidation('', [
        { value: 'https://example.com/', type: 'prefix' }
      ]);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please provide a group name and at least one matcher');
    });

    test('rejects form with no valid matchers', () => {
      const result = simulateFormValidation('Test Group', [
        { value: '', type: 'prefix' },
        { value: '   ', type: 'prefix' }
      ]);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please provide a group name and at least one matcher');
    });

    test('validates regex patterns', () => {
      const result = simulateFormValidation('Test Group', [
        { value: '[invalid regex', type: 'regex' }
      ]);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid regex pattern');
    });

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
  });
});
