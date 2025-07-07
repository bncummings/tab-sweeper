import React, { useState, useEffect } from 'react';

const CreateTabGroupModal = ({ isOpen, onClose, onCreateGroup, editingGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [urlPrefixes, setUrlPrefixes] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingGroup) {
      setGroupName(editingGroup.name);
      // Support both old single urlPrefix and new multiple urlPrefixes
      const prefixes = editingGroup.urlPrefixes || [editingGroup.urlPrefix];
      setUrlPrefixes(prefixes.length > 0 ? prefixes : ['']);
    } else {
      setGroupName('');
      setUrlPrefixes(['']);
    }
  }, [editingGroup, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validPrefixes = urlPrefixes.filter(prefix => prefix.trim());
    
    if (!groupName.trim() || validPrefixes.length === 0) {
      alert('Please provide a group name and at least one URL prefix');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingGroup) {
        await onCreateGroup(editingGroup.name, groupName.trim(), validPrefixes.map(p => p.trim()));
      } else {
        await onCreateGroup(groupName.trim(), validPrefixes.map(p => p.trim()));
      }
      setGroupName('');
      setUrlPrefixes(['']);
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
    setUrlPrefixes(['']);
    onClose();
  };

  const addUrlPrefix = () => {
    setUrlPrefixes([...urlPrefixes, '']);
  };

  const removeUrlPrefix = (index) => {
    if (urlPrefixes.length > 1) {
      setUrlPrefixes(urlPrefixes.filter((_, i) => i !== index));
    }
  };

  const updateUrlPrefix = (index, value) => {
    const newPrefixes = [...urlPrefixes];
    newPrefixes[index] = value;
    setUrlPrefixes(newPrefixes);
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
            <label style={labelStyle}>URL Prefix</label>
            {urlPrefixes.map((urlPrefix, index) => (
              <div key={index} style={urlPrefixRowStyle}>
                <input
                  type="text"
                  value={urlPrefix}
                  onChange={(e) => updateUrlPrefix(index, e.target.value)}
                  placeholder="e.g., https://react.dev/"
                  style={urlPrefixInputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => removeUrlPrefix(index)}
                  style={removeButtonStyle}
                  disabled={isSubmitting}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
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
              onClick={addUrlPrefix}
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
              Add URL Prefix
            </button>
            <small style={{color: '#718096', fontSize: '12px'}}>
              All tabs starting with these URLs will be grouped together
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
