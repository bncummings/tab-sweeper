import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateTabGroupModal from '../../src/popup/components/CreateTabGroupModal';

describe('CreateTabGroupModal', () => {
  const mockOnClose = jest.fn();
  const mockOnCreateGroup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders create modal when not editing', () => {
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
    expect(screen.getByText('Create Group')).toBeInTheDocument();
  });

  test('renders edit modal when editing', () => {
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
    expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://test.com/')).toBeInTheDocument();
    expect(screen.getByText('Update Group')).toBeInTheDocument();
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

  test('calls onCreateGroup when form is submitted with valid data', async () => {
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
      expect(mockOnCreateGroup).toHaveBeenCalledWith('Test Group', [{ value: 'https://test.com/', type: 'prefix' }]);
    });
  });

  test('shows validation error for empty fields', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup} 
      />
    );
    
    fireEvent.click(screen.getByText('Create Group'));
    
    expect(alertSpy).toHaveBeenCalledWith('Please provide a group name and at least one matcher');
    expect(mockOnCreateGroup).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  test('allows adding multiple matchers', () => {
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup} 
      />
    );
    
    expect(screen.getAllByPlaceholderText('e.g., https://react.dev/')).toHaveLength(1);
    
    fireEvent.click(screen.getByText('Add Matcher'));
    
    expect(screen.getAllByPlaceholderText('e.g., https://react.dev/')).toHaveLength(2);
  });

  test('allows removing matchers', () => {
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup} 
      />
    );
    
    fireEvent.click(screen.getByText('Add Matcher'));
    expect(screen.getAllByPlaceholderText('e.g., https://react.dev/')).toHaveLength(2);
    
    fireEvent.click(screen.getAllByText('Remove')[0]);
    expect(screen.getAllByPlaceholderText('e.g., https://react.dev/')).toHaveLength(1);
  });

  test('calls onClose when cancel button is clicked', () => {
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup} 
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when close button (×) is clicked', () => {
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup} 
      />
    );
    
    fireEvent.click(screen.getByText('×'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('submits multiple URL prefixes when creating group', async () => {
    mockOnCreateGroup.mockResolvedValue(undefined);
    
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup} 
      />
    );
    
    fireEvent.change(screen.getByPlaceholderText('e.g., React Documentation'), {
      target: { value: 'Multi-prefix Group' }
    });
    
    // Change first input
    const matcherInputs = screen.getAllByPlaceholderText('e.g., https://react.dev/');
    fireEvent.change(matcherInputs[0], {
      target: { value: 'https://example.com/' }
    });
    
    // Add another matcher
    fireEvent.click(screen.getByText('Add Matcher'));
    
    // Change second input
    const newMatcherInputs = screen.getAllByPlaceholderText('e.g., https://react.dev/');
    fireEvent.change(newMatcherInputs[1], {
      target: { value: 'https://test.com/' }
    });
    
    fireEvent.click(screen.getByText('Create Group'));
    
    await waitFor(() => {
      expect(mockOnCreateGroup).toHaveBeenCalledWith('Multi-prefix Group', [
        { value: 'https://example.com/', type: 'prefix' },
        { value: 'https://test.com/', type: 'prefix' }
      ]);
    });
  });

  test('handles backwards compatibility with single urlPrefix', () => {
    const editingGroup = {
      name: 'Legacy Group',
      urlPrefix: 'https://legacy.com/' // Old format
    };
    
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup}
        editingGroup={editingGroup}
      />
    );
    
    expect(screen.getByDisplayValue('Legacy Group')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://legacy.com/')).toBeInTheDocument();
  });

  test('allows creating groups with regex patterns', async () => {
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup} 
      />
    );
    
    // Set group name
    fireEvent.change(screen.getByPlaceholderText('e.g., React Documentation'), {
      target: { value: 'GitHub Pages' }
    });
    
    // Click toggle to switch to regex mode
    const toggleButton = screen.getByTitle('Switch to regex');
    fireEvent.click(toggleButton);
    
    // Should show regex input field
    expect(screen.getByPlaceholderText('e.g., ^https://.*\\.github\\.io/.*')).toBeInTheDocument();
    
    // Add regex pattern
    fireEvent.change(screen.getByPlaceholderText('e.g., ^https://.*\\.github\\.io/.*'), {
      target: { value: '^https://.*\\.github\\.io/.*' }
    });
    
    fireEvent.click(screen.getByText('Create Group'));
    
    await waitFor(() => {
      expect(mockOnCreateGroup).toHaveBeenCalledWith('GitHub Pages', [{ value: '^https://.*\\.github\\.io/.*', type: 'regex' }]);
    });
  });

  test('validates regex patterns before submission', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(
      <CreateTabGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreateGroup={mockOnCreateGroup} 
      />
    );
    
    // Set group name
    fireEvent.change(screen.getByPlaceholderText('e.g., React Documentation'), {
      target: { value: 'Test Group' }
    });
    
    // Click toggle to switch to regex mode
    const toggleButton = screen.getByTitle('Switch to regex');
    fireEvent.click(toggleButton);
    
    // Add invalid regex pattern
    fireEvent.change(screen.getByPlaceholderText('e.g., ^https://.*\\.github\\.io/.*'), {
      target: { value: '[invalid regex' }
    });
    
    fireEvent.click(screen.getByText('Create Group'));
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid regex pattern'));
    });
    
    alertSpy.mockRestore();
  });
});
