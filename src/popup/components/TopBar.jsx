import React from 'react';
import SketchyButton from './SketchyButton';
import RoughHeader from './RoughHeader';
import Logo from './Logo';
import { STYLES } from '../constants.js';

const TopBar = ({ 
  leftButton = null, 
  rightButtons = [], 
  isGrouping = false,
  onGroupAll = null,
  onCreateNew = null,
  onBack = null
}) => {
  const styles = {
    header: {
      padding: '8px',
      textAlign: 'center',
      position: 'relative'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px'
    },
    buttonGroup: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    }
  };

  // Default main page buttons
  const defaultRightButtons = [
    {
      key: 'group-all',
      variant: 'secondary',
      onClick: onGroupAll,
      disabled: isGrouping,
      title: 'Group all tabs',
      size: 'medium',
      strokeColor: 'rgba(120, 120, 120, 1)',
      'data-testid': 'group-all-button',
      style: { 
        color: STYLES.colors.primary,
        fontSize: '14px',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        padding: '12px 10px',
        whiteSpace: 'nowrap'
      },
      children: isGrouping ? 'Grouping...' : 'Group All'
    },
    {
      key: 'create-new',
      variant: 'secondary',
      onClick: onCreateNew,
      title: 'Create new tab group',
      size: 'medium',
      strokeColor: 'rgba(120, 120, 120, 1)',
      'data-testid': 'create-group-button',
      style: { 
        color: STYLES.colors.primary,
        fontSize: '22px',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        padding: '8px 12px'
      },
      children: '+'
    }
  ];

  // Default back button for create/edit page
  const defaultBackButton = {
    key: 'back',
    variant: 'secondary',
    onClick: onBack,
    title: 'Back to groups',
    size: 'medium',
    strokeColor: 'rgba(120, 120, 120, 1)',
    style: { 
      color: STYLES.colors.primary,
      fontSize: '14px',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      padding: '12px 10px',
      whiteSpace: 'nowrap'
    },
    children: '← Back'
  };

  // Determine which buttons to show
  let buttonsToRender = rightButtons;
  
  // If no custom buttons provided, use defaults based on available handlers
  if (rightButtons.length === 0) {
    if (onGroupAll && onCreateNew) {
      buttonsToRender = defaultRightButtons;
    } else if (onBack) {
      buttonsToRender = [defaultBackButton];
    }
  }

  return (
    <RoughHeader style={styles.header}>
      <div style={styles.headerContent}>
        <Logo color={STYLES.colors.white} />
        
        <div style={styles.buttonGroup}>
          {buttonsToRender.map((button) => (
            <SketchyButton
              key={button.key}
              variant={button.variant}
              onClick={button.onClick}
              disabled={button.disabled}
              title={button.title}
              size={button.size}
              strokeColor={button.strokeColor}
              data-testid={button['data-testid']}
              style={button.style}
            >
              {button.children}
            </SketchyButton>
          ))}
        </div>
      </div>
    </RoughHeader>
  );
};

export default TopBar;