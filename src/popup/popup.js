import tabsModule from "./tabs.js";
const { tabGroups, addGroup, createGroup } = tabsModule;
const tabGroupMap = {};

/**
 * TEMPORARY:
 */
const googleGroup = createGroup("Google");
googleGroup.addUris(
    'https://developer.chrome.com/docs/webstore/*',
    'https://developer.chrome.com/docs/extensions/*'
  )

console.log("googleGroup.uris:", googleGroup.uris);

const googleTabs = await chrome.tabs.query({
  url: googleGroup.uris
});

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

tabGroupMap[googleGroup.name] = googleTabs;
tabGroupMap[jsGroup.name] = jsTabs;

/**
 * Sort the tabs in each group by title.
 */
const collator = new Intl.Collator();
Object.values(tabGroupMap).forEach((group) => {
  group.sort((a, b) => collator.compare(a.title, b.title));
});

/**
 * Add each tab to the popup.
 */
const template = document.getElementById('groupli_template');
const tabTemplate = document.getElementById('tabli_template');

for (const [groupName, groupTabs] of Object.entries(tabGroupMap)) {
  const groupElement = template.content.firstElementChild.cloneNode(true);
  groupElement.querySelector('.title').textContent = groupName;

  for (const tab of groupTabs) {
    const element = tabTemplate.content.firstElementChild.cloneNode(true);
    const tabTitle = tab.title.split('|')[0].trim();
    const pathname = new URL(tab.url).pathname.slice('/docs'.length);

    element.querySelector('.tab_title').textContent = tabTitle;
    element.querySelector('.pathname').textContent = pathname;
    element.querySelector('a').addEventListener('click', async () => {
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    });

    groupElement.querySelector('.tab-list').append(element);
  }

  document.getElementById('tab-group-list').append(groupElement);
}

/**
 * Click handler to group them tabs.
 */
const button = document.querySelector('button');
button.addEventListener('click', async () => {
  for (const [groupName, tabs] of Object.entries(tabGroupMap)) {
    if (tabs.length === 0) {
      continue;
    }
    const tabIds = tabs.map(({ id }) => id);
    console.log(`Grouping tabs: ${tabIds}`);
    const tabGroup = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(tabGroup, { title: groupName });
  }
});
