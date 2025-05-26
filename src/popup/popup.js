const googleTabs = await chrome.tabs.query({
  url: [
    'https://developer.chrome.com/docs/webstore/*',
    'https://developer.chrome.com/docs/extensions/*'
  ]
});

const jsTabs = await chrome.tabs.query({
  url: [
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript*',
    'https://www.w3schools.com/js*',
    'https://developer.mozilla.org/en-US/docs/Learn/JavaScript*'
  ]
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
const collator = new Intl.Collator();
googleTabs.sort((a, b) => collator.compare(a.title, b.title));
jsTabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById('li_template');
const elements = new Set();
for (const tab of googleTabs) {
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
for (const tab of jsTabs) {
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
document.getElementById('js-doc-list').append(...elements);

const button = document.querySelector('button');
button.addEventListener('click', async () => {
  let tabIds = googleTabs.map(({ id }) => id);
  if (tabIds.length) {
    console.log(tabIds);
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: 'DOCS' });
  }
  tabIds = jsTabs.map(({ id }) => id);
  if (tabIds.length) {
    console.log(tabIds);
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: 'JS Docs' });
  }
});

