import React, { useState } from 'react';
import TabGroup from './components/TabGroup';
import CreateTabGroupModal from './components/CreateTabGroupModal';
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

  const handleGroupTabs = async () => {
    setIsGrouping(true);
    try {
      for (const [groupName, tabs] of Object.entries(tabGroups)) {
        if (tabs.length === 0) continue;
        
        const tabIds = tabs.map(({ id }) => id);
        const tabGroup = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(tabGroup, { title: groupName });
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
    title: {
      margin: 0,
      color: STYLES.colors.white,
      fontSize: '28px',
      fontWeight: '300',
      textShadow: '0 3px 6px rgba(0, 0, 0, 0.4)',
      letterSpacing: '2px'
    },
    plusButton: {
      position: 'absolute',
      right: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.2)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      color: STYLES.colors.white,
      fontSize: '24px',
      fontWeight: '300',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: STYLES.transitions.default,
      backdropFilter: 'blur(10px)'
    },
    main: {
      flex: 1,
      padding: '24px',
      overflowY: 'auto'
    },
    tabGroupsContainer: {
      marginBottom: '24px'
    },
    actions: {
      display: 'flex',
      justifyContent: 'center',
      padding: '20px 0'
    },
    groupButton: {
      background: `linear-gradient(135deg, ${STYLES.colors.primary} 0%, ${STYLES.colors.secondary} 100%)`,
      color: STYLES.colors.white,
      border: 'none',
      borderRadius: '30px',
      padding: '14px 40px',
      fontSize: '18px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: STYLES.transitions.default,
      boxShadow: STYLES.shadows.button,
      minWidth: '140px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    loadingMessage: {
      textAlign: 'center',
      padding: '40px',
      color: STYLES.colors.white
    }
  };

  const handlePlusButtonHover = (e, isEntering) => {
    if (isEntering) {
      Object.assign(e.currentTarget.style, {
        background: 'rgba(255, 255, 255, 0.3)',
        transform: 'translateY(-50%) scale(1.1)',
        boxShadow: '0 5px 15px rgba(255, 255, 255, 0.3)'
      });
    } else {
      Object.assign(e.currentTarget.style, {
        background: 'rgba(255, 255, 255, 0.2)',
        transform: 'translateY(-50%) scale(1)',
        boxShadow: 'none'
      });
    }
  };

  const handleGroupButtonHover = (e, isEntering) => {
    if (!isGrouping && isEntering) {
      Object.assign(e.currentTarget.style, {
        transform: 'translateY(-3px)',
        boxShadow: STYLES.shadows.buttonHover
      });
    } else if (!isGrouping) {
      Object.assign(e.currentTarget.style, {
        transform: 'translateY(0)',
        boxShadow: STYLES.shadows.button
      });
    }
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
        <h1 style={styles.title}>~My Tabs~</h1>
        <button
          style={styles.plusButton}
          onClick={() => setIsModalOpen(true)}
          onMouseEnter={(e) => handlePlusButtonHover(e, true)}
          onMouseLeave={(e) => handlePlusButtonHover(e, false)}
          title="Create new tab group"
        >
          +
        </button>
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
            />
          ))}
        </div>
        
        <div style={styles.actions}>
          <button
            style={styles.groupButton}
            onClick={handleGroupTabs}
            disabled={isGrouping}
            onMouseEnter={(e) => handleGroupButtonHover(e, true)}
            onMouseLeave={(e) => handleGroupButtonHover(e, false)}
          >
            {isGrouping ? 'Grouping...' : 'Group Tabs'}
          </button>
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
