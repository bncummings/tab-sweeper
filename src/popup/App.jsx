import React, { useState } from 'react';
import TabGroup from './components/TabGroup';
import CreateTabGroupModal from './components/CreateTabGroupModal';
import SketchyButton from './components/SketchyButton';
import { useTabGroups } from './hooks/useTabGroups';
import { STYLES } from './constants.js';

const App = () => {
  const [isGrouping, setIsGrouping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const {
    tabGroups,
    customGroups,
    isLoading,
    error,
    createCustomGroup,
    updateGroup,
    deleteGroup,
    isCustomGroup
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
      const groupsToProcess = groupName 
        ? { [groupName]: tabGroups[groupName] }
        : tabGroups;

      for (const [name, tabs] of Object.entries(groupsToProcess)) {
        if (tabs.length === 0) continue;
        
        const tabIds = tabs.map(({ id }) => id);
        const tabGroup = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(tabGroup, { title: name });
      }
    } catch (error) {
      console.error('Error grouping tabs:', error);
    } finally {
      setIsGrouping(false);
    }
  };

  const handleEditGroup = (groupName) => {
    const group = customGroups.find(g => g.name === groupName);
    if (group) {
      setEditingGroup(group);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
  };

  const handleCreateOrUpdate = async (...args) => {
    if (editingGroup) {
      await updateGroup(...args);
    } else {
      await createCustomGroup(...args);
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
      background: `linear-gradient(135deg, ${STYLES.colors.primary} 0%, ${STYLES.colors.secondary} 100%)`,
      color: '#333'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(15px)',
      padding: '24px',
      textAlign: 'center',
      borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
      position: 'relative'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    title: {
      margin: 0,
      color: STYLES.colors.white,
      fontSize: '28px',
      fontWeight: '300',
      textShadow: '0 3px 6px rgba(0, 0, 0, 0.4)',
      letterSpacing: '2px',
      textAlign: 'left'
    },
    buttonGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    main: {
      flex: 1,
      padding: '24px',
      overflowY: 'auto'
    },
    tabGroupsContainer: {
      marginBottom: '24px'
    },
    loadingMessage: {
      textAlign: 'center',
      padding: '40px',
      color: STYLES.colors.white
    }
  };

  const handlePlusButtonHover = (e, isEntering) => {
    // Removed - now handled by SketchyButton
  };

  const handleGroupAllButtonHover = (e, isEntering) => {
    // Removed - now handled by SketchyButton
  };

  if (isLoading) {
    return (
      <div style={styles.app}>
        <header style={styles.header}>
          <h1 style={styles.title}>~My Tabs~</h1>
        </header>
        <main style={styles.main}>
          <div style={styles.loadingMessage}>Loading tabs...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.app}>
        <header style={styles.header}>
          <h1 style={styles.title}>~My Tabs~</h1>
        </header>
        <main style={styles.main}>
          <div style={styles.loadingMessage}>
            <p>Error: {error}</p>
            <p>Extension is running in development mode.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>~My Tabs~</h1>
          
          <div style={styles.buttonGroup}>
            <SketchyButton
              variant="primary"
              onClick={() => handleGroupTabs()}
              disabled={isGrouping}
              title="Group all tabs"
              size="medium"
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: STYLES.colors.white,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '12px 20px',
                fontSize: '16px'
              }}
            >
              {isGrouping ? 'Grouping...' : 'Group All'}
            </SketchyButton>
            
            <SketchyButton
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
              title="Create new tab group"
              size="medium"
              style={{ 
                color: STYLES.colors.text,
                fontSize: '24px',
                fontWeight: '300',
                padding: '12px 20px'
              }}
            >
              +
            </SketchyButton>
          </div>
        </div>
      </header>
      
      <main style={styles.main}>
        <div style={styles.tabGroupsContainer}>
          {Object.entries(tabGroups).map(([groupName, tabs]) => (
            <TabGroup
              key={groupName}
              title={groupName}
              tabs={tabs}
              onTabClick={handleTabClick}
              isCustomGroup={isCustomGroup(groupName)}
              onEditGroup={handleEditGroup}
              onDeleteGroup={deleteGroup}
              onGroupTabs={handleGroupTabs}
              isGrouping={isGrouping}
            />
          ))}
        </div>
      </main>
      
      <CreateTabGroupModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreateGroup={handleCreateOrUpdate}
        editingGroup={editingGroup}
      />
    </div>
  );
};

export default App;
