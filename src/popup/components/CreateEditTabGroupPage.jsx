import React, { useState, useEffect, useRef } from 'react';
import rough from 'roughjs';
import MatcherInput from './MatcherInput';
import SketchyButton from './SketchyButton';
import SketchyInput from './SketchyInput';
import TopBar from './TopBar';
import { MATCHER_TYPES, STYLES } from '../constants.js';

// Chrome tab group colors
const CHROME_COLORS = [
  { name: 'grey', hex: '#5F6368' },
  { name: 'blue', hex: '#1A73E8' },
  { name: 'red', hex: '#D93025' },
  { name: 'yellow', hex: '#F9AB00' },
  { name: 'green', hex: '#137333' },
  { name: 'pink', hex: '#D01884' },
  { name: 'purple', hex: '#9334E6' },
  { name: 'cyan', hex: '#007B83' }
];

// Sketchy color button component using rough.js
const SketchyColorButton = ({ color, isSelected, onSelect, disabled }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [buttonId] = useState(Math.random().toString(36).substring(2, 9));
  
  const { name, hex } = color;

  useEffect(() => {
    if (svgRef.current && containerRef.current && !disabled) {
      const svg = svgRef.current;
      const container = containerRef.current;
      
      // Clear previous drawings
      svg.innerHTML = '';
      
      const rc = rough.svg(svg);
      
      // Get actual dimensions for drawing
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      
      if (width > 0 && height > 0) {
        const strokeWidth = isSelected ? 3 : (isHovered ? 2.5 : 2);
        const strokeColor = isSelected ? '#000000' : 'rgba(0,0,0,0.15)';
        const sketchyRect = rc.rectangle(2, 2, width - 4, height - 4, {
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          fill: hex,
          fillStyle: 'solid',
          fillWeight: 1,
          hachureGap: 1,
          hachureAngle: 45,
          roughness: 1.0,
          bowing: 0.6,
          seed: buttonId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
        });
        
        svg.appendChild(sketchyRect);
      }
    }
  }, [isHovered, isSelected, disabled, buttonId, hex, name]);

  const buttonStyles = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    transform: isHovered && !disabled ? 'translateY(-1px)' : 'translateY(0)',
    width: '32px',
    height: '32px',
    padding: '0',
    minWidth: '32px',
    minHeight: '32px'
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

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!disabled) setIsHovered(false);
  };

  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect(name);
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
      title={name.charAt(0).toUpperCase() + name.slice(1)}
      type="button"
    >
      {!disabled && <svg ref={svgRef} style={svgStyles} />}
    </button>
  );
};

// Color picker component with radio button style layout using sketchy buttons
const ColorRadioGroup = ({ currentColor, onColorChange, disabled = false }) => {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'nowrap',
      gap: '6px',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '4px',
      overflowX: 'auto'
    }}>
      {CHROME_COLORS.map((color) => (
        <SketchyColorButton
          key={color.name}
          color={color}
          isSelected={currentColor === color.name}
          onSelect={onColorChange}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

const useForm = (editingGroup) => {
  const [groupName, setGroupName] = useState('');
  const [matchers, setMatchers] = useState([{ value: '', type: MATCHER_TYPES.PREFIX }]);
  const [color, setColor] = useState('blue');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingGroup) {
      setGroupName(editingGroup.name);
      setColor(editingGroup.color || 'blue');
      
      if (editingGroup.matchers) {
        setMatchers(editingGroup.matchers.map(matcher => ({ 
          value: matcher.value, 
          type: matcher.type 
        })));
      } else if (editingGroup.matchType === 'regex' && editingGroup.regexPatterns) {
        setMatchers(editingGroup.regexPatterns.map(pattern => ({ 
          value: pattern, 
          type: MATCHER_TYPES.REGEX 
        })));
      } else if (editingGroup.urlPrefixes) {
        setMatchers(editingGroup.urlPrefixes.map(prefix => ({ 
          value: prefix, 
          type: MATCHER_TYPES.PREFIX 
        })));
      } else if (editingGroup.urlPrefix) {
        setMatchers([{ value: editingGroup.urlPrefix, type: MATCHER_TYPES.PREFIX }]);
      }
    } else {
      resetForm();
    }
  }, [editingGroup]);

  const resetForm = () => {
    setGroupName('');
    setMatchers([{ value: '', type: MATCHER_TYPES.PREFIX }]);
    setColor('blue');
    setIsSubmitting(false);
  };

  const validateForm = () => {
    const validMatchers = matchers.filter(matcher => matcher.value.trim());
    
    if (!groupName.trim() || validMatchers.length === 0) {
      alert('Please provide a group name and at least one matcher');
      return false;
    }
    
    const regexMatchers = validMatchers.filter(matcher => matcher.type === MATCHER_TYPES.REGEX);
    for (const matcher of regexMatchers) {
      try {
        new RegExp(matcher.value);
      } catch (error) {
        alert(`Invalid regex pattern "${matcher.value}": ${error.message}`);
        return false;
      }
    }
    
    return validMatchers;
  };

  return {
    groupName,
    setGroupName,
    matchers,
    setMatchers,
    color,
    setColor,
    isSubmitting,
    setIsSubmitting,
    validateForm,
    resetForm
  };
};

