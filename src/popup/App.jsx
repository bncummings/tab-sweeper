import React, { useState, useEffect } from 'react';
import TabGroup from './components/TabGroup';
import tabsModule from './tabs.js';

const { createGroup } = tabsModule;

const App = () => {
  const [tabGroups, setTabGroups] = useState({});
  const [isGrouping, setIsGrouping] = useState(false);

  useEffect(() => {
    const initializeTabGroups = async () => {
      try {
        // Create Google group
        const googleGroup = createGroup("Google");
        googleGroup.addUris(
          'https://developer.chrome.com/docs/webstore/*',
          'https://developer.chrome.com/docs/extensions/*'
        );

        // Create JavaScript group
        const jsGroup = createGroup("JavaScript");
        jsGroup.addUris(
          'https://developer.mozilla.org/en-US/docs/Web/JavaScript*',
          'https://www.w3schools.com/js*',
          'https://developer.mozilla.org/en-US/docs/Learn/JavaScript*'
        );

        // Query tabs
        const [googleTabs, jsTabs] = await Promise.all([
          chrome.tabs.query({ url: googleGroup.uris }),
          chrome.tabs.query({ url: jsGroup.uris })
        ]);

        // Sort tabs by title
        const collator = new Intl.Collator();
        const sortTabs = (tabs) => tabs.sort((a, b) => collator.compare(a.title, b.title));

        const groups = {
          [googleGroup.name]: sortTabs(googleTabs),
          [jsGroup.name]: sortTabs(jsTabs)
        };

        setTabGroups(groups);
      } catch (error) {
        console.error('Error initializing tab groups:', error);
      }
    };

    initializeTabGroups();
  }, []);

  const handleTabClick = async (tab) => {
    try {
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    } catch (error) {
      console.error('Error switching to tab:', error);
    }
  };

  const handleGroupTabs = async () => {
    setIsGrouping(true);
    try {
      for (const [groupName, tabs] of Object.entries(tabGroups)) {
        if (tabs.length === 0) continue;
        
        const tabIds = tabs.map(({ id }) => id);
        console.log(`Grouping tabs: ${tabIds}`);
        
        const tabGroup = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(tabGroup, { title: groupName });
      }
    } catch (error) {
      console.error('Error grouping tabs:', error);
    } finally {
      setIsGrouping(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>~My Tabs~</h1>
      </header>
      
      <main className="app-main">
        <div className="tab-groups-container">
          {Object.entries(tabGroups).map(([groupName, tabs]) => (
            <TabGroup
              key={groupName}
              title={groupName}
              tabs={tabs}
              onTabClick={handleTabClick}
            />
          ))}
        </div>
        
        <div className="actions">
          <button
            className="group-button"
            onClick={handleGroupTabs}
            disabled={isGrouping}
          >
            {isGrouping ? 'Grouping...' : 'Group Tabs'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
