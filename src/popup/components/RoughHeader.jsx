import React, { useRef, useEffect } from 'react';
import rough from 'roughjs';
import { STYLES } from '../constants.js';

const RoughHeader = ({ children, style }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;

    const rc = rough.canvas(canvas);
    const ctx = canvas.getContext('2d');
    
    // Get container dimensions
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size with device pixel ratio for crisp rendering
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // Scale context to match device pixel ratio
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw hachure background
    rc.rectangle(0, 0, rect.width, rect.height, {
      fill: STYLES.colors.primary,
      fillStyle: 'hachure',
      hachureAngle: 45,
      hachureGap: 4,
      fillWeight: 3,
      stroke: 'none',
      roughness: 1.5
    });
    
    // Add a subtle border at the bottom
    rc.line(0, rect.height - 1, rect.width, rect.height - 1, {
      stroke: 'rgba(255, 255, 255, 0.3)',
      strokeWidth: 2,
      roughness: 0.5
    });
    
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      if (!canvas || !container) return;

      const rc = rough.canvas(canvas);
      const ctx = canvas.getContext('2d');
      
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      rc.rectangle(0, 0, rect.width, rect.height, {
        fill: STYLES.colors.primary,
        fillStyle: 'solid',
        fillWeight: 2,
        stroke: 'none',
        roughness: 1.5
      });
      
      rc.line(0, rect.height - 1, rect.width, rect.height - 1, {
        stroke: 'rgba(255, 255, 255, 0.3)',
        strokeWidth: 2,
        roughness: 0.5
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  const canvasStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    height: '100%'
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <canvas ref={canvasRef} style={canvasStyle} />
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

export default RoughHeader;