const CreateEditTabGroupPage = ({ onSave, onCancel, editingGroup }) => {
  const {
    groupName,
    setGroupName,
    matchers,
    setMatchers,
    color,
    setColor,
    isSubmitting,
    setIsSubmitting,
    validateForm
  } = useForm(editingGroup);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validMatchers = validateForm();
    if (!validMatchers) return;
    
    setIsSubmitting(true);
    try {
      if (editingGroup) {
        await onSave(editingGroup.name, groupName.trim(), validMatchers, color);
      } else {
        await onSave(groupName.trim(), validMatchers, color);
      }
    } catch (error) {
      console.error('Error creating/updating group:', error);
      alert('Error creating/updating group: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMatcher = () => {
    setMatchers([...matchers, { value: '', type: MATCHER_TYPES.PREFIX }]);
  };

  const removeMatcher = (index) => {
    if (matchers.length > 1) {
      setMatchers(matchers.filter((_, i) => i !== index));
    }
  };

  const updateMatcher = (index, value) => {
    const newMatchers = [...matchers];
    newMatchers[index].value = value;
    setMatchers(newMatchers);
  };

  const toggleMatcherType = (index, newType) => {
    const newMatchers = [...matchers];
    
    if (newType) {
      newMatchers[index].type = newType;
    } else {
      const currentType = newMatchers[index].type;
      
      if (currentType === MATCHER_TYPES.PREFIX) {
        newMatchers[index].type = MATCHER_TYPES.REGEX;
      } else if (currentType === MATCHER_TYPES.REGEX) {
        newMatchers[index].type = MATCHER_TYPES.GLOB;
      } else {
        newMatchers[index].type = MATCHER_TYPES.PREFIX;
      }
    }
    
    setMatchers(newMatchers);
  };

  const styles = {
    page: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      width: '420px',
      minHeight: '550px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      background: '#ffffff',
      color: '#333'
    },

    main: {
      flex: 1,
      padding: '24px',
      overflowY: 'auto',
      background: '#ffffff'
    },
    title: {
      margin: '0 0 24px 0',
      fontSize: '24px',
      fontWeight: '700',
      color: STYLES.colors.text,
      textAlign: 'center'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    matchersField: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    matchersContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxHeight: '400px',
      overflowY: 'auto',
      paddingRight: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: STYLES.colors.text
    },
    addMatcherContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    helpText: {
      color: STYLES.colors.muted,
      fontSize: '12px'
    },
    buttonRow: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px'
    }
  };

  return (
    <div style={styles.page}>
      <TopBar onBack={onCancel} />
      
      <main style={styles.main}>
        <h1 style={styles.title}>
          {editingGroup ? 'Edit Tab Group' : 'Create New Tab Group'}
        </h1>
        
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Group Name</label>
            <SketchyInput
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., React Documentation"
              disabled={isSubmitting}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Group Color</label>
            <ColorRadioGroup
              currentColor={color}
              onColorChange={setColor}
              disabled={isSubmitting}
            />
          </div>

          <div style={styles.matchersField}>
            <label style={styles.label}>Matchers</label>
            <div style={styles.matchersContainer}>
              {matchers.map((matcher, index) => (
                <MatcherInput
                  key={index}
                  matcher={matcher}
                  index={index}
                  onChange={updateMatcher}
                  onTypeToggle={toggleMatcherType}
                  onRemove={removeMatcher}
                  canRemove={matchers.length > 1}
                  disabled={isSubmitting}
                />
              ))}
            </div>
            <div style={styles.addMatcherContainer}>
              <SketchyButton
                variant="success"
                onClick={addMatcher}
                disabled={isSubmitting}
                size="small"
                style={{ alignSelf: 'flex-start' }}
              >
                Add Another Matcher
              </SketchyButton>
              <small style={styles.helpText}>
                Add URL prefixes, regex patterns, or glob patterns to match tabs. Click the icon to cycle between types.
              </small>
            </div>
          </div>
          
          <div style={styles.buttonRow}>
            <SketchyButton
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
              size="large"
            >
              Cancel
            </SketchyButton>
            <SketchyButton
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              size="large"
            >
              {isSubmitting 
                ? (editingGroup ? 'Updating...' : 'Creating...') 
                : (editingGroup ? 'Update Group' : 'Create Group')}
            </SketchyButton>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateEditTabGroupPage;
