import { globToRegex } from '../../src/popup/utils';

beforeEach(() => {
  jest.clearAllMocks();
});

test('converts single asterisk to .* in regex', () => {
  const regex = globToRegex('prefix*suffix');
  
  expect(regex.source).toBe('^prefix.*suffix$');
  expect(regex.test('prefixANYTHINGsuffix')).toBe(true);
  expect(regex.test('prefixsuffix')).toBe(true);
});

test('converts double asterisk to .* in regex', () => {
  const regex = globToRegex('path/**');

  expect(regex.source).toBe('^path\\/.*.*$');
  expect(regex.test('path/deep/nested/file')).toBe(true);
  expect(regex.test('path/')).toBe(true);
});

test('converts question mark to single character match', () => {
  const regex = globToRegex('file?.txt');

  expect(regex.source).toBe('^file.\\.txt$');
  expect(regex.test('fileA.txt')).toBe(true);
  expect(regex.test('file1.txt')).toBe(true);
  expect(regex.test('file.txt')).toBe(false);
  expect(regex.test('fileAB.txt')).toBe(false);
});

test('escapes regex special characters', () => {
  const regex = globToRegex('path.with+special[chars](and){braces}|pipes^dollars$');
  const escaped = '^path\\.with\\+special\\[chars\\]\\(and\\)\\{braces\\}\\|pipes\\^dollars\\$$';

  expect(regex.source).toBe(escaped);
});

test('combines multiple glob patterns correctly', () => {
  const regex = globToRegex('*/middle/*/end?');

  expect(regex.source).toBe('^.*\\/middle\\/.*\\/end.$');
  expect(regex.test('start/middle/something/endX')).toBe(true);
  expect(regex.test('a/middle/b/end1')).toBe(true);
  expect(regex.test('x/middle/y/end')).toBe(false);
});

test('handles protocol patterns', () => {
  const httpPattern = globToRegex('http*://*/path');
  const exactProtocol = globToRegex('https://*/path');

  expect(httpPattern.test('http://domain/path')).toBe(true);
  expect(httpPattern.test('https://domain/path')).toBe(true);
  expect(httpPattern.test('httpx://domain/path')).toBe(true);
  expect(exactProtocol.test('https://domain/path')).toBe(true);
  expect(exactProtocol.test('http://domain/path')).toBe(false);
});

test('handles domain patterns', () => {
  const subdomainPattern = globToRegex('https://*.domain.com/*');

  expect(subdomainPattern.test('https://api.domain.com/endpoint')).toBe(true);
  expect(subdomainPattern.test('https://www.domain.com/page')).toBe(true);
  expect(subdomainPattern.test('https://domain.com/page')).toBe(false);
});

test('handles path patterns', () => {
  const pathPattern = globToRegex('*/api/*/data');

  expect(pathPattern.test('site/api/v1/data')).toBe(true);
  expect(pathPattern.test('app/api/users/data')).toBe(true);
  expect(pathPattern.test('site/api/data')).toBe(false);
  expect(pathPattern.test('site/api/v1/info')).toBe(false);
});

test('handles file extension patterns', () => {
  const jsPattern = globToRegex('*.js');

  expect(jsPattern.test('app.js')).toBe(true);
  expect(jsPattern.test('component.js')).toBe(true);
  expect(jsPattern.test('file.jsx')).toBe(false);
  expect(jsPattern.test('file.ts')).toBe(false);
});

test('handles empty pattern', () => {
  const emptyRegex = globToRegex('');

  expect(emptyRegex.source).toBe('^$');
  expect(emptyRegex.test('')).toBe(true);
  expect(emptyRegex.test('anything')).toBe(false);
});

test('handles pattern with only wildcards', () => {
  const allPattern = globToRegex('*');
  const deepPattern = globToRegex('**');

  expect(allPattern.test('anything')).toBe(true);
  expect(allPattern.test('')).toBe(true);
  expect(allPattern.test('multiple words')).toBe(true);
  expect(deepPattern.test('deep/path/structure')).toBe(true);
});

test('handles exact match patterns', () => {
  const exactPattern = globToRegex('exact/match/pattern');

  expect(exactPattern.test('exact/match/pattern')).toBe(true);
  expect(exactPattern.test('exact/match/pattern/extra')).toBe(false);
  expect(exactPattern.test('prefix/exact/match/pattern')).toBe(false);
});

test('handles complex mixed patterns', () => {
  const complexPattern = globToRegex('*/api/v?/users/*.json');

  expect(complexPattern.test('app/api/v1/users/data.json')).toBe(true);
  expect(complexPattern.test('site/api/v2/users/list.json')).toBe(true);
  expect(complexPattern.test('app/api/v10/users/data.json')).toBe(false); // v10 has 2 chars, ? matches only 1
  expect(complexPattern.test('app/api/v1/posts/data.json')).toBe(false);
  expect(complexPattern.test('app/api/v1/users/data.xml')).toBe(false);
});

test('is case sensitive by default', () => {
  const pattern = globToRegex('Case*Sensitive');

  expect(pattern.test('CaseINSensitive')).toBe(true);
  expect(pattern.test('caseinsensitive')).toBe(false);
  expect(pattern.test('CASEINSENSITIVE')).toBe(false);
});
