import React from 'react';
import { MATCHER_TYPES, STYLES } from '../constants.js';

const TypeIcon = ({ type, isSelected }) => {
  const iconStyle = {
    filter: isSelected ? 'none' : 'brightness(2) grayscale(100%)',
    opacity: isSelected ? 1 : 0.3
  };

  switch (type) {
    case MATCHER_TYPES.PREFIX:
      return (
        <img 
          src="/images/file-url.svg" 
          width="16" 
          height="16" 
          alt="URL prefix"
          style={iconStyle}
        />
      );
    case MATCHER_TYPES.REGEX:
      return (
        <img 
          src="/images/regex.svg" 
          width="16" 
          height="16" 
          alt="Regex pattern"
          style={iconStyle}
        />
      );
    case MATCHER_TYPES.GLOB:
      return (
        <img 
          src="/images/asterisk.svg" 
          width="16" 
          height="16" 
          alt="Glob pattern"
          style={iconStyle}
        />
      );
    default:
      return null;
  }
};

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const TypeSelector = ({ currentType, onTypeChange, disabled }) => {
  const types = [
    { type: MATCHER_TYPES.PREFIX, label: 'URL prefix' },
    { type: MATCHER_TYPES.REGEX, label: 'Regex pattern' },
    { type: MATCHER_TYPES.GLOB, label: 'Glob pattern' }
  ];

  return (
    <div style={{
      position: 'absolute',
      right: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      gap: '4px',
      alignItems: 'center',
      padding: '2px 4px',
      borderRadius: '4px',
      background: 'rgba(255, 255, 255, 0.9)'
    }}>
      {types.map(({ type, label }) => (
        <button
          key={type}
          type="button"
          onClick={() => onTypeChange(type)}
          disabled={disabled}
          title={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            border: 'none',
            borderRadius: '3px',
            cursor: disabled ? 'default' : 'pointer',
            background: 'transparent',
            transition: STYLES.transitions.default,
            width: '24px',
            height: '24px'
          }}
        >
          <TypeIcon type={type} isSelected={currentType === type} />
        </button>
      ))}
    </div>
  );
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
      padding: '12px 90px 12px 16px',
      border: `2px solid ${STYLES.colors.border}`,
      borderRadius: '8px',
      fontSize: '16px',
      transition: STYLES.transitions.default,
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box'
    },
    removeButton: {
      padding: '8px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: STYLES.transitions.default,
      border: 'none', //`2px solid ${STYLES.colors.dangerBdr}`,
      background: STYLES.colors.dangerBg,
      color: STYLES.colors.danger,
      width: '46px',
      height: '46px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  const handleInputFocus = (e) => {
    e.currentTarget.style.borderColor = STYLES.colors.primary;
  };

  const handleInputBlur = (e) => {
    e.currentTarget.style.borderColor = STYLES.colors.border;
  };

  const handleRemoveMouseEnter = (e) => {
    if (!disabled && canRemove) {
      e.currentTarget.style.background = '#f56565';
      e.currentTarget.style.color = 'white';
    }
  };

  const handleRemoveMouseLeave = (e) => {
    if (!disabled) {
      e.currentTarget.style.background = STYLES.colors.dangerBg;
      e.currentTarget.style.color = STYLES.colors.danger;
    }
  };

  const handleTypeChange = (newType) => {
    if (!disabled) {
      onTypeToggle(index, newType);
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
        <TypeSelector 
          currentType={matcher.type}
          onTypeChange={handleTypeChange}
          disabled={disabled}
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        style={styles.removeButton}
        disabled={disabled || !canRemove}
        onMouseEnter={handleRemoveMouseEnter}
        onMouseLeave={handleRemoveMouseLeave}
        title="Remove matcher"
      >
        <DeleteIcon />
      </button>
    </div>
  );
};

export default MatcherInput;
