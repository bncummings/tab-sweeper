import React, { useState } from 'react';

const CreateTabGroupModal = ({ isOpen, onClose, onCreateGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [urlPrefix, setUrlPrefix] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || !urlPrefix.trim()) {
      alert('Please fill in both fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateGroup(groupName.trim(), urlPrefix.trim());
      setGroupName('');
      setUrlPrefix('');
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Error creating group: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setGroupName('');
    setUrlPrefix('');
    onClose();
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
        
        <h2 style={titleStyle}>Create New Tab Group</h2>
        
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
            <input
              type="text"
              value={urlPrefix}
              onChange={(e) => setUrlPrefix(e.target.value)}
              placeholder="e.g., https://react.dev/"
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              disabled={isSubmitting}
            />
            <small style={{color: '#718096', fontSize: '12px'}}>
              All tabs starting with this URL will be grouped together
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
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTabGroupModal;
