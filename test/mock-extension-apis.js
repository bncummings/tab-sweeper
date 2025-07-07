const { jest } = require('@jest/globals');

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
  },
  storage: {
    local: {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({})
    }
  }
};