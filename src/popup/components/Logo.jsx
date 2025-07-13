
import React from 'react';

const Logo = ({ width = 220, height = 80, color = '#333' }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      <img 
        src="images/logo2.svg" 
        alt="Documentation Tab Grouper Logo" 
        style={{ 
          width: width + 'px', 
          height: height + 'px', 
          display: 'block',
          filter: color === '#333' ? 'none' : 'brightness(0) invert(1)',
          maxWidth: '100%',
          objectFit: 'contain'
        }} 
      />
      {/* <span style={{
        fontSize: `${height * 0.4}px`,
        fontWeight: 'bold',
        color: color === '#333' ? '#333' : 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        letterSpacing: '1px'
      }}>
        tabby
      </span> */}
    </div>
  );
};

export default Logo;
