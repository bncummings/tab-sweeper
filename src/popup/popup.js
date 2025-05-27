import tabsModule from "./tabs.js";
const { tabGroups, addGroup, createGroup } = tabsModule;

const tabGroupMap = {}

const googleGroup = createGroup("Google");
googleGroup.addUris(
    'https://developer.chrome.com/docs/webstore/*',
    'https://developer.chrome.com/docs/extensions/*'
  )

console.log("googleGroup.uris:", googleGroup.uris);

const googleTabs = await chrome.tabs.query({
  url: googleGroup.uris
});

tabGroupMap[googleGroup.name] = googleTabs;

const jsGroup = createGroup("JavaScript");
jsGroup.addUris(
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript*',
    'https://www.w3schools.com/js*',
    'https://developer.mozilla.org/en-US/docs/Learn/JavaScript*'
  )

console.log("jsGroup.uris:", jsGroup.uris);

const jsTabs = await chrome.tabs.query({
  url: jsGroup.uris
});

tabGroupMap[jsGroup.name] = jsTabs;

/*
 * Add more groups and tabs as needed.
 */
const collator = new Intl.Collator();
Object.values(tabGroupMap).forEach((group) => {
  group.sort((a, b) => collator.compare(a.title, b.title));
});

const template = document.getElementById('li_template');
const elements = new Set();
for (const group of Object.values(tabGroupMap)) {
  for (const tab of group) {
    const element = template.content.firstElementChild.cloneNode(true);

    const title = tab.title.split('|')[0].trim();
    const pathname = new URL(tab.url).pathname.slice('/docs'.length);

    element.querySelector('.title').textContent = title;
    element.querySelector('.pathname').textContent = pathname;
    element.querySelector('a').addEventListener('click', async () => {
      // need to focus window as well as the active tab
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    });

    elements.add(element);
  }

  document.getElementById('google-doc-list').append(...elements);
  elements.clear();
}

/**
 * Click handler to group them tabs.
 */
const button = document.querySelector('button');
button.addEventListener('click', async () => {
  for (const group in tabGroupMap) {
    const tabs = tabGroupMap[group];
    if (tabs.length === 0) {
      continue;
    }
    const tabIds = tabs.map(({ id }) => id);
    console.log(`Grouping tabs: ${tabIds}`);
    const tabGroup = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(tabGroup, { title: group });
  }
});
