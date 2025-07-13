import React, { useState } from 'react';
import TabGroup from './components/TabGroup';
import CreateTabGroupModal from './components/CreateTabGroupModal';
import SketchyButton from './components/SketchyButton';
import RoughHeader from './components/RoughHeader';
import Logo from './components/Logo';
import { useTabGroups } from './hooks/useTabGroups';
import { STYLES } from './constants.js';

const App = () => {
  const [isGrouping, setIsGrouping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    const group = userTabGroups.find(g => g.name === groupName);
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
      await createTabGroup(...args);
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
    header: {
      padding: '8px',
      textAlign: 'center',
      position: 'relative'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px'
    },
    title: {
      margin: 0,
      color: STYLES.colors.text,
      fontSize: '28px',
      fontWeight: '300',
      textShadow: '0 3px 6px rgba(0, 0, 0, 0.4)',
      letterSpacing: '2px',
      textAlign: 'left'
    },
    buttonGroup: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
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
    }
  };


  if (isLoading) {
    return (
      <div style={styles.app}>
        <RoughHeader style={styles.header}>
          <Logo color={STYLES.colors.white}/>
        </RoughHeader>
        <main style={styles.main}>
          <div style={styles.loadingMessage}>Loading tabs...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.app}>
        <RoughHeader style={styles.header}>
          <Logo color={STYLES.colors.white}/>
        </RoughHeader>
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
      <RoughHeader style={styles.header}>
        <div style={styles.headerContent}>
          <Logo color={STYLES.colors.white} />
          
          <div style={styles.buttonGroup}>
            <SketchyButton
              variant="secondary"
              onClick={() => handleGroupTabs()}
              disabled={isGrouping}
              title="Group all tabs"
              size="medium"
              strokeColor="rgba(120, 120, 120, 1)"
              style={{ 
                color: STYLES.colors.primary,
                fontSize: '18px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: '12px 10px',
                whiteSpace: 'nowrap'
              }}
            >
              {isGrouping ? 'Grouping...' : 'Group All'}
            </SketchyButton>
            
            <SketchyButton
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
              title="Create new tab group"
              size="medium"
              strokeColor="rgba(120, 120, 120, 1)"
              style={{ 
                color: STYLES.colors.primary,
                fontSize: '22px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: '12px 20px'
              }}
            >
              +
            </SketchyButton>
          </div>
        </div>
      </RoughHeader>
      
      <main style={styles.main}>
        <div style={styles.tabGroupsContainer}>
          {Object.entries(tabGroups).map(([groupName, tabs]) => (
            <TabGroup
              key={groupName}
              title={groupName}
              tabs={tabs}
              onTabClick={handleTabClick}
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
