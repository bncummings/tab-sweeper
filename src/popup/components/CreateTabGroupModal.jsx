import React, { useState, useEffect } from 'react';

const CreateTabGroupModal = ({ isOpen, onClose, onCreateGroup, editingGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [matchers, setMatchers] = useState([{ value: '', type: 'prefix' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingGroup) {
      setGroupName(editingGroup.name);
      
      if (editingGroup.matchType === 'regex' && editingGroup.regexPatterns) {
        // Convert regex patterns to matchers
        setMatchers(editingGroup.regexPatterns.map(pattern => ({ value: pattern, type: 'regex' })));
      } else if (editingGroup.urlPrefixes) {
        // Convert URL prefixes to matchers
        setMatchers(editingGroup.urlPrefixes.map(prefix => ({ value: prefix, type: 'prefix' })));
      } else if (editingGroup.urlPrefix) {
        // Handle legacy single urlPrefix
        setMatchers([{ value: editingGroup.urlPrefix, type: 'prefix' }]);
      } else {
        setMatchers([{ value: '', type: 'prefix' }]);
      }
    } else {
      setGroupName('');
      setMatchers([{ value: '', type: 'prefix' }]);
    }
  }, [editingGroup, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validMatchers = matchers.filter(matcher => matcher.value.trim());
    
    if (!groupName.trim() || validMatchers.length === 0) {
      alert('Please provide a group name and at least one matcher');
      return;
    }
    
    // Validate regex patterns
    const regexMatchers = validMatchers.filter(matcher => matcher.type === 'regex');
    for (const matcher of regexMatchers) {
      try {
        new RegExp(matcher.value);
      } catch (error) {
        alert(`Invalid regex pattern "${matcher.value}": ${error.message}`);
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      if (editingGroup) {
        await onCreateGroup(editingGroup.name, groupName.trim(), validMatchers);
      } else {
        await onCreateGroup(groupName.trim(), validMatchers);
      }
      setGroupName('');
      setMatchers([{ value: '', type: 'prefix' }]);
      onClose();
    } catch (error) {
      console.error('Error creating/updating group:', error);
      alert('Error creating/updating group: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setGroupName('');
    setMatchers([{ value: '', type: 'prefix' }]);
    onClose();
  };

  const addMatcher = () => {
    setMatchers([...matchers, { value: '', type: 'prefix' }]);
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

  const toggleMatcherType = (index) => {
    const newMatchers = [...matchers];
    newMatchers[index].type = newMatchers[index].type === 'prefix' ? 'regex' : 'prefix';
    setMatchers(newMatchers);
  };

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    position: 'relative'
  };

  const titleStyle = {
    margin: '0 0 24px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center'
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  };

  const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568'
  };

  const inputStyle = {
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.2s ease',
    outline: 'none'
  };

  const buttonRowStyle = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '8px'
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    background: '#e2e8f0',
    color: '#4a5568'
  };

  const submitButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    opacity: isSubmitting ? 0.7 : 1
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#a0aec0',
    padding: '4px',
    borderRadius: '4px'
  };

  const urlPrefixRowStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  };

  const urlPrefixInputStyle = {
    ...inputStyle,
    flex: 1
  };

  const removeButtonStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    background: '#fed7d7',
    color: '#c53030',
    minWidth: 'auto'
  };

  const addButtonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    background: '#c6f6d5',
    color: '#25543e',
    marginTop: '8px'
  };

  const matcherRowStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  };

  const matcherInputContainerStyle = {
    position: 'relative',
    flex: 1
  };

  const matcherInputStyle = {
    ...inputStyle,
    paddingRight: '50px'
  };

  const toggleButtonStyle = {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#667eea',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button
          style={closeButtonStyle}
          onClick={handleClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#667eea';
            e.currentTarget.style.background = '#f7fafc';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#a0aec0';
            e.currentTarget.style.background = 'none';
          }}
        >
          ×
        </button>
        
        <h2 style={titleStyle}>{editingGroup ? 'Edit Tab Group' : 'Create New Tab Group'}</h2>
        
        <form style={formStyle} onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., React Documentation"
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              disabled={isSubmitting}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Matchers</label>
            {matchers.map((matcher, index) => (
              <div key={index} style={matcherRowStyle}>
                <div style={matcherInputContainerStyle}>
                  <input
                    type="text"
                    value={matcher.value}
                    onChange={(e) => updateMatcher(index, e.target.value)}
                    placeholder={matcher.type === 'prefix' ? 'e.g., https://react.dev/' : 'e.g., ^https://.*\\.github\\.io/.*'}
                    style={matcherInputStyle}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => toggleMatcherType(index)}
                    style={toggleButtonStyle}
                    disabled={isSubmitting}
                    title={matcher.type === 'prefix' ? 'Switch to regex' : 'Switch to URL prefix'}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.background = '#f0f4ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.background = 'none';
                      }
                    }}
                  >
                    {matcher.type === 'prefix' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H6.5C4.01 7 2 9.01 2 11.5S4.01 16 6.5 16H11v-1.9H6.5c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9.5-6H13v1.9h4.5c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1H13V16h4.5c2.49 0 4.5-2.01 4.5-4.5S19.99 7 17.5 7z"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
                        <path d="M8.5 6C6.01 6 4 8.01 4 10.5S6.01 15 8.5 15H12v-2H8.5C7.12 13 6 11.88 6 10.5S7.12 8 8.5 8H12V6H8.5z"/>
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeMatcher(index)}
                  style={removeButtonStyle}
                  disabled={isSubmitting || matchers.length === 1}
                  onMouseEnter={(e) => {
                    if (!isSubmitting && matchers.length > 1) {
                      e.currentTarget.style.background = '#fed7d7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.background = '#fff';
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMatcher}
              style={addButtonStyle}
              disabled={isSubmitting}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#c6f6d5';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#fff';
                }
              }}
            >
              Add Matcher
            </button>
            <small style={{color: '#718096', fontSize: '12px'}}>
              Add URL prefixes or regex patterns to match tabs. Click the icon to toggle between types.
            </small>
          </div>
          
          <div style={buttonRowStyle}>
            <button
              type="button"
              style={cancelButtonStyle}
              onClick={handleClose}
              disabled={isSubmitting}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#cbd5e0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#e2e8f0';
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={submitButtonStyle}
              disabled={isSubmitting}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isSubmitting ? (editingGroup ? 'Updating...' : 'Creating...') : (editingGroup ? 'Update Group' : 'Create Group')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTabGroupModal;
