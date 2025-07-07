// Mock Chrome extension APIs for testing
global.chrome = {
  tabs: {
    query: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({}),
    group: jest.fn().mockResolvedValue(1)
  },
  windows: {
    update: jest.fn().mockResolvedValue({})
  },
  tabGroups: {
    update: jest.fn().mockResolvedValue({})
  },
  storage: {
    local: {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({})
    }
  }
};