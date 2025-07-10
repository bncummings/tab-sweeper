import React from 'react';
import { extractTabTitle, extractPathname } from '../utils.js';
import { STYLES } from '../constants.js';

const TabItem = ({ tab, onClick }) => {
  const tabTitle = extractTabTitle(tab.title);
  const pathname = extractPathname(tab.url);

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      background: STYLES.colors.background,
      borderRadius: '12px',
      cursor: 'pointer',
      transition: STYLES.transitions.default,
      border: '2px solid transparent',
      boxShadow: '0 3px 6px rgba(0, 0, 0, 0.08)'
    },
    content: {
      flex: 1,
      minWidth: 0
    },
    title: {
      margin: '0 0 6px 0',
      fontSize: '15px',
      fontWeight: '600',
      color: STYLES.colors.text,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    pathname: {
      margin: 0,
      fontSize: '13px',
      color: STYLES.colors.muted,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    favicon: {
      flexShrink: 0,
      marginLeft: '16px'
    },
    faviconImg: {
      width: '18px',
      height: '18px',
      borderRadius: '3px'
    }
  };

  const handleMouseEnter = (e) => {
    Object.assign(e.currentTarget.style, {
      background: '#e6f3ff',
      borderColor: STYLES.colors.primary,
      transform: 'translateX(8px)',
      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.2)'
    });
  };

  const handleMouseLeave = (e) => {
    Object.assign(e.currentTarget.style, {
      background: STYLES.colors.background,
      borderColor: 'transparent',
      transform: 'translateX(0)',
      boxShadow: '0 3px 6px rgba(0, 0, 0, 0.08)'
    });
  };

  return (
    <div 
      style={styles.container}
      onClick={() => onClick(tab)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={styles.content}>
        <h3 style={styles.title}>{tabTitle}</h3>
        <p style={styles.pathname}>{pathname}</p>
      </div>
      <div style={styles.favicon}>
        {tab.favIconUrl && (
          <img 
            src={tab.favIconUrl} 
            alt="favicon" 
            style={styles.faviconImg}
          />
        )}
      </div>
    </div>
  );
};

export default TabItem;
