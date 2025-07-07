import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/popup/App';

// Mock the tabs module
jest.mock('../../src/popup/tabs.js', () => ({
  createGroup: jest.fn((name) => ({
    name,
    uris: [],
    addUris: jest.fn()
  }))
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock chrome.storage.local
    global.chrome.storage.local.get.mockResolvedValue({
      customGroups: []
    });
    
    // Mock chrome.tabs.query
    global.chrome.tabs.query.mockResolvedValue([
      {
        id: 1,
        title: 'React Documentation',
        url: 'https://react.dev/learn',
        favIconUrl: 'https://react.dev/favicon.ico'
      }
    ]);
  });

  test('renders app header and title', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('~My Tabs~')).toBeInTheDocument();
    });
  });

  test('renders plus button to create new group', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('+')).toBeInTheDocument();
    });
  });

  test('renders group tabs button', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Group Tabs')).toBeInTheDocument();
    });
  });

  test('opens modal when plus button is clicked', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('+')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('+'));
    
    await waitFor(() => {
      expect(screen.getByText('Create New Tab Group')).toBeInTheDocument();
    });
  });

  test('loads and displays custom groups from storage', async () => {
    const mockCustomGroups = [
      {
        name: 'Custom Group',
        urlPrefixes: ['https://example.com/']
      }
    ];
    
    global.chrome.storage.local.get.mockResolvedValue({
      customGroups: mockCustomGroups
    });
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Custom Group')).toBeInTheDocument();
    });
  });

  test('handles backwards compatibility with single urlPrefix', async () => {
    const mockCustomGroups = [
      {
        name: 'Legacy Group',
        urlPrefix: 'https://legacy.com/' // Old format
      }
    ];
    
    global.chrome.storage.local.get.mockResolvedValue({
      customGroups: mockCustomGroups
    });
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Legacy Group')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    render(<App />);
    
    expect(screen.getByText('Loading tabs...')).toBeInTheDocument();
  });

  test('shows error state when chrome APIs fail', async () => {
    // Mock chrome.storage.local.get to fail
    global.chrome.storage.local.get.mockRejectedValue(new Error('API Error'));
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Error: API Error/)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('displays default groups', async () => {
    // Mock some stored custom groups to simulate "default" groups
    global.chrome.storage.local.get.mockResolvedValue({
      customGroups: [
        {
          name: 'Google',
          urlPrefixes: ['https://www.google.com/']
        },
        {
          name: 'JavaScript',
          urlPrefixes: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript/']
        }
      ]
    });

    // Mock chrome.tabs.query to return matching tabs
    global.chrome.tabs.query.mockResolvedValue([
      { 
        id: 1, 
        title: 'Google Search',
        url: 'https://www.google.com/search?q=test',
        favIconUrl: 'https://www.google.com/favicon.ico' 
      },
      { 
        id: 2, 
        title: 'JavaScript MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference',
        favIconUrl: 'https://developer.mozilla.org/favicon.ico' 
      }
    ]);
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('ignores invalid URLs when creating groups', async () => {
    const mockCustomGroups = [
      {
        name: 'Mixed Valid/Invalid',
        matchers: [
          { value: 'https://valid.com/', type: 'prefix' },
          { value: 'invalid-url', type: 'prefix' },
          { value: '^https://.*\\.github\\.io/.*', type: 'regex' }
        ]
      }
    ];
    
    global.chrome.storage.local.get.mockResolvedValue({
      customGroups: mockCustomGroups
    });
    
    global.chrome.tabs.query.mockResolvedValue([
      {
        id: 1,
        title: 'Valid Site',
        url: 'https://valid.com/page',
        favIconUrl: 'https://valid.com/favicon.ico'
      },
      {
        id: 2,
        title: 'GitHub Page',
        url: 'https://user.github.io/repo',
        favIconUrl: 'https://github.com/favicon.ico'
      }
    ]);
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Mixed Valid/Invalid')).toBeInTheDocument();
      expect(screen.getByText('Valid Site')).toBeInTheDocument();
      expect(screen.getByText('GitHub Page')).toBeInTheDocument();
    });
  });

  test('creates regex-based tab groups', async () => {
    // Mock chrome.storage.local.get to return a regex group
    chrome.storage.local.get.mockResolvedValue({
      customGroups: [
        { 
          name: 'GitHub Pages', 
          matchers: [{ value: '^https://.*\\.github\\.io/.*', type: 'regex' }]
        }
      ]
    });
    
    // Mock chrome.tabs.query to return some tabs
    chrome.tabs.query.mockResolvedValue([
      {
        id: 1,
        title: 'My GitHub Page',
        url: 'https://username.github.io/repo-name',
        favIconUrl: 'https://github.com/favicon.ico'
      },
      {
        id: 2,
        title: 'Another Site',
        url: 'https://example.com',
        favIconUrl: 'https://example.com/favicon.ico'
      }
    ]);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('GitHub Pages')).toBeInTheDocument();
      expect(screen.getByText('My GitHub Page')).toBeInTheDocument();
    });
    
    // The non-matching tab should not be in the group
    expect(screen.queryByText('Another Site')).not.toBeInTheDocument();
  });
});
