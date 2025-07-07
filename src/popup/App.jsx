import React, { useState, useEffect } from 'react';
import TabGroup from './components/TabGroup';
import CreateTabGroupModal from './components/CreateTabGroupModal';
import tabsModule from './tabs.js';

const { createGroup } = tabsModule;

const App = () => {
  const [tabGroups, setTabGroups] = useState({});
  const [isGrouping, setIsGrouping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customGroups, setCustomGroups] = useState([]);

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

        // Create default groups
        const googleGroup = createGroup("Google");
        googleGroup.addUris(
          'https://developer.chrome.com/docs/webstore/*',
          'https://developer.chrome.com/docs/extensions/*'
        );

        const jsGroup = createGroup("JavaScript");
        jsGroup.addUris(
          'https://developer.mozilla.org/en-US/docs/Web/JavaScript*',
          'https://www.w3schools.com/js*',
          'https://developer.mozilla.org/en-US/docs/Learn/JavaScript*'
        );

        // Create custom groups
        const customGroupObjects = savedCustomGroups.map(customGroup => {
          const group = createGroup(customGroup.name);
          group.addUris(customGroup.urlPrefix + '*');
          return group;
        });

        // Query tabs for all groups
        const allGroups = [googleGroup, jsGroup, ...customGroupObjects];
        const tabQueries = allGroups.map(group => 
          chrome.tabs.query({ url: group.uris })
        );
        
        const allTabResults = await Promise.all(tabQueries);

        console.log('Tab results:', allTabResults);

        // Sort tabs by title
        const collator = new Intl.Collator();
        const sortTabs = (tabs) => tabs.sort((a, b) => collator.compare(a.title, b.title));

        const groups = {};
        allGroups.forEach((group, index) => {
          groups[group.name] = sortTabs(allTabResults[index]);
        });

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

  const handleCreateCustomGroup = async (groupName, urlPrefix) => {
    try {
      const newCustomGroup = { name: groupName, urlPrefix };
      const updatedCustomGroups = [...customGroups, newCustomGroup];
      
      // Save to storage
      await chrome.storage.local.set({ customGroups: updatedCustomGroups });
      setCustomGroups(updatedCustomGroups);
      
      // Create the group and query tabs
      const group = createGroup(groupName);
      group.addUris(urlPrefix + '*');
      
      const tabs = await chrome.tabs.query({ url: group.uris });
      const collator = new Intl.Collator();
      const sortedTabs = tabs.sort((a, b) => collator.compare(a.title, b.title));
      
      // Update tab groups
      setTabGroups(prev => ({
        ...prev,
        [groupName]: sortedTabs
      }));
      
      console.log(`Created custom group "${groupName}" with ${tabs.length} tabs`);
    } catch (error) {
      console.error('Error creating custom group:', error);
      throw error;
    }
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
      </main>

      <CreateTabGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateGroup={handleCreateCustomGroup}
      />
    </div>
  );
};

export default App;
