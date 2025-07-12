import React, { useRef, useEffect, useState } from 'react';
import rough from 'roughjs';

const SketchyButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  size = 'medium',
  style = {},
  title,
  type = 'button',
  className = '',
  strokeColor = null,
  ...props 
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [buttonId] = useState(Math.random().toString(36).substr(2, 9)); // Consistent seed

  const variants = {
    primary: {
      normal: { stroke: '#667eea', fill: '#667eea', textColor: 'white' },
      hover: { stroke: '#5a67d8', fill: '#5a67d8', textColor: 'white' }
    },
    secondary: {
      normal: { stroke: '#e2e8f0', fill: '#f7fafc', textColor: '#4a5568' },
      hover: { stroke: '#cbd5e0', fill: '#edf2f7', textColor: '#2d3748' }
    },
    danger: {
      normal: { stroke: '#feb2b2', fill: '#fed7d7', textColor: '#c53030' },
      hover: { stroke: '#f56565', fill: '#f56565', textColor: 'white' }
    },
    success: {
      normal: { stroke: '#9ae6b4', fill: '#c6f6d5', textColor: '#2f855a' },
      hover: { stroke: '#68d391', fill: '#68d391', textColor: 'white' }
    }
  };

  const sizes = {
    small: { padding: '6px 12px', fontSize: '12px', minHeight: '28px' },
    medium: { padding: '8px 16px', fontSize: '14px', minHeight: '36px' },
    large: { padding: '12px 24px', fontSize: '16px', minHeight: '44px' }
  };

  useEffect(() => {
    if (svgRef.current && containerRef.current && !disabled) {
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
        const currentVariant = variants[variant];
        const currentState = isHovered ? currentVariant.hover : currentVariant.normal;
        
        // Use custom stroke color if provided, otherwise use variant stroke
        const finalStrokeColor = strokeColor || currentState.stroke;
        
        // Draw sketchy rectangle
        const sketchyRect = rc.rectangle(2, 2, width - 4, height - 4, {
          stroke: finalStrokeColor,
          strokeWidth: isHovered ? 2.5 : 2,
          fill: currentState.fill,
          fillStyle: 'solid',
          roughness: 1.1,
          bowing: 0.6,
          seed: buttonId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) // Consistent seed
        });
        
        svg.appendChild(sketchyRect);
      }
    }
  }, [isHovered, variant, disabled, buttonId, strokeColor]);

  const currentVariant = variants[variant];
  const currentSize = sizes[size];
  const currentState = isHovered && !disabled ? currentVariant.hover : currentVariant.normal;

  const buttonStyles = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: disabled ? '#f7fafc' : 'transparent',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: '600',
    textTransform: 'none',
    opacity: disabled ? 0.5 : 1,
    color: disabled ? '#a0aec0' : currentState.textColor,
    transform: isHovered && !disabled ? 'translateY(-1px)' : 'translateY(0)',
    ...currentSize,
    ...style
  };

  const svgStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0
  };

  const contentStyles = {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  };

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!disabled) setIsHovered(false);
  };

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      ref={containerRef}
      style={buttonStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      title={title}
      type={type}
      className={className}
      {...props}
    >
      {!disabled && <svg ref={svgRef} style={svgStyles} />}
      <div style={contentStyles}>
        {children}
      </div>
    </button>
  );
};

export default SketchyButton;
