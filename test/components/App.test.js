import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/popup/App';

/* Mock the tabs module */
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
    
    /* Mock chrome.storage.local */
    global.chrome.storage.local.get.mockResolvedValue({
      tabGroups: []
    });
    
    /* Mock chrome.tabs.query */
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
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('create-group-button')).toBeInTheDocument();
    });
  });

  test('renders group tabs button', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('group-all-button')).toBeInTheDocument();
    });
  });

  test('opens modal when plus button is clicked', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('create-group-button')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-group-button'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Create New Tab Group')).toBeInTheDocument();
    });
  });

  test('loads and displays tab groups from storage', async () => {
    
    global.chrome.storage.local.get.mockResolvedValue({
      tabGroups: [
        {
          name: 'Tab Group',
          urlPrefixes: ['https://example.com/']
        }
      ]
    });
    
   render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('tab-group-Tab Group')).toBeInTheDocument();
    });
  });

  test('handles backwards compatibility with single urlPrefix', async () => {
    global.chrome.storage.local.get.mockResolvedValue({
      tabGroups: [
        {
          name: 'Legacy Group',
          urlPrefix: 'https://legacy.com/'
        }
      ]
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('tab-group-Legacy Group')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', async () => {
    /* Make the storage call slow to ensure we can see the loading state */
    global.chrome.storage.local.get.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ tabGroups: [] }), 100))
    );
    
    render(<App />);
    
    expect(screen.getByText('Loading tabs...')).toBeInTheDocument();
    
    /* Wait for loading to complete */
    await waitFor(() => {
      expect(screen.queryByText('Loading tabs...')).not.toBeInTheDocument();
    });
  });

  test('shows error state when chrome APIs fail', async () => {
    /* Suppress the expected console error during this test */
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.chrome.storage.local.get.mockRejectedValue(new Error('API Error'));

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error: API Error/)).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith('Error initializing tab groups:', expect.any(Error));

    }, { timeout: 2000 });
        
    consoleSpy.mockRestore();
  });

  test('displays default groups', async () => {
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
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('tab-group-Search Engines')).toBeInTheDocument();
      expect(screen.getByTestId('tab-group-Documentation')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('ignores invalid URLs when creating groups', async () => {    
    global.chrome.storage.local.get.mockResolvedValue({
      tabGroups: [
        {
          name: 'Mixed Valid/Invalid',
          matchers: [
            { value: 'https://valid.com/', type: 'prefix' },
            { value: 'invalid-url', type: 'prefix' },
            { value: '^https://.*\\.github\\.io/.*', type: 'regex' }
          ]
        }
      ]
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
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('tab-group-Mixed Valid/Invalid')).toBeInTheDocument();
      expect(screen.getByText('Valid Site')).toBeInTheDocument();
      expect(screen.getByText('GitHub Page')).toBeInTheDocument();
    });
  });

  test('creates regex-based tab groups', async () => {
    chrome.storage.local.get.mockResolvedValue({
      tabGroups: [
        { 
          name: 'GitHub Pages', 
          matchers: [{ value: '^https://.*\\.github\\.io/.*', type: 'regex' }]
        }
      ]
    });
    
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
      expect(screen.getByTestId('tab-group-GitHub Pages')).toBeInTheDocument();
      expect(screen.getByText('My GitHub Page')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Another Site')).not.toBeInTheDocument();
  });

  test('creates glob-based tab groups', async () => {
    chrome.storage.local.get.mockResolvedValue({
      tabGroups: [
        { 
          name: 'Documentation Sites', 
          matchers: [{ value: 'https://*/docs/**', type: 'glob' }]
        }
      ]
    });
    
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
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('tab-group-Documentation Sites')).toBeInTheDocument();
      expect(screen.getByText('React Docs')).toBeInTheDocument();
      expect(screen.getByText('Vue Docs')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Other Site')).not.toBeInTheDocument();
  });
});
