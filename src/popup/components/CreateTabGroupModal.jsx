import React, { useState, useEffect, useRef } from 'react';
import rough from 'roughjs';
import MatcherInput from './MatcherInput';
import SketchyButton from './SketchyButton';
import SketchyInput from './SketchyInput';
import { MATCHER_TYPES, STYLES } from '../constants.js';

const useModalForm = (editingGroup, onClose) => {
  const [groupName, setGroupName] = useState('');
  const [matchers, setMatchers] = useState([{ value: '', type: MATCHER_TYPES.PREFIX }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingGroup) {
      setGroupName(editingGroup.name);
      
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

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return {
    groupName,
    setGroupName,
    matchers,
    setMatchers,
    isSubmitting,
    setIsSubmitting,
    validateForm,
    handleClose
  };
};

const CreateTabGroupModal = ({ isOpen, onClose, onCreateGroup, editingGroup }) => {
  const svgRef = useRef(null);
  const modalRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [modalId] = useState(Math.random().toString(36).substr(2, 9));
  
  const {
    groupName,
    setGroupName,
    matchers,
    setMatchers,
    isSubmitting,
    setIsSubmitting,
    validateForm,
    handleClose
  } = useModalForm(editingGroup, onClose);

  useEffect(() => {
    if (svgRef.current && modalRef.current && isOpen) {
      const svg = svgRef.current;
      const modal = modalRef.current;
      
      // Clear previous drawings
      svg.innerHTML = '';
      
      const rc = rough.svg(svg);
      
      // Get actual dimensions for drawing
      const width = modal.offsetWidth;
      const height = modal.offsetHeight;
      
      if (width > 0 && height > 0) {
        // Draw sketchy rectangle for the modal
        const sketchyRect = rc.rectangle(3, 3, width - 6, height - 6, {
          stroke: isHovered ? STYLES.colors.primary : 'rgba(0,0,0,0.3)',
          strokeWidth: 2.5,
          fill: 'rgba(255, 255, 255, 0.98)',
          fillStyle: 'solid',
          roughness: 1.4,
          bowing: 1.1,
          seed: modalId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
        });
        
        svg.appendChild(sketchyRect);
      }
    }
  }, [isOpen, isHovered, modalId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validMatchers = validateForm();
    if (!validMatchers) return;
    
    setIsSubmitting(true);
    try {
      if (editingGroup) {
        await onCreateGroup(editingGroup.name, groupName.trim(), validMatchers);
      } else {
        await onCreateGroup(groupName.trim(), validMatchers);
      }
      handleClose();
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
      // Direct type setting from new UI
      newMatchers[index].type = newType;
    } else {
      // Legacy cycling behavior (fallback)
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
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)'
    },
    modal: {
      position: 'relative',
      background: 'transparent', // Let rough.js handle the background
      borderRadius: '16px',
      padding: '32px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
    },
    title: {
      position: 'relative',
      zIndex: 1,
      margin: '0 0 24px 0',
      fontSize: '24px',
      fontWeight: '700',
      color: STYLES.colors.text,
      textAlign: 'center'
    },
    form: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    field: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      position: 'relative',
      zIndex: 1,
      fontSize: '14px',
      fontWeight: '600',
      color: STYLES.colors.text
    },
    input: {
      // Removed - now handled by SketchyInput
    },
    matchersContainer: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    helpText: {
      position: 'relative',
      zIndex: 1,
      color: STYLES.colors.muted,
      fontSize: '12px'
    },
    buttonRow: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '8px'
    },
    closeButton: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      zIndex: 2,
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#a0aec0',
      padding: '4px',
      borderRadius: '4px'
    },
    svg: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0
    }
  };

  const handleInputFocus = (e) => {
    // Removed - now handled by SketchyInput
  };

  const handleInputBlur = (e) => {
    // Removed - now handled by SketchyInput
  };

  const handleModalMouseEnter = () => {
    setIsHovered(true);
  };

  const handleModalMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div style={styles.overlay}>
      <div 
        ref={modalRef}
        style={styles.modal}
        onMouseEnter={handleModalMouseEnter}
        onMouseLeave={handleModalMouseLeave}
      >
        <svg ref={svgRef} style={styles.svg} />
        <button 
          style={styles.closeButton}
          onClick={handleClose}
          disabled={isSubmitting}
        >
          ×
        </button>
        
        <h2 style={styles.title}>
          {editingGroup ? 'Edit Tab Group' : 'Create New Tab Group'}
        </h2>
        
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Group Name</label>
            <SketchyInput
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., React Documentation"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              disabled={isSubmitting}
            />
          </div>

          <div style={styles.field}>
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
            <SketchyButton
              variant="success"
              onClick={addMatcher}
              disabled={isSubmitting}
              size="small"
              style={{ marginTop: '8px', alignSelf: 'flex-start' }}
            >
              Add Matcher
            </SketchyButton>
            <small style={styles.helpText}>
              Add URL prefixes, regex patterns, or glob patterns to match tabs. Click the icon to cycle between types.
            </small>
          </div>
          
          <div style={styles.buttonRow}>
            <SketchyButton
              variant="secondary"
              onClick={handleClose}
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
      </div>
    </div>
  );
};

export default CreateTabGroupModal;
