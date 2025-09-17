import React, { useState } from 'react';
import TabGroup from './components/TabGroup';
import CreateEditTabGroupPage from './components/CreateEditTabGroupPage';
import TopBar from './components/TopBar';
import { useTabGroups } from './hooks/useTabGroups';
import { STYLES } from './constants.js';

const App = () => {
  const [isGrouping, setIsGrouping] = useState(false);
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'create-edit'
  const [editingGroup, setEditingGroup] = useState(null);

  const {
    tabGroups,
    userTabGroups,
    isLoading,
    error,
    createTabGroup,
    updateGroup,
    deleteGroup
  } = useTabGroups();

  const handleTabClick = async (tab) => {
    try {
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    } catch (error) {
      console.error('Error switching to tab:', error);
    }
  };

  const handleGroupTabs = async (groupName = null) => {
    setIsGrouping(true);
    try {
      /* Get the currently active tab first */
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const groupsToProcess = groupName 
        ? { [groupName]: tabGroups[groupName] }
        : tabGroups;

      const createdGroups = [];

      for (const [name, tabs] of Object.entries(groupsToProcess)) {
        if (tabs.length === 0) continue;
        
        // Check if a Chrome tab group with this name already exists
        let existingGroup = null;
        try {
          const windows = await chrome.windows.getAll({ populate: true });
          for (const win of windows) {
            if (chrome.tabGroups.query) {
              const groups = await chrome.tabGroups.query({ windowId: win.id, title: name });
              if (groups.length > 0) {
                existingGroup = groups[0]; // Use the first matching group
                break;
              }
            }
          }
        } catch (error) {
          console.warn('Error checking for existing groups:', error);
        }

        const tabIds = tabs.map(({ id }) => id);
        let tabGroup;

        if (existingGroup) {
          // Add tabs to existing group
          try {
            // Get tabs already in the group to avoid duplicates
            const existingTabsInGroup = await chrome.tabs.query({ 
              windowId: existingGroup.windowId, 
              groupId: existingGroup.id 
            });
            const existingTabIds = new Set(existingTabsInGroup.map(tab => tab.id));
            
            // Only add tabs that aren't already in the group
            const newTabIds = tabIds.filter(id => !existingTabIds.has(id));
            
            if (newTabIds.length > 0) {
              await chrome.tabs.group({ tabIds: newTabIds, groupId: existingGroup.id });
            }
            
            tabGroup = existingGroup.id;
          } catch (error) {
            console.warn('Error adding tabs to existing group, creating new group:', error);
            // Fallback: create new group if adding to existing fails
            tabGroup = await chrome.tabs.group({ tabIds });
          }
        } else {
          // Create new group
          tabGroup = await chrome.tabs.group({ tabIds });
        }
        
        // Find the user group to get its color
        const userGroup = userTabGroups.find(g => g.name === name);
        const groupColor = userGroup?.color || 'blue';
        
        await chrome.tabGroups.update(tabGroup, { 
          title: name,
          color: groupColor
        });
        
        /* Track which group contains the active tab */
        const containsActiveTab = tabs.some(tab => tab.id === activeTab.id);
        createdGroups.push({ groupId: tabGroup, containsActiveTab, name });
      }

      /* Collapse all groups except the one containing the active tab */
      for (const { groupId, containsActiveTab } of createdGroups) {
        if (!containsActiveTab && chrome.tabGroups.update) {
          try {
            await chrome.tabGroups.update(groupId, { collapsed: true });
          } catch (error) {
            console.warn('Could not collapse tab group:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error grouping tabs:', error);
    } finally {
      setIsGrouping(false);
    }
  };

  const handleEditGroup = (groupName) => {
    const group = userTabGroups.find(g => g.name === groupName);
    if (group) {
      setEditingGroup(group);
      setCurrentView('create-edit');
    }
  };

  const handleCreateNew = () => {
    setEditingGroup(null);
    setCurrentView('create-edit');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setEditingGroup(null);
  };

  const handleCreateOrUpdate = async (...args) => {
    try {
      if (editingGroup) {
        await updateGroup(...args);
      } else {
        await createTabGroup(...args);
      }
      // Navigate back to main view after successful save
      handleBackToMain();
    } catch (error) {
      // Error handling is done in the page component
      throw error;
    }
  };

  const styles = {
    app: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      width: '420px',
      minHeight: '550px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      background: '#ffffff',
      color: '#333'
    },
    main: {
      flex: 1,
      padding: '24px',
      overflowY: 'auto',
      background: '#ffffff'
    },
    tabGroupsContainer: {
      marginBottom: '24px'
    },
    loadingMessage: {
      textAlign: 'center',
      padding: '40px',
      color: STYLES.colors.text
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
      color: STYLES.colors.muted,
      minHeight: '300px'
    },
    emptyStateText: {
      fontSize: '18px',
      fontWeight: '500',
      marginBottom: '12px',
      color: STYLES.colors.text
    },
    emptyStateSubtext: {
      fontSize: '14px',
      marginBottom: '24px',
      lineHeight: '1.5'
    }
  };


  // Show create/edit page
  if (currentView === 'create-edit') {
    return (
      <CreateEditTabGroupPage
        onSave={handleCreateOrUpdate}
        onCancel={handleBackToMain}
        editingGroup={editingGroup}
      />
    );
  }

  if (isLoading) {
    return (
      <div style={styles.app}>
        <TopBar />
        <main style={styles.main}>
          <div style={styles.loadingMessage}>Loading tabs...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.app}>
        <TopBar />
        <main style={styles.main}>
          <div style={styles.loadingMessage}>
            <p>Error: {error}</p>
            <p>Extension is running in development mode.</p>
          </div>
        </main>
      </div>
    );
  }

  // Main view
  return (
    <div style={styles.app}>
      <TopBar
        isGrouping={isGrouping}
        onGroupAll={() => handleGroupTabs()}
        onCreateNew={handleCreateNew}
      />
      
      <main style={styles.main}>
        {Object.keys(tabGroups).length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateText}>No tab groups yet</div>
            <div style={styles.emptyStateSubtext}>
              Create your first tab group to organize your tabs by URL patterns, regex, or glob patterns.
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: STYLES.colors.muted, marginTop: '20px' }}>
              Click the + button to get started!
            </div>
          </div>
        ) : (
          <div style={styles.tabGroupsContainer}>
            {Object.entries(tabGroups).map(([groupName, tabs]) => {
              const userGroup = userTabGroups.find(g => g.name === groupName);
              return (
                <TabGroup
                  key={groupName}
                  title={groupName}
                  tabs={tabs}
                  onTabClick={handleTabClick}
                  onEditGroup={handleEditGroup}
                  onDeleteGroup={deleteGroup}
                  onGroupTabs={handleGroupTabs}
                  isGrouping={isGrouping}
                  color={userGroup?.color || 'blue'}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
