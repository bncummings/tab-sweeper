import React from 'react';
import TabItem from './TabItem';
import { STYLES } from '../constants.js';

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const ActionButton = ({ style, onClick, onMouseEnter, onMouseLeave, title, children }) => (
  <button
    style={style}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    title={title}
  >
    {children}
  </button>
);

const TabGroup = ({ title, tabs, onTabClick, isCustomGroup, onEditGroup, onDeleteGroup, onGroupTabs, isGrouping }) => {
  if (tabs.length === 0) return null;

  const styles = {
    container: {
      marginBottom: '24px',
      background: STYLES.colors.white,
      borderRadius: '18px',
      padding: '24px',
      boxShadow: STYLES.shadows.card,
      border: '2px solid rgba(255, 255, 255, 0.9)',
      transition: STYLES.transitions.default,
      cursor: 'default'
    },
    title: {
      margin: '0 0 18px 0',
      fontSize: '22px',
      fontWeight: '800',
      color: STYLES.colors.text,
      borderBottom: `4px solid ${STYLES.colors.primary}`,
      paddingBottom: '14px',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    titleWithActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '18px'
    },
    titleText: {
      fontSize: '22px',
      fontWeight: '800',
      color: STYLES.colors.text,
      borderBottom: `4px solid ${STYLES.colors.primary}`,
      paddingBottom: '14px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      textAlign: 'left'
    },
    actions: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    actionButton: {
      padding: '8px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: STYLES.transitions.default,
      width: '32px',
      height: '32px'
    },
    editButton: {
      background: STYLES.colors.border,
      color: '#4a5568'
    },
    deleteButton: {
      background: STYLES.colors.dangerBg,
      color: STYLES.colors.danger
    },
    groupButton: {
      background: STYLES.colors.primary,
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: STYLES.transitions.default,
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      opacity: isGrouping ? 0.6 : 1,
      minWidth: '80px'
    },
    tabList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    emptyMessage: {
      textAlign: 'center',
      padding: '20px',
      color: STYLES.colors.muted,
      fontStyle: 'italic'
    }
  };

  const handleContainerMouseEnter = (e) => {
    Object.assign(e.currentTarget.style, {
      transform: 'translateY(-4px)',
      boxShadow: STYLES.shadows.cardHover
    });
  };

  const handleContainerMouseLeave = (e) => {
    Object.assign(e.currentTarget.style, {
      transform: 'translateY(0)',
      boxShadow: STYLES.shadows.card
    });
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete the "${title}" group?`)) {
      onDeleteGroup(title);
    }
  };

  const handleGroupButtonHover = (e, isHover) => {
    if (!isGrouping) {
      e.target.style.backgroundColor = isHover ? '#2563eb' : STYLES.colors.primary;
    }
  };

  return (
    <div 
      style={styles.container}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      {isCustomGroup ? (
        <div style={styles.titleWithActions}>
          <h2 style={styles.titleText}>{title}</h2>
          <div style={styles.actions}>
            <button
              style={styles.groupButton}
              onClick={() => onGroupTabs(title)}
              disabled={isGrouping}
              onMouseEnter={(e) => handleGroupButtonHover(e, true)}
              onMouseLeave={(e) => handleGroupButtonHover(e, false)}
              title={`Group tabs matching "${title}" pattern`}
            >
              {isGrouping ? 'Grouping...' : 'Group This'}
            </button>
            <ActionButton
              style={{ ...styles.actionButton, ...styles.editButton }}
              onClick={() => onEditGroup(title)}
              onMouseEnter={(e) => e.currentTarget.style.background = '#cbd5e0'}
              onMouseLeave={(e) => e.currentTarget.style.background = STYLES.colors.border}
              title="Edit group"
            >
              <EditIcon />
            </ActionButton>
            <ActionButton
              style={{ ...styles.actionButton, ...styles.deleteButton }}
              onClick={handleDeleteClick}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f56565'}
              onMouseLeave={(e) => e.currentTarget.style.background = STYLES.colors.dangerBg}
              title="Delete group"
            >
              <DeleteIcon />
            </ActionButton>
          </div>
        </div>
      ) : (
        <div style={styles.titleWithActions}>
          <h2 style={styles.titleText}>{title}</h2>
          <div style={styles.actions}>
            <button
              style={styles.groupButton}
              onClick={() => onGroupTabs(title)}
              disabled={isGrouping}
              onMouseEnter={(e) => handleGroupButtonHover(e, true)}
              onMouseLeave={(e) => handleGroupButtonHover(e, false)}
              title={`Group tabs for "${title}"`}
            >
              {isGrouping ? 'Grouping...' : 'Group This'}
            </button>
          </div>
        </div>
      )}
      
      <div style={styles.tabList}>
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            onClick={onTabClick}
          />
        ))}
      </div>
    </div>
  );
};

export default TabGroup;
