import React from 'react';

const TabItem = ({ tab, onClick }) => {
  const tabTitle = tab.title.split('|')[0].trim();
  const pathname = new URL(tab.url).pathname;

  const tabItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    background: '#f8fafc',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '2px solid transparent',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.08)'
  };

  const tabContentStyle = {
    flex: 1,
    minWidth: 0
  };

  const tabTitleStyle = {
    margin: '0 0 6px 0',
    fontSize: '15px',
    fontWeight: '600',
    color: '#2d3748',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  const tabPathnameStyle = {
    margin: 0,
    fontSize: '13px',
    color: '#718096',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  const tabFaviconStyle = {
    flexShrink: 0,
    marginLeft: '16px'
  };

  const faviconImgStyle = {
    width: '18px',
    height: '18px',
    borderRadius: '3px'
  };

  return (
    <div 
      style={tabItemStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#e6f3ff';
        e.currentTarget.style.borderColor = '#667eea';
        e.currentTarget.style.transform = 'translateX(8px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#f8fafc';
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.08)';
      }}
    >
      <div style={tabContentStyle}>
        <h3 style={tabTitleStyle}>{tabTitle}</h3>
        <p style={tabPathnameStyle}>{pathname}</p>
      </div>
      <div style={tabFaviconStyle}>
        {tab.favIconUrl && (
          <img 
            src={tab.favIconUrl} 
            alt="favicon" 
            style={faviconImgStyle}
          />
        )}
      </div>
    </div>
  );
};

export default TabItem;
