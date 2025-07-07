import React from 'react';
import TabItem from './TabItem';

const TabGroup = ({ title, tabs, onTabClick, isCustomGroup, onEditGroup, onDeleteGroup }) => {
  if (tabs.length === 0) {
    return null;
  }

  const tabGroupStyle = {
    marginBottom: '24px',
    background: '#ffffff',
    borderRadius: '18px',
    padding: '24px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    border: '2px solid rgba(255, 255, 255, 0.9)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default'
  };

  const groupTitleStyle = {
    margin: '0 0 18px 0',
    fontSize: '22px',
    fontWeight: '800',
    color: '#2d3748',
    borderBottom: '4px solid #667eea',
    paddingBottom: '14px',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    position: 'relative'
  };

  const titleActionsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px'
  };

  const titleTextStyle = {
    fontSize: '22px',
    fontWeight: '800',
    color: '#2d3748',
    borderBottom: '4px solid #667eea',
    paddingBottom: '14px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    flex: 1,
    textAlign: 'center'
  };

  const actionsStyle = {
    display: 'flex',
    gap: '8px',
    position: 'absolute',
    top: '0',
    right: '0'
  };

  const actionButtonStyle = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  };

  const editButtonStyle = {
    ...actionButtonStyle,
    background: '#e2e8f0',
    color: '#4a5568'
  };

  const deleteButtonStyle = {
    ...actionButtonStyle,
    background: '#fed7d7',
    color: '#c53030'
  };

  const tabListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  return (
    <div 
      style={tabGroupStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      }}
    >
      {isCustomGroup ? (
        <div style={titleActionsStyle}>
          <h2 style={titleTextStyle}>{title}</h2>
          <div style={actionsStyle}>
            <button
              style={editButtonStyle}
              onClick={() => onEditGroup(title)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#cbd5e0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
              }}
              title="Edit group"
            >
              Edit
            </button>
            <button
              style={deleteButtonStyle}
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete the "${title}" group?`)) {
                  onDeleteGroup(title);
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fed7d7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f56565';
              }}
              title="Delete group"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <h2 style={groupTitleStyle}>{title}</h2>
      )}
      <div style={tabListStyle}>
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            onClick={() => onTabClick(tab)}
          />
        ))}
      </div>
    </div>
  );
};

export default TabGroup;
