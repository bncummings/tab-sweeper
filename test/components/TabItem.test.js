import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabItem from '../../src/popup/components/TabItem';

const mockTab = {
  id: 1,
  title: 'React Documentation | MDN',
  url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
  favIconUrl: 'https://developer.mozilla.org/favicon.ico'
};

describe('TabItem', () => {
  test('renders tab title and pathname correctly', () => {
    const mockClick = jest.fn();
    
    render(<TabItem tab={mockTab} onClick={mockClick} />);
    
    expect(screen.getByText('React Documentation')).toBeInTheDocument();
    expect(screen.getByText('/en-US/docs/Web/JavaScript')).toBeInTheDocument();
  });

  test('displays favicon when available', () => {
    const mockClick = jest.fn();
    
    render(<TabItem tab={mockTab} onClick={mockClick} />);
    
    const favicon = screen.getByAltText('favicon');
    expect(favicon).toBeInTheDocument();
    expect(favicon).toHaveAttribute('src', 'https://developer.mozilla.org/favicon.ico');
  });

  test('calls onClick when clicked', () => {
    const mockClick = jest.fn();
    
    render(<TabItem tab={mockTab} onClick={mockClick} />);
    
    fireEvent.click(
      screen.getByText('React Documentation').closest('div')
    );
    
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  test('does not display favicon when favIconUrl is not provided', () => {
    const mockClick = jest.fn();
    const tabWithoutFavicon = { ...mockTab, favIconUrl: undefined };
    
    render(<TabItem tab={tabWithoutFavicon} onClick={mockClick} />);
    
    const favicon = screen.queryByAltText('favicon');
    expect(favicon).not.toBeInTheDocument();
  });
});
