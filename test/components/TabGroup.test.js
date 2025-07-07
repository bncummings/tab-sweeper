import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabGroup from '../../src/popup/components/TabGroup';

const mockTabs = [
  {
    id: 1,
    title: 'React Documentation',
    url: 'https://react.dev/learn',
    favIconUrl: 'https://react.dev/favicon.ico'
  },
  {
    id: 2,
    title: 'React API Reference',
    url: 'https://react.dev/reference',
    favIconUrl: 'https://react.dev/favicon.ico'
  }
];

describe('TabGroup', () => {
  const mockOnTabClick = jest.fn();
  const mockOnEditGroup = jest.fn();
  const mockOnDeleteGroup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders tab group with tabs', () => {
    render(
      <TabGroup 
        title="React Documentation"
        tabs={mockTabs}
        onTabClick={mockOnTabClick}
        isCustomGroup={false}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    // Check for the group title (h2) 
    expect(screen.getByRole('heading', { level: 2, name: 'React Documentation' })).toBeInTheDocument();
    // Check for tab titles
    expect(screen.getByText('React API Reference')).toBeInTheDocument();
    // Check for pathname
    expect(screen.getByText('/learn')).toBeInTheDocument();
    expect(screen.getByText('/reference')).toBeInTheDocument();
  });

  test('does not render when tabs array is empty', () => {
    render(
      <TabGroup 
        title="Empty Group"
        tabs={[]}
        onTabClick={mockOnTabClick}
        isCustomGroup={false}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    expect(screen.queryByText('EMPTY GROUP')).not.toBeInTheDocument();
  });

  test('shows edit and delete buttons for custom groups', () => {
    render(
      <TabGroup 
        title="Custom Group"
        tabs={mockTabs}
        onTabClick={mockOnTabClick}
        isCustomGroup={true}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    expect(screen.getByTitle('Edit group')).toBeInTheDocument();
    expect(screen.getByTitle('Delete group')).toBeInTheDocument();
  });

  test('does not show edit and delete buttons for default groups', () => {
    render(
      <TabGroup 
        title="Default Group"
        tabs={mockTabs}
        onTabClick={mockOnTabClick}
        isCustomGroup={false}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    expect(screen.queryByTitle('Edit group')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Delete group')).not.toBeInTheDocument();
  });

  test('calls onEditGroup when edit button is clicked', () => {
    render(
      <TabGroup 
        title="Custom Group"
        tabs={mockTabs}
        onTabClick={mockOnTabClick}
        isCustomGroup={true}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    fireEvent.click(screen.getByTitle('Edit group'));
    expect(mockOnEditGroup).toHaveBeenCalledWith('Custom Group');
  });

  test('calls onDeleteGroup when delete button is clicked and confirmed', () => {
    window.confirm = jest.fn(() => true);
    
    render(
      <TabGroup 
        title="Custom Group"
        tabs={mockTabs}
        onTabClick={mockOnTabClick}
        isCustomGroup={true}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    fireEvent.click(screen.getByTitle('Delete group'));
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the "Custom Group" group?');
    expect(mockOnDeleteGroup).toHaveBeenCalledWith('Custom Group');
  });

  test('does not call onDeleteGroup when delete is not confirmed', () => {
    window.confirm = jest.fn(() => false);
    
    render(
      <TabGroup 
        title="Custom Group"
        tabs={mockTabs}
        onTabClick={mockOnTabClick}
        isCustomGroup={true}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    fireEvent.click(screen.getByTitle('Delete group'));
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the "Custom Group" group?');
    expect(mockOnDeleteGroup).not.toHaveBeenCalled();
  });

  test('calls onTabClick when a tab is clicked', () => {
    render(
      <TabGroup 
        title="Test Group"
        tabs={mockTabs}
        onTabClick={mockOnTabClick}
        isCustomGroup={false}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    // Click on the first tab's container
    const firstTab = screen.getByText('React Documentation', { selector: 'h3' }).closest('div');
    fireEvent.click(firstTab);
    
    expect(mockOnTabClick).toHaveBeenCalledWith(mockTabs[0]);
  });
});
