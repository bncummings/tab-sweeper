import React from 'react';

const Logo = ({ width = 220, height = 80, color = '#333' }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      <img 
        src="images/tabsweeper.svg" 
        alt="Tab Sweeper Logo" 
        style={{ 
          width: width + 'px', 
          height: height + 'px', 
          display: 'block',
          filter: 'brightness(0) invert(1)',
          maxWidth: '100%',
          objectFit: 'contain'
        }} 
      />

    </div>
  );
};

export default Logo;
