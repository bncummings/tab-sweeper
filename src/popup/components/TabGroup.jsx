import React, { useRef, useEffect, useState } from 'react';
import rough from 'roughjs';
import TabItem from './TabItem';
import SketchyButton from './SketchyButton';
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

const ActionButton = ({ variant, onClick, title, children, disabled }) => (
  <SketchyButton
    variant={variant}
    onClick={onClick}
    title={title}
    size="small"
    disabled={disabled}
    style={{ width: '32px', height: '32px', padding: '8px' }}
  >
    {children}
  </SketchyButton>
);

const TabGroup = ({ title, tabs, onTabClick, isCustomGroup, onEditGroup, onDeleteGroup, onGroupTabs, isGrouping }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [groupId] = useState(Math.random().toString(36).substr(2, 9)); // Consistent seed

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
  }, [isHovered, groupId]);

  if (tabs.length === 0) return null;

  const styles = {
    container: {
      position: 'relative',
      marginBottom: '24px',
      background: 'transparent', // Let rough.js handle the background
      padding: '24px',
      cursor: 'default',
      transition: STYLES.transitions.default,
      transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      minHeight: '120px' // Ensure consistent height for drawing
    },
    title: {
      position: 'relative',
      zIndex: 1,
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
      position: 'relative',
      zIndex: 1,
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
    tabList: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    emptyMessage: {
      position: 'relative',
      zIndex: 1,
      textAlign: 'center',
      padding: '20px',
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
    },
    emptyMessage: {
      position: 'relative',
      zIndex: 1,
      textAlign: 'center',
      padding: '20px',
      color: STYLES.colors.muted,
      fontStyle: 'italic'
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

  const handleGroupButtonHover = (e, isHover) => {
    // Removed - now handled by SketchyButton
  };

  return (
    <div 
      ref={containerRef}
      style={styles.container}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      <svg ref={svgRef} style={styles.svg} />
      {isCustomGroup ? (
        <div style={styles.titleWithActions}>
          <h2 style={styles.titleText}>{title}</h2>
          <div style={styles.actions}>
            <SketchyButton
              variant="primary"
              onClick={() => onGroupTabs(title)}
              disabled={isGrouping}
              title={`Group tabs matching "${title}" pattern`}
              size="small"
              style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '80px' }}
            >
              {isGrouping ? 'Grouping...' : 'Group This'}
            </SketchyButton>
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
      ) : (
        <div style={styles.titleWithActions}>
          <h2 style={styles.titleText}>{title}</h2>
          <div style={styles.actions}>
            <SketchyButton
              variant="primary"
              onClick={() => onGroupTabs(title)}
              disabled={isGrouping}
              title={`Group tabs for "${title}"`}
              size="small"
              style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '80px' }}
            >
              {isGrouping ? 'Grouping...' : 'Group This'}
            </SketchyButton>
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
