import React from 'react';
import { MATCHER_TYPES, STYLES } from '../constants.js';

const TypeIcon = ({ type }) => {
  switch (type) {
    case MATCHER_TYPES.PREFIX:
      return (
        <img 
          src="/images/file-url.svg" 
          width="20" 
          height="20" 
          alt="URL prefix"
        />
      );
    case MATCHER_TYPES.REGEX:
      return (
        <img 
          src="/images/regex.svg" 
          width="20" 
          height="20" 
          alt="Regex pattern"
        />
      );
    case MATCHER_TYPES.GLOB:
      return (
        <img 
          src="/images/asterisk.svg" 
          width="20" 
          height="20" 
          alt="Glob pattern"
        />
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
