import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateTabGroupModal from '../../src/popup/components/CreateTabGroupModal';

// Mock chrome API
global.chrome = {
  storage: {
    local: {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({})
    }
  }
};

describe('CreateTabGroupModal', () => {
  const mockOnClose = jest.fn();
  const mockOnCreateGroup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal when open', () => {
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup} 
      />
    );
    
    expect(screen.getByText('Create New Tab Group')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., React Documentation')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., https://react.dev/')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(
      <CreateTabGroupModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup} 
      />
    );
    
    expect(screen.queryByText('Create New Tab Group')).not.toBeInTheDocument();
  });

  test('calls onCreateGroup when form is submitted', async () => {
    mockOnCreateGroup.mockResolvedValue(undefined);
    
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup} 
      />
    );
    
    fireEvent.change(screen.getByPlaceholderText('e.g., React Documentation'), {
      target: { value: 'Test Group' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('e.g., https://react.dev/'), {
      target: { value: 'https://test.com/' }
    });
    
    fireEvent.click(screen.getByText('Create Group'));
    
    await waitFor(() => {
      expect(mockOnCreateGroup).toHaveBeenCalledWith('Test Group', 'https://test.com/');
    });
  });

  test('shows validation error for empty fields', () => {
    // Mock alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup} 
      />
    );
    
    fireEvent.click(screen.getByText('Create Group'));
    
    expect(alertSpy).toHaveBeenCalledWith('Please fill in both fields');
    expect(mockOnCreateGroup).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });
});
