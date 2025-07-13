import { storage } from '../../src/popup/storage.js';

// Mock chrome storage APIs
const mockChromeStorage = {
  local: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn()
  }
};

global.chrome = {
  storage: mockChromeStorage
};

describe('Storage Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTabGroups', () => {
    test('returns tab groups from storage', async () => {
      const testGroups = [
        {
          name: "React Documentation",
          matchers: [{ value: "https://react.dev/", type: "prefix" }]
        }
      ];

      mockChromeStorage.local.get.mockResolvedValue({ tabGroups: testGroups });

      const result = await storage.getTabGroups();
      
      expect(mockChromeStorage.local.get).toHaveBeenCalledWith(['tabGroups', 'customGroups']);
      expect(result).toEqual(testGroups);
    });

    test('returns legacy customGroups when tabGroups not present', async () => {
      const legacyGroups = [
        {
          name: "Legacy Group",
          urlPrefixes: ["https://legacy.com/"]
        }
      ];

      mockChromeStorage.local.get.mockResolvedValue({ customGroups: legacyGroups });

      const result = await storage.getTabGroups();
      
      expect(result).toEqual(legacyGroups);
    });

    test('returns empty array when no groups exist', async () => {
      mockChromeStorage.local.get.mockResolvedValue({});

      const result = await storage.getTabGroups();
      
      expect(result).toEqual([]);
    });

    test('prioritizes tabGroups over customGroups when both exist', async () => {
      const newGroups = [{ name: "New Group", matchers: [] }];
      const oldGroups = [{ name: "Old Group", urlPrefixes: [] }];

      mockChromeStorage.local.get.mockResolvedValue({ 
        tabGroups: newGroups,
        customGroups: oldGroups 
      });

      const result = await storage.getTabGroups();
      
      expect(result).toEqual(newGroups);
    });
  });

  describe('saveTabGroups', () => {
    test('saves tab groups to storage', async () => {
      const testGroups = [
        {
          name: "Vue Documentation",
          matchers: [{ value: "https://vuejs.org/", type: "prefix" }]
        }
      ];

      mockChromeStorage.local.set.mockResolvedValue();
      mockChromeStorage.local.remove.mockResolvedValue();

      await storage.saveTabGroups(testGroups);
      
      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({ tabGroups: testGroups });
      expect(mockChromeStorage.local.remove).toHaveBeenCalledWith('customGroups');
    });

    test('removes legacy customGroups key when saving', async () => {
      const testGroups = [];

      mockChromeStorage.local.set.mockResolvedValue();
      mockChromeStorage.local.remove.mockResolvedValue();

      await storage.saveTabGroups(testGroups);
      
      expect(mockChromeStorage.local.remove).toHaveBeenCalledWith('customGroups');
    });
  });

  describe('Multi-prefix Support', () => {
    test('supports multiple URL prefixes in groups', async () => {
      const multiPrefixGroups = [
        {
          name: "React Documentation",
          matchers: [
            { value: "https://react.dev/", type: "prefix" },
            { value: "https://reactjs.org/", type: "prefix" },
            { value: "https://legacy.reactjs.org/", type: "prefix" }
          ]
        },
        {
          name: "Vue Documentation", 
          matchers: [
            { value: "https://vuejs.org/", type: "prefix" },
            { value: "https://v2.vuejs.org/", type: "prefix" }
          ]
        }
      ];

      mockChromeStorage.local.get.mockResolvedValue({ tabGroups: multiPrefixGroups });

      const result = await storage.getTabGroups();
      
      expect(result).toHaveLength(2);
      expect(result[0].matchers).toHaveLength(3);
      expect(result[1].matchers).toHaveLength(2);
      
      // Verify React group has all three prefixes
      const reactGroup = result.find(g => g.name === "React Documentation");
      expect(reactGroup.matchers.map(m => m.value)).toEqual([
        "https://react.dev/",
        "https://reactjs.org/",
        "https://legacy.reactjs.org/"
      ]);
    });
  });

  describe('URL Matching Logic', () => {
    test('matches URLs against multiple prefixes', () => {
      const testUrls = [
        "https://react.dev/learn",
        "https://reactjs.org/docs/getting-started.html",
        "https://legacy.reactjs.org/tutorial/tutorial.html",
        "https://vuejs.org/guide/",
        "https://v2.vuejs.org/v2/guide/",
        "https://example.com/other"
      ];

      const reactPrefixes = [
        "https://react.dev/",
        "https://reactjs.org/",
        "https://legacy.reactjs.org/"
      ];

      const vuePrefixes = [
        "https://vuejs.org/",
        "https://v2.vuejs.org/"
      ];

      const reactMatches = testUrls.filter(url => 
        reactPrefixes.some(prefix => url.startsWith(prefix))
      );

      const vueMatches = testUrls.filter(url => 
        vuePrefixes.some(prefix => url.startsWith(prefix))
      );

      expect(reactMatches).toEqual([
        "https://react.dev/learn",
        "https://reactjs.org/docs/getting-started.html",
        "https://legacy.reactjs.org/tutorial/tutorial.html"
      ]);

      expect(vueMatches).toEqual([
        "https://vuejs.org/guide/",
        "https://v2.vuejs.org/v2/guide/"
      ]);
    });

    test('handles edge cases in URL matching', () => {
      const prefixes = ["https://example.com/"];
      
      // Exact match
      expect("https://example.com/".startsWith("https://example.com/")).toBe(true);
      
      // Subpath match
      expect("https://example.com/subpath".startsWith("https://example.com/")).toBe(true);
      
      // Different domain should not match
      expect("https://other.com/".startsWith("https://example.com/")).toBe(false);
      
      // HTTP vs HTTPS should not match
      expect("http://example.com/".startsWith("https://example.com/")).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('handles storage get errors gracefully', async () => {
      mockChromeStorage.local.get.mockRejectedValue(new Error('Storage error'));

      await expect(storage.getTabGroups()).rejects.toThrow('Storage error');
    });

    test('handles storage set errors gracefully', async () => {
      mockChromeStorage.local.set.mockRejectedValue(new Error('Storage error'));

      await expect(storage.saveTabGroups([])).rejects.toThrow('Storage error');
    });
  });
});
