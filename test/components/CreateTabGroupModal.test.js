import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import CreateTabGroupModal from '../../src/popup/components/CreateTabGroupModal';

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
      expect(mockOnCreateGroup).toHaveBeenCalledWith('Test Group', ['https://test.com/']);
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
    
    expect(alertSpy).toHaveBeenCalledWith('Please provide a group name and at least one URL prefix');
    expect(mockOnCreateGroup).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  test('allows adding multiple URL prefixes', () => {
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup} 
      />
    );
    
    expect(screen.getAllByPlaceholderText('e.g., https://react.dev/')).toHaveLength(1);
    
    fireEvent.click(screen.getByText('Add URL Prefix'));
    
    expect(screen.getAllByPlaceholderText('e.g., https://react.dev/')).toHaveLength(2);
  });

  test('allows removing URL prefixes', () => {
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup} 
      />
    );
    
    fireEvent.click(screen.getByText('Add URL Prefix'));
    expect(screen.getAllByPlaceholderText('e.g., https://react.dev/')).toHaveLength(2);
    
    fireEvent.click(screen.getAllByText('Remove')[0]);
    expect(screen.getAllByPlaceholderText('e.g., https://react.dev/')).toHaveLength(1);
  });

  test('renders edit mode when editing group', () => {
    const editingGroup = {
      name: 'Test Group',
      urlPrefixes: ['https://example.com/', 'https://test.com/']
    };
    
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup}
        editingGroup={editingGroup}
      />
    );
    
    expect(screen.getByText('Edit Tab Group')).toBeInTheDocument();
    expect(screen.getByText('Update Group')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://test.com/')).toBeInTheDocument();
  });
});
