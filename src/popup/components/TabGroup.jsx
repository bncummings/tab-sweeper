import React, { useRef, useEffect, useState } from 'react';
import rough from 'roughjs';
import TabItem from './TabItem';
import SketchyButton from './SketchyButton';
import { STYLES } from '../constants.js';
import groupIcon from '../../images/group.svg';

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

const GroupIcon = () => (
  <img 
    src={groupIcon} 
    alt="Group" 
    width="16" 
    height="16" 
    style={{ filter: 'invert(1)' }} // Make it white to match other icons
  />
);

const ChevronIcon = ({ isExpanded }) => {
  const svgRef = useRef(null);
  const [iconId] = useState(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    if (svgRef.current) {
      const svg = svgRef.current;
      svg.innerHTML = '';
      
      const rc = rough.svg(svg);
      
      // Draw a sketchy chevron/arrow pointing down
      const size = 12;
      const centerX = 12;
      const centerY = 12;
      
      if (isExpanded) {
        // Up arrow (expanded state)
        const path = rc.path(`M ${centerX - size/2} ${centerY + size/4} L ${centerX} ${centerY - size/4} L ${centerX + size/2} ${centerY + size/4}`, {
          stroke: 'currentColor',
          strokeWidth: 2,
          fill: 'none',
          roughness: 1.2,
          bowing: 0.8,
          seed: iconId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
        });
        svg.appendChild(path);
      } else {
        // Down arrow (collapsed state)
        const path = rc.path(`M ${centerX - size/2} ${centerY - size/4} L ${centerX} ${centerY + size/4} L ${centerX + size/2} ${centerY - size/4}`, {
          stroke: 'currentColor',
          strokeWidth: 2,
          fill: 'none',
          roughness: 1.2,
          bowing: 0.8,
          seed: iconId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
        });
        svg.appendChild(path);
      }
    }
  }, [isExpanded, iconId]);

  return (
    <svg 
      ref={svgRef}
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      style={{ 
        transition: 'all 0.2s ease',
        color: 'inherit'
      }}
    />
  );
};

const ActionButton = ({ variant, onClick, title, children, disabled }) => (
  <SketchyButton
    variant={variant}
    onClick={onClick}
    title={title}
    size="small"
    disabled={disabled}
    style={{ width: '28px', height: '28px', padding: '6px' }}
  >
    {children}
  </SketchyButton>
);

const TabGroup = ({ title, tabs, onTabClick, onEditGroup, onDeleteGroup, onGroupTabs, isGrouping }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [groupId] = useState(Math.random().toString(36).substr(2, 9)); // Consistent seed

  // Helper function to truncate title if too long
  const getTruncatedTitle = (title) => {
    if (title.length > 10) {
      return title.substring(0, 10) + '...';
    }
    return title;
  };

  useEffect(() => {
    if (svgRef.current && containerRef.current) {
      const svg = svgRef.current;
      const container = containerRef.current;
      
      // Clear previous drawings
      svg.innerHTML = '';
      
      // Set SVG dimensions to match container
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.position = 'absolute';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.pointerEvents = 'none';
      svg.style.zIndex = '0';
      
      const rc = rough.svg(svg);
      
      // Get actual dimensions for drawing
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      
      if (width > 0 && height > 0) {
        // Draw sketchy rectangle for the group container
        const sketchyRect = rc.rectangle(3, 3, width - 6, height - 6, {
          stroke: isHovered ? STYLES.colors.primary : 'rgba(0,0,0,0.5)',//'rgba(255, 255, 255, 0.6)',
          strokeWidth: isHovered ? 2.5 : 2,
          fill: 'rgba(255, 255, 255, 0.95)',
          fillStyle: 'solid',
          roughness: 1.3,
          bowing: 0.9,
          seed: groupId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) // Consistent seed
        });
        
        svg.appendChild(sketchyRect);
      }
    }
  }, [isHovered, groupId, isExpanded]);

  const styles = {
    container: {
      position: 'relative',
      marginBottom: '14px',
      background: 'transparent', // Let rough.js handle the background
      padding: '12px',
      paddingRight: '18px', // Extra padding on right to accommodate hover animations
      cursor: 'default',
      transition: STYLES.transitions.default,
      transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      minHeight: isExpanded ? '80px' : 'auto', // Adjust height based on expanded state
      overflow: 'visible' // Ensure hover animations are visible
    },
    title: {
      position: 'relative',
      zIndex: 1,
      margin: '0 0 12px 0',
      fontSize: '20px',
      fontWeight: '800',
      color: STYLES.colors.text,
      paddingBottom: '8px',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    titleWithActions: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isExpanded ? '8px' : '0',
      cursor: 'pointer'
    },
    titleText: {
      fontSize: '20px',
      fontWeight: '800',
      color: STYLES.colors.text,
      paddingBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    actions: {
      display: 'flex',
      gap: '6px',
      alignItems: 'center'
    },
    tabList: {
      position: 'relative',
      zIndex: 1,
      display: isExpanded ? 'flex' : 'none',
      flexDirection: 'column',
      gap: '8px',
      opacity: isExpanded ? 1 : 0,
      maxHeight: isExpanded ? 'none' : '0',
      overflow: 'visible', // Changed from 'hidden' to 'visible' to show hover animations
      transition: 'opacity 0.3s ease, max-height 0.3s ease',
      paddingRight: '2px' // Add padding to accommodate the hover animation
    },
    emptyMessage: {
      position: 'relative',
      zIndex: 1,
      textAlign: 'center',
      padding: '16px',
      color: STYLES.colors.muted,
      fontStyle: 'italic'
    },
    svg: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0
    }
  };

  const handleContainerMouseEnter = () => {
    setIsHovered(true);
  };

  const handleContainerMouseLeave = () => {
    setIsHovered(false);
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete the "${title}" group?`)) {
      onDeleteGroup(title);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      ref={containerRef}
      style={styles.container}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      <svg ref={svgRef} style={styles.svg} />
      <div style={styles.titleWithActions} onClick={toggleExpanded}>
        <h2 style={styles.titleText} title={title}>
          <ChevronIcon isExpanded={isExpanded} />
          {getTruncatedTitle(title)}
        </h2>
        <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
          <ActionButton
            variant="primary"
            onClick={() => onGroupTabs(title)}
            disabled={isGrouping}
            title={`Group tabs matching "${title}" pattern`}
          >
            <GroupIcon />
          </ActionButton>
          <ActionButton
            variant="secondary"
            onClick={() => onEditGroup(title)}
            title="Edit group"
          >
            <EditIcon />
          </ActionButton>
          <ActionButton
            variant="danger"
            onClick={handleDeleteClick}
            title="Delete group"
          >
            <DeleteIcon />
          </ActionButton>
        </div>
      </div>
      
      <div style={styles.tabList}>
        {tabs.length > 0 ? (
          tabs.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              onClick={onTabClick}
            />
          ))
        ) : (
          <div style={styles.emptyMessage}>
            No tabs yet
          </div>
        )}
      </div>
    </div>
  );
};

export default TabGroup;
