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
      tabGroups: []
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

  test('renders plus button to create new group', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('+')).toBeInTheDocument();
    });
  });

  test('renders group tabs button', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Group All')).toBeInTheDocument();
    });
  });

  test('opens modal when plus button is clicked', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('+')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('+'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Create New Tab Group')).toBeInTheDocument();
    });
  });

  test('loads and displays tab groups from storage', async () => {
    const mockTabGroups = [
      {
        name: 'Tab Group',
        urlPrefixes: ['https://example.com/']
      }
    ];
    
    global.chrome.storage.local.get.mockResolvedValue({
      tabGroups: mockTabGroups
    });
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Tab Grou...' })).toBeInTheDocument();
    });
  });

  test('handles backwards compatibility with single urlPrefix', async () => {
    const mockTabGroups = [
      {
        name: 'Legacy Group',
        urlPrefix: 'https://legacy.com/' // Old format
      }
    ];
    
    global.chrome.storage.local.get.mockResolvedValue({
      tabGroups: mockTabGroups
    });
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Legacy G...' })).toBeInTheDocument();
    });
  });

  test('shows loading state initially', async () => {
    // Make the storage call slow to ensure we can see the loading state
    global.chrome.storage.local.get.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ tabGroups: [] }), 100))
    );
    
    await act(async () => {
      render(<App />);
    });
    
    expect(screen.getByText('Loading tabs...')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading tabs...')).not.toBeInTheDocument();
    });
  });

  test('shows error state when chrome APIs fail', async () => {
    // Suppress the expected console error during this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock chrome.storage.local.get to fail
    global.chrome.storage.local.get.mockRejectedValue(new Error('API Error'));
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Error: API Error/)).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Verify the console error was called (but suppressed)
    expect(consoleSpy).toHaveBeenCalledWith('Error initializing tab groups:', expect.any(Error));
    
    // Restore console.error
    consoleSpy.mockRestore();
  });

  test('displays default groups', async () => {
    // Mock some stored tab groups to simulate user-created groups
    global.chrome.storage.local.get.mockResolvedValue({
      tabGroups: [
        {
          name: 'Search Engines',
          urlPrefixes: ['https://www.google.com/']
        },
        {
          name: 'Documentation',
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
      expect(screen.getByRole('heading', { level: 2, name: 'Search E...' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Document...' })).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('ignores invalid URLs when creating groups', async () => {
    const mockTabGroups = [
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
      tabGroups: mockTabGroups
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
      expect(screen.getByRole('heading', { level: 2, name: 'Mixed Va...' })).toBeInTheDocument();
      expect(screen.getByText('Valid Site')).toBeInTheDocument();
      expect(screen.getByText('GitHub Page')).toBeInTheDocument();
    });
  });

  test('creates regex-based tab groups', async () => {
    // Mock chrome.storage.local.get to return a regex group
    chrome.storage.local.get.mockResolvedValue({
      tabGroups: [
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
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'GitHub P...' })).toBeInTheDocument();
      expect(screen.getByText('My GitHub Page')).toBeInTheDocument();
    });
    
    // The non-matching tab should not be in the group
    expect(screen.queryByText('Another Site')).not.toBeInTheDocument();
  });

  test('creates glob-based tab groups', async () => {
    // Mock chrome.storage.local.get to return a glob group
    chrome.storage.local.get.mockResolvedValue({
      tabGroups: [
        { 
          name: 'Documentation Sites', 
          matchers: [{ value: 'https://*/docs/**', type: 'glob' }]
        }
      ]
    });
    
    // Mock chrome.tabs.query to return some tabs
    chrome.tabs.query.mockResolvedValue([
      {
        id: 1,
        title: 'React Docs',
        url: 'https://react.dev/docs/getting-started',
        favIconUrl: 'https://react.dev/favicon.ico'
      },
      {
        id: 2,
        title: 'Vue Docs',
        url: 'https://vuejs.org/docs/guide',
        favIconUrl: 'https://vuejs.org/favicon.ico'
      },
      {
        id: 3,
        title: 'Other Site',
        url: 'https://example.com/home',
        favIconUrl: 'https://example.com/favicon.ico'
      }
    ]);
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Document...' })).toBeInTheDocument();
      expect(screen.getByText('React Docs')).toBeInTheDocument();
      expect(screen.getByText('Vue Docs')).toBeInTheDocument();
    });
    
    // The non-matching tab should not be in the group
    expect(screen.queryByText('Other Site')).not.toBeInTheDocument();
  });
});
