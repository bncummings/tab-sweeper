import React, { useState, useEffect } from 'react';
import TabGroup from './components/TabGroup';
import CreateTabGroupModal from './components/CreateTabGroupModal';
import tabsModule from './tabs.js';

const { createGroup } = tabsModule;

// Utility function to validate URLs
const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (error) {
    return false;
  }
};

const App = () => {
  const [tabGroups, setTabGroups] = useState({});
  const [isGrouping, setIsGrouping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customGroups, setCustomGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);

  useEffect(() => {
    const initializeTabGroups = async () => {
      try {
        console.log('Initializing tab groups...');
        
        // Check if Chrome APIs are available
        if (!chrome || !chrome.tabs) {
          throw new Error('Chrome APIs not available');
        }

        // Load custom groups from storage
        const storedGroups = await chrome.storage.local.get('customGroups');
        const savedCustomGroups = storedGroups.customGroups || [];
        setCustomGroups(savedCustomGroups);

        // Create custom groups
        const customGroupObjects = savedCustomGroups.map(customGroup => {
          const group = createGroup(customGroup.name);
          
          if (customGroup.matchers) {
            // New format with mixed matchers
            group.matchers = customGroup.matchers;
          } else if (customGroup.matchType === 'regex') {
            // Legacy regex format
            group.matchers = customGroup.regexPatterns.map(pattern => ({ value: pattern, type: 'regex' }));
          } else {
            // Legacy URL prefix format
            const prefixes = customGroup.urlPrefixes || [customGroup.urlPrefix];
            group.matchers = prefixes.map(prefix => ({ value: prefix, type: 'prefix' }));
          }
          
          return group;
        });

        // Query tabs - for regex matchers we need all tabs, for prefix matchers we can use Chrome's query
        const allTabs = await chrome.tabs.query({});
        
        console.log('All tabs:', allTabs);

        // Sort tabs by title
        const collator = new Intl.Collator();
        const sortTabs = (tabs) => tabs.sort((a, b) => collator.compare(a.title, b.title));

        const groups = {};
        
        for (const group of customGroupObjects) {
          let matchingTabs = [];
          
          // Separate matchers by type for efficient processing
          const prefixMatchers = group.matchers.filter(m => m.type === 'prefix');
          const regexMatchers = group.matchers.filter(m => m.type === 'regex');
          
          // Get tabs matching URL prefixes using Chrome API
          if (prefixMatchers.length > 0) {
            // Filter out invalid URL prefixes
            const validPrefixMatchers = prefixMatchers.filter(m => isValidUrl(m.value));
            if (validPrefixMatchers.length > 0) {
              const prefixUris = validPrefixMatchers.map(m => m.value + '*');
              const prefixTabs = await chrome.tabs.query({ url: prefixUris });
              matchingTabs.push(...prefixTabs);
            }
          }
          
          // Get tabs matching regex patterns by filtering all tabs
          if (regexMatchers.length > 0) {
            // Filter to only include tabs with valid URLs
            const validUrlTabs = allTabs.filter(tab => isValidUrl(tab.url));
            const regexTabs = validUrlTabs.filter(tab => {
              return regexMatchers.some(matcher => {
                try {
                  const regex = new RegExp(matcher.value);
                  return regex.test(tab.url);
                } catch (error) {
                  console.error(`Invalid regex pattern "${matcher.value}":`, error);
                  return false;
                }
              });
            });
            matchingTabs.push(...regexTabs);
          }
          
          // Remove duplicates (a tab might match both prefix and regex)
          const uniqueTabs = matchingTabs.filter((tab, index, self) => 
            index === self.findIndex(t => t.id === tab.id)
          );
          
          groups[group.name] = sortTabs(uniqueTabs);
        }

        setTabGroups(groups);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing tab groups:', error);
        setError(error.message);
        setIsLoading(false);
        
        // Set some mock data for testing
        setTabGroups({
          'Google': [],
          'JavaScript': []
        });
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

  const handleCreateCustomGroup = async (groupName, matchers) => {
    try {
      // Filter out invalid URL prefixes but keep all regex patterns
      const validMatchers = matchers.filter(m => {
        if (m.type === 'prefix') {
          return isValidUrl(m.value.trim());
        }
        return true; // Keep all regex patterns
      }).map(m => ({ value: m.value.trim(), type: m.type }));
      
      // Skip if no valid matchers remain
      if (validMatchers.length === 0) {
        console.warn(`No valid matchers found for group "${groupName}"`);
        return;
      }
      
      const newCustomGroup = { 
        name: groupName, 
        matchers: validMatchers
      };
      const updatedCustomGroups = [...customGroups, newCustomGroup];
      
      // Save to storage
      await chrome.storage.local.set({ customGroups: updatedCustomGroups });
      setCustomGroups(updatedCustomGroups);
      
      // Create the group and query tabs
      const group = createGroup(groupName);
      let matchingTabs = [];
      
      // Separate matchers by type for efficient processing
      const prefixMatchers = validMatchers.filter(m => m.type === 'prefix');
      const regexMatchers = validMatchers.filter(m => m.type === 'regex');
      
      // Get tabs matching URL prefixes using Chrome API
      if (prefixMatchers.length > 0) {
        const prefixUris = prefixMatchers.map(m => m.value + '*');
        const prefixTabs = await chrome.tabs.query({ url: prefixUris });
        matchingTabs.push(...prefixTabs);
      }
      
      // Get tabs matching regex patterns by filtering all tabs
      if (regexMatchers.length > 0) {
        const allTabs = await chrome.tabs.query({});
        // Filter to only include tabs with valid URLs
        const validUrlTabs = allTabs.filter(tab => isValidUrl(tab.url));
        const regexTabs = validUrlTabs.filter(tab => {
          return regexMatchers.some(matcher => {
            try {
              const regex = new RegExp(matcher.value);
              return regex.test(tab.url);
            } catch (error) {
              console.error(`Invalid regex pattern "${matcher.value}":`, error);
              return false;
            }
          });
        });
        matchingTabs.push(...regexTabs);
      }
      
      // Remove duplicates
      const uniqueTabs = matchingTabs.filter((tab, index, self) => 
        index === self.findIndex(t => t.id === tab.id)
      );
      
      const collator = new Intl.Collator();
      const sortedTabs = uniqueTabs.sort((a, b) => collator.compare(a.title, b.title));
      
      // Update tab groups
      setTabGroups(prev => ({
        ...prev,
        [groupName]: sortedTabs
      }));
      
      console.log(`Created custom group "${groupName}" with ${sortedTabs.length} tabs using mixed matchers`);
    } catch (error) {
      console.error('Error creating custom group:', error);
      throw error;
    }
  };

  const handleEditGroup = (groupName) => {
    const group = customGroups.find(g => g.name === groupName);
    if (group) {
      setEditingGroup(group);
      setIsModalOpen(true);
    }
  };

  const handleUpdateGroup = async (originalName, newName, matchers) => {
    try {
      // Filter out invalid URL prefixes but keep all regex patterns
      const validMatchers = matchers.filter(m => {
        if (m.type === 'prefix') {
          return isValidUrl(m.value.trim());
        }
        return true; // Keep all regex patterns
      }).map(m => ({ value: m.value.trim(), type: m.type }));
      
      // Skip if no valid matchers remain
      if (validMatchers.length === 0) {
        console.warn(`No valid matchers found for group "${newName}"`);
        return;
      }
      
      const updatedCustomGroups = customGroups.map(group => 
        group.name === originalName 
          ? { 
              name: newName, 
              matchers: validMatchers
            }
          : group
      );
      
      // Save to storage
      await chrome.storage.local.set({ customGroups: updatedCustomGroups });
      setCustomGroups(updatedCustomGroups);
      
      // Remove old group from tab groups if name changed
      const newTabGroups = { ...tabGroups };
      if (originalName !== newName) {
        delete newTabGroups[originalName];
      }
      
      // Create the group and query tabs
      const group = createGroup(newName);
      let matchingTabs = [];
      
      // Separate matchers by type for efficient processing
      const prefixMatchers = validMatchers.filter(m => m.type === 'prefix');
      const regexMatchers = validMatchers.filter(m => m.type === 'regex');
      
      // Get tabs matching URL prefixes using Chrome API
      if (prefixMatchers.length > 0) {
        const prefixUris = prefixMatchers.map(m => m.value + '*');
        const prefixTabs = await chrome.tabs.query({ url: prefixUris });
        matchingTabs.push(...prefixTabs);
      }
      
      // Get tabs matching regex patterns by filtering all tabs
      if (regexMatchers.length > 0) {
        const allTabs = await chrome.tabs.query({});
        // Filter to only include tabs with valid URLs
        const validUrlTabs = allTabs.filter(tab => isValidUrl(tab.url));
        const regexTabs = validUrlTabs.filter(tab => {
          return regexMatchers.some(matcher => {
            try {
              const regex = new RegExp(matcher.value);
              return regex.test(tab.url);
            } catch (error) {
              console.error(`Invalid regex pattern "${matcher.value}":`, error);
              return false;
            }
          });
        });
        matchingTabs.push(...regexTabs);
      }
      
      // Remove duplicates
      const uniqueTabs = matchingTabs.filter((tab, index, self) => 
        index === self.findIndex(t => t.id === tab.id)
      );
      
      const collator = new Intl.Collator();
      const sortedTabs = uniqueTabs.sort((a, b) => collator.compare(a.title, b.title));
      
      // Update tab groups
      setTabGroups(prev => ({
        ...newTabGroups,
        [newName]: sortedTabs
      }));
      
      console.log(`Updated custom group "${originalName}" to "${newName}" with ${sortedTabs.length} tabs using mixed matchers`);
    } catch (error) {
      console.error('Error updating custom group:', error);
      throw error;
    }
  };

  const handleDeleteGroup = async (groupName) => {
    try {
      const updatedCustomGroups = customGroups.filter(g => g.name !== groupName);
      
      // Save to storage
      await chrome.storage.local.set({ customGroups: updatedCustomGroups });
      setCustomGroups(updatedCustomGroups);
      
      // Remove from tab groups
      const newTabGroups = { ...tabGroups };
      delete newTabGroups[groupName];
      setTabGroups(newTabGroups);
      
      console.log(`Deleted custom group "${groupName}"`);
    } catch (error) {
      console.error('Error deleting custom group:', error);
      throw error;
    }
  };

  const isCustomGroup = (groupName) => {
    return customGroups.some(g => g.name === groupName);
  };

  const appStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    width: '420px',
    minHeight: '550px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#333'
  };

  const headerStyle = {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(15px)',
    padding: '24px',
    textAlign: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
    position: 'relative'
  };

  const headerTitleStyle = {
    margin: 0,
    color: 'white',
    fontSize: '28px',
    fontWeight: '300',
    textShadow: '0 3px 6px rgba(0, 0, 0, 0.4)',
    letterSpacing: '2px'
  };

  const plusButtonStyle = {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    fontSize: '24px',
    fontWeight: '300',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)'
  };

  const mainStyle = {
    flex: 1,
    padding: '24px',
    overflowY: 'auto'
  };

  const tabGroupsContainerStyle = {
    marginBottom: '24px'
  };

  const actionsStyle = {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px 0'
  };

  const groupButtonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    padding: '14px 40px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
    minWidth: '140px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  console.log('Rendering App component, tabGroups:', tabGroups, 'isLoading:', isLoading, 'error:', error);

  if (isLoading) {
    return (
      <div style={appStyle}>
        <header style={headerStyle}>
          <h1 style={headerTitleStyle}>~My Tabs~</h1>
        </header>
        <main style={mainStyle}>
          <div style={{textAlign: 'center', padding: '40px', color: 'white'}}>
            Loading tabs...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={appStyle}>
        <header style={headerStyle}>
          <h1 style={headerTitleStyle}>~My Tabs~</h1>
        </header>
        <main style={mainStyle}>
          <div style={{textAlign: 'center', padding: '40px', color: 'white'}}>
            <p>Error: {error}</p>
            <p>Extension is running in development mode.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <h1 style={headerTitleStyle}>~My Tabs~</h1>
        <button
          style={plusButtonStyle}
          onClick={() => setIsModalOpen(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title="Create new tab group"
        >
          +
        </button>
      </header>
      
      <main style={mainStyle}>
        <div style={tabGroupsContainerStyle}>
          {Object.entries(tabGroups).map(([groupName, tabs]) => (
            <TabGroup
              key={groupName}
              title={groupName}
              tabs={tabs}
              onTabClick={handleTabClick}
              isCustomGroup={isCustomGroup(groupName)}
              onEditGroup={handleEditGroup}
              onDeleteGroup={handleDeleteGroup}
            />
          ))}
        </div>
        
        <div style={actionsStyle}>
          <button
            style={groupButtonStyle}
            onClick={handleGroupTabs}
            disabled={isGrouping}
            onMouseEnter={(e) => {
              if (!isGrouping) {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.7)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isGrouping) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
              }
            }}
          >
            {isGrouping ? 'Grouping...' : 'Group Tabs'}
          </button>
        </div>
      </main>        <CreateTabGroupModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingGroup(null);
          }}
          onCreateGroup={editingGroup ? handleUpdateGroup : handleCreateCustomGroup}
          editingGroup={editingGroup}
        />
    </div>
  );
};

export default App;
