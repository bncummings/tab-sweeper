import { isValidUrl, globToRegex } from './utils.js';

export const MatcherTypes = {
  PREFIX: 'prefix',
  REGEX: 'regex',
  GLOB: 'glob'
};

export const separateMatchersByType = (matchers) => ({
  prefix: matchers.filter(m => m.type === MatcherTypes.PREFIX),
  regex: matchers.filter(m => m.type === MatcherTypes.REGEX),
  glob: matchers.filter(m => m.type === MatcherTypes.GLOB)
});

export const getTabsMatchingPrefix = async (prefixMatchers) => {
  const validMatchers = prefixMatchers.filter(m => isValidUrl(m.value));
  if (validMatchers.length === 0) return [];
  
  const prefixUris = validMatchers.map(m => m.value + '*');
  return await chrome.tabs.query({ url: prefixUris });
};

export const getTabsMatchingRegex = (allTabs, regexMatchers) => {
  const validUrlTabs = allTabs.filter(tab => isValidUrl(tab.url));
  return validUrlTabs.filter(tab => 
    regexMatchers.some(matcher => {
      try {
        const regex = new RegExp(matcher.value);
        return regex.test(tab.url);
      } catch (error) {
        console.error(`Invalid regex pattern "${matcher.value}":`, error);
        return false;
      }
    })
  );
};

export const getTabsMatchingGlob = (allTabs, globMatchers) => {
  const validUrlTabs = allTabs.filter(tab => isValidUrl(tab.url));
  return validUrlTabs.filter(tab => 
    globMatchers.some(matcher => {
      try {
        const globRegex = globToRegex(matcher.value);
        return globRegex.test(tab.url);
      } catch (error) {
        console.error(`Invalid glob pattern "${matcher.value}":`, error);
        return false;
      }
    })
  );
};

export const findMatchingTabs = async (matchers) => {
  const { prefix, regex, glob } = separateMatchersByType(matchers);
  let matchingTabs = [];

  if (prefix.length > 0) {
    const prefixTabs = await getTabsMatchingPrefix(prefix);
    matchingTabs.push(...prefixTabs);
  }

  if (regex.length > 0 || glob.length > 0) {
    const allTabs = await chrome.tabs.query({});
    
    if (regex.length > 0) {
      const regexTabs = getTabsMatchingRegex(allTabs, regex);
      matchingTabs.push(...regexTabs);
    }
    
    if (glob.length > 0) {
      const globTabs = getTabsMatchingGlob(allTabs, glob);
      matchingTabs.push(...globTabs);
    }
  }

  return matchingTabs;
};