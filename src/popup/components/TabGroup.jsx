import React from 'react';
import TabItem from './TabItem';

const TabGroup = ({ title, tabs, onTabClick }) => {
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
    letterSpacing: '1px'
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
      <h2 style={groupTitleStyle}>{title}</h2>
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
