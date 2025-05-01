/**
 * Test Setup File
 * 
 * This file contains setup code for Jest tests, including mocks for browser APIs
 * that might not be available in the test environment.
 */

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: jest.fn(() => Object.keys(store).length),
    key: jest.fn(index => Object.keys(store)[index] || null),
  };
})();

// Mock navigator APIs
const navigatorMock = {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
  share: jest.fn().mockResolvedValue(undefined),
};

// Assign mocks to global object
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'navigator', { value: navigatorMock });

// Mock fetch API
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Mock URL API
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});
