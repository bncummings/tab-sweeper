import React from 'react';
import { MATCHER_TYPES, STYLES } from '../constants.js';

const TypeIcon = ({ type }) => {
  switch (type) {
    case MATCHER_TYPES.PREFIX:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5 3A6.5 6.5 0 0 0 7 9.5c0 3.6 2.9 6.5 6.5 6.5s6.5-2.9 6.5-6.5S17.1 3 13.5 3m2.5 9.5-4-4V5h1.5v3L16 10.5V12.5z"/>
        </svg>
      );
    case MATCHER_TYPES.REGEX:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H9v-1.5h6V18zm0-3H9v-1.5h6V15zm0-3H9V10.5h6V12z"/>
        </svg>
      );
    case MATCHER_TYPES.GLOB:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    default:
      return null;
  }
};

const getPlaceholder = (type) => {
  switch (type) {
    case MATCHER_TYPES.PREFIX:
      return 'e.g., https://react.dev/';
    case MATCHER_TYPES.REGEX:
      return 'e.g., ^https://.*\\.github\\.io/.*';
    case MATCHER_TYPES.GLOB:
      return 'e.g., https://*/docs/**';
    default:
      return '';
  }
};

const getTooltip = (type) => {
  switch (type) {
    case MATCHER_TYPES.PREFIX:
      return 'Switch to regex';
    case MATCHER_TYPES.REGEX:
      return 'Switch to glob';
    case MATCHER_TYPES.GLOB:
      return 'Switch to URL prefix';
    default:
      return '';
  }
};

const MatcherInput = ({ 
  matcher, 
  index, 
  onChange, 
  onTypeToggle, 
  onRemove, 
  canRemove, 
  disabled 
}) => {
  const styles = {
    container: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    inputContainer: {
      position: 'relative',
      flex: 1
    },
    input: {
      padding: '12px 50px 12px 16px',
      border: `2px solid ${STYLES.colors.border}`,
      borderRadius: '8px',
      fontSize: '16px',
      transition: STYLES.transitions.default,
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box'
    },
    toggleButton: {
      position: 'absolute',
      right: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      color: STYLES.colors.primary,
      transition: STYLES.transitions.default
    },
    removeButton: {
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: STYLES.transitions.default,
      border: 'none',
      background: STYLES.colors.dangerBg,
      color: STYLES.colors.danger,
      minWidth: 'auto'
    }
  };

  const handleInputFocus = (e) => {
    e.currentTarget.style.borderColor = STYLES.colors.primary;
  };

  const handleInputBlur = (e) => {
    e.currentTarget.style.borderColor = STYLES.colors.border;
  };

  const handleToggleMouseEnter = (e) => {
    if (!disabled) {
      e.currentTarget.style.background = '#f0f4ff';
    }
  };

  const handleToggleMouseLeave = (e) => {
    if (!disabled) {
      e.currentTarget.style.background = 'none';
    }
  };

  const handleRemoveMouseEnter = (e) => {
    if (!disabled && canRemove) {
      e.currentTarget.style.background = '#fed7d7';
    }
  };

  const handleRemoveMouseLeave = (e) => {
    if (!disabled) {
      e.currentTarget.style.background = STYLES.colors.dangerBg;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={matcher.value}
          onChange={(e) => onChange(index, e.target.value)}
          placeholder={getPlaceholder(matcher.type)}
          style={styles.input}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => onTypeToggle(index)}
          style={styles.toggleButton}
          disabled={disabled}
          title={getTooltip(matcher.type)}
          onMouseEnter={handleToggleMouseEnter}
          onMouseLeave={handleToggleMouseLeave}
        >
          <TypeIcon type={matcher.type} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        style={styles.removeButton}
        disabled={disabled || !canRemove}
        onMouseEnter={handleRemoveMouseEnter}
        onMouseLeave={handleRemoveMouseLeave}
      >
        Remove
      </button>
    </div>
  );
};

export default MatcherInput;
