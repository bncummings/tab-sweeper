export const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

export const globToRegex = (globPattern) => {
  const escapedPattern = globPattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  
  return new RegExp(`^${escapedPattern}$`);
};

export const sortTabsByTitle = (tabs) => {
  const collator = new Intl.Collator();
  return tabs.sort((a, b) => collator.compare(a.title, b.title));
};

export const removeDuplicateTabs = (tabs) => 
  tabs.filter((tab, index, self) => 
    index === self.findIndex(t => t.id === tab.id)
  );

export const extractTabTitle = (title) => title.split('|')[0].trim();

export const extractPathname = (url) => new URL(url).pathname;