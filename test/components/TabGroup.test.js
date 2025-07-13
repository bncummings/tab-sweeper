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
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    // Check for the group title (h2) - should be truncated to "React Do..."
    expect(screen.getByRole('heading', { level: 2, name: 'React Do...' })).toBeInTheDocument();
    // Check for tab titles
    expect(screen.getByText('React API Reference')).toBeInTheDocument();
    // Check for pathname
    expect(screen.getByText('/learn')).toBeInTheDocument();
    expect(screen.getByText('/reference')).toBeInTheDocument();
  });

  test('renders empty tab groups with "No tabs yet" message', () => {
    render(
      <TabGroup 
        title="Empty Group"
        tabs={[]}
        onTabClick={mockOnTabClick}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    // Check that the group title is rendered (truncated)
    expect(screen.getByRole('heading', { level: 2, name: 'Empty Gr...' })).toBeInTheDocument();
    // Check that the empty message is displayed
    expect(screen.getByText('No tabs yet')).toBeInTheDocument();
  });

  test('shows edit and delete buttons for all groups', () => {
    render(
      <TabGroup 
        title="Tab Group"
        tabs={mockTabs}
        onTabClick={mockOnTabClick}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    expect(screen.getByTitle('Edit group')).toBeInTheDocument();
    expect(screen.getByTitle('Delete group')).toBeInTheDocument();
  });

  test('calls onEditGroup when edit button is clicked', () => {
    render(
      <TabGroup 
        title="Tab Group"
        tabs={mockTabs}
        onTabClick={mockOnTabClick}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    fireEvent.click(screen.getByTitle('Edit group'));
    expect(mockOnEditGroup).toHaveBeenCalledWith('Tab Group');
  });

  test('calls onDeleteGroup when delete button is clicked and confirmed', () => {
    window.confirm = jest.fn(() => true);
    
    render(
      <TabGroup 
        title="Tab Group"
        tabs={mockTabs}
        onTabClick={mockOnTabClick}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    fireEvent.click(screen.getByTitle('Delete group'));
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the "Tab Group" group?');
    expect(mockOnDeleteGroup).toHaveBeenCalledWith('Tab Group');
  });

  test('does not call onDeleteGroup when delete is not confirmed', () => {
    window.confirm = jest.fn(() => false);
    
    render(
      <TabGroup 
        title="Tab Group"
        tabs={mockTabs}
        onTabClick={mockOnTabClick}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    fireEvent.click(screen.getByTitle('Delete group'));
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the "Tab Group" group?');
    expect(mockOnDeleteGroup).not.toHaveBeenCalled();
  });

  test('calls onTabClick when a tab is clicked', () => {
    render(
      <TabGroup 
        title="Test Group"
        tabs={mockTabs}
        onTabClick={mockOnTabClick}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    // Click on the first tab's container
    const firstTab = screen.getByText('React Documentation', { selector: 'h3' }).closest('div');
    fireEvent.click(firstTab);
    
    expect(mockOnTabClick).toHaveBeenCalledWith(mockTabs[0]);
  });

  test('truncates long titles to 8 characters plus ellipsis', () => {
    render(
      <TabGroup 
        title="Very Long Tab Group Name That Should Be Truncated"
        tabs={mockTabs}
        onTabClick={mockOnTabClick}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    // Check that the title is truncated to "Very Lon..."
    expect(screen.getByRole('heading', { level: 2, name: 'Very Lon...' })).toBeInTheDocument();
    
    // Check that the full title is available in the title attribute for tooltips
    const heading = screen.getByRole('heading', { level: 2, name: 'Very Lon...' });
    expect(heading).toHaveAttribute('title', 'Very Long Tab Group Name That Should Be Truncated');
  });

  test('does not truncate short titles', () => {
    render(
      <TabGroup 
        title="Short"
        tabs={mockTabs}
        onTabClick={mockOnTabClick}
        onEditGroup={mockOnEditGroup}
        onDeleteGroup={mockOnDeleteGroup}
      />
    );
    
    // Check that short titles are not truncated
    expect(screen.getByRole('heading', { level: 2, name: 'Short' })).toBeInTheDocument();
  });
});
