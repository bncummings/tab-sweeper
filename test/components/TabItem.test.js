import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabItem from '../../src/popup/components/TabItem';

// Mock chrome API
global.chrome = {
  tabs: {
    query: jest.fn(),
    update: jest.fn(),
    group: jest.fn()
  },
  windows: {
    update: jest.fn()
  },
  tabGroups: {
    update: jest.fn()
  }
};

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
});
