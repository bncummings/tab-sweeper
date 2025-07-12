import React, { useRef, useEffect, useState } from 'react';
import rough from 'roughjs';
import { extractTabTitle, extractPathname } from '../utils.js';
import { STYLES } from '../constants.js';

const TabItem = ({ tab, onClick }) => {
  const tabTitle = extractTabTitle(tab.title);
  const pathname = extractPathname(tab.url);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (svgRef.current && containerRef.current) {
      const svg = svgRef.current;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
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
        // Draw sketchy rectangle
        const sketchyRect = rc.rectangle(2, 2, width - 4, height - 4, {
          stroke: isHovered ? STYLES.colors.primary : '#e0e0e0',
          strokeWidth: isHovered ? 2.5 : 1.5,
          fill: isHovered ? '#e6f3ff' : STYLES.colors.background,
          fillStyle: 'solid',
          roughness: 1.2,
          bowing: 0.8,
          seed: tab.id || Math.floor(Math.random() * 1000) // Consistent seed for this tab
        });
        
        svg.appendChild(sketchyRect);
      }
    }
  }, [isHovered, tab.id]);

  const styles = {
    container: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      background: 'transparent', // Let rough.js handle the background
      cursor: 'pointer',
      transition: STYLES.transitions.default,
      transform: isHovered ? 'translateX(8px)' : 'translateX(0)',
      minHeight: '60px' // Ensure consistent height
    },
    content: {
      flex: 1,
      minWidth: 0,
      position: 'relative',
      zIndex: 1
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
      marginLeft: '16px',
      position: 'relative',
      zIndex: 1
    },
    faviconImg: {
      width: '18px',
      height: '18px',
      borderRadius: '3px'
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

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      ref={containerRef}
      style={styles.container}
      onClick={() => onClick(tab)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <svg ref={svgRef} style={styles.svg} />
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
