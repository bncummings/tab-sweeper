import { globToRegex } from '../../src/popup/utils';

describe('Glob Pattern Matching', () => {
  describe('globToRegex', () => {
    test('converts basic glob patterns correctly', () => {
      const regex = globToRegex('https://*/docs/**');
      expect(regex.source).toBe('^https:\\/\\/.*\\/docs\\/.*.*$');
    });

    test('escapes special regex characters', () => {
      const regex = globToRegex('https://example.com/docs?page=1');
      expect(regex.source).toBe('^https:\\/\\/example\\.com\\/docs.page=1$');
    });

    test('handles multiple wildcards', () => {
      const regex = globToRegex('*://*/path/*');
      expect(regex.source).toBe('^.*:\\/\\/.*\\/path\\/.*$');
    });
  });

  describe('Documentation Sites Pattern', () => {
    const pattern = 'https://*/docs/**';
    let regex;

    beforeEach(() => {
      regex = globToRegex(pattern);
    });

    test('matches React documentation URLs', () => {
      expect(regex.test('https://react.dev/docs/getting-started')).toBe(true);
      expect(regex.test('https://react.dev/docs/hooks/state')).toBe(true);
    });

    test('matches Vue documentation URLs', () => {
      expect(regex.test('https://vuejs.org/docs/guide')).toBe(true);
      expect(regex.test('https://vuejs.org/docs/api/composition-api')).toBe(true);
    });

    test('matches Angular documentation URLs', () => {
      expect(regex.test('https://angular.io/docs/tutorial')).toBe(true);
      expect(regex.test('https://angular.io/docs/guide/setup')).toBe(true);
    });

    test('rejects non-documentation URLs', () => {
      expect(regex.test('https://example.com/api')).toBe(false);
      expect(regex.test('https://react.dev/blog')).toBe(false);
      expect(regex.test('https://vuejs.org/examples')).toBe(false);
    });

    test('rejects HTTP URLs when pattern specifies HTTPS', () => {
      expect(regex.test('http://react.dev/docs/hooks')).toBe(false);
      expect(regex.test('http://vuejs.org/docs/guide')).toBe(false);
    });

    test('expected matches count', () => {
      const testUrls = [
        'https://react.dev/docs/getting-started',
        'https://vuejs.org/docs/guide',
        'https://angular.io/docs/tutorial',
        'https://example.com/api',  // Should not match
        'http://react.dev/docs/hooks'  // Should not match (http vs https)
      ];

      const matches = testUrls.filter(url => regex.test(url));
      expect(matches).toHaveLength(3);
      expect(matches).toEqual([
        'https://react.dev/docs/getting-started',
        'https://vuejs.org/docs/guide',
        'https://angular.io/docs/tutorial'
      ]);
    });
  });

  describe('GitHub Issues Pattern', () => {
    const pattern = 'https://github.com/*/issues/*';
    let regex;

    beforeEach(() => {
      regex = globToRegex(pattern);
    });

    test('matches GitHub issue URLs', () => {
      expect(regex.test('https://github.com/facebook/react/issues/123')).toBe(true);
      expect(regex.test('https://github.com/vuejs/vue/issues/456')).toBe(true);
    });

    test('rejects GitHub pull request URLs', () => {
      expect(regex.test('https://github.com/facebook/react/pulls/789')).toBe(false);
    });

    test('rejects GitLab URLs', () => {
      expect(regex.test('https://gitlab.com/user/repo/issues/111')).toBe(false);
    });

    test('expected matches count', () => {
      const testUrls = [
        'https://github.com/facebook/react/issues/123',
        'https://github.com/vuejs/vue/issues/456',
        'https://github.com/facebook/react/pulls/789',  // Should not match
        'https://gitlab.com/user/repo/issues/111'  // Should not match
      ];

      const matches = testUrls.filter(url => regex.test(url));
      expect(matches).toHaveLength(2);
      expect(matches).toEqual([
        'https://github.com/facebook/react/issues/123',
        'https://github.com/vuejs/vue/issues/456'
      ]);
    });
  });

  describe('Localhost Pattern', () => {
    const pattern = '*://localhost:*/**';
    let regex;

    beforeEach(() => {
      regex = globToRegex(pattern);
    });

    test('matches HTTP localhost URLs', () => {
      expect(regex.test('http://localhost:3000/app')).toBe(true);
      expect(regex.test('http://localhost:5000/api/users')).toBe(true);
    });

    test('matches HTTPS localhost URLs', () => {
      expect(regex.test('https://localhost:8080/admin')).toBe(true);
    });

    test('rejects non-localhost URLs with same port pattern', () => {
      expect(regex.test('https://example.com:3000/app')).toBe(false);
    });

    test('expected matches count', () => {
      const testUrls = [
        'http://localhost:3000/app',
        'https://localhost:8080/admin',
        'http://localhost:5000/api/users',
        'https://example.com:3000/app'  // Should not match
      ];

      const matches = testUrls.filter(url => regex.test(url));
      expect(matches).toHaveLength(3);
      expect(matches).toEqual([
        'http://localhost:3000/app',
        'https://localhost:8080/admin',
        'http://localhost:5000/api/users'
      ]);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty patterns', () => {
      const regex = globToRegex('');
      expect(regex.test('')).toBe(true);
      expect(regex.test('anything')).toBe(false);
    });

    test('handles patterns with only wildcards', () => {
      const regex = globToRegex('*');
      expect(regex.test('anything')).toBe(true);
      expect(regex.test('')).toBe(true);
    });

    test('handles patterns with no wildcards', () => {
      const regex = globToRegex('https://exact.com/path');
      expect(regex.test('https://exact.com/path')).toBe(true);
      expect(regex.test('https://exact.com/path/extra')).toBe(false);
    });

    test('handles patterns with special characters', () => {
      const regex = globToRegex('https://site.com/path[1-9]?test=*');
      expect(regex.test('https://site.com/path[1-9]xtest=value')).toBe(true);
    });
  });
});
