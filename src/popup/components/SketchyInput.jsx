import React, { useRef, useEffect, useState } from 'react';
import rough from 'roughjs';
import { STYLES } from '../constants.js';

const SketchyInput = ({ 
  value, 
  onChange, 
  placeholder,
  disabled = false,
  style = {},
  onFocus,
  onBlur,
  type = "text",
  ...props 
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [inputId] = useState(Math.random().toString(36).substr(2, 9)); // Consistent seed

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
        // Draw sketchy rectangle for input
        const sketchyRect = rc.rectangle(2, 2, width - 4, height - 4, {
          stroke: isFocused ? STYLES.colors.primary : STYLES.colors.border,
          strokeWidth: isFocused ? 2.5 : 2,
          fill: disabled ? '#f7fafc' : STYLES.colors.white,
          fillStyle: 'solid',
          roughness: 1.1,
          bowing: 0.7,
          seed: inputId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) // Consistent seed
        });
        
        svg.appendChild(sketchyRect);
      }
    }
  }, [isFocused, disabled, inputId]);

  const containerStyles = {
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    ...style
  };

  const inputStyles = {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    fontSize: '16px',
    outline: 'none',
    fontFamily: 'inherit',
    color: disabled ? '#a0aec0' : STYLES.colors.text,
    cursor: disabled ? 'not-allowed' : 'text',
    boxSizing: 'border-box'
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

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div ref={containerRef} style={containerStyles}>
      {!disabled && <svg ref={svgRef} style={svgStyles} />}
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyles}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    </div>
  );
};

export default SketchyInput;
