/**
 * Cache Utilities Tests
 * 
 * Tests for the caching system for previously processed videos.
 */

import { 
  getCachedResult,
  cacheResult,
  clearCache,
  getCacheStats
} from '../utils/cacheUtils';

describe('Cache Utilities', () => {
  // Mock data
  const mockVideoId = 'FQlCWrsUpHo';
  const mockResult = {
    videoId: mockVideoId,
    metadata: {
      title: 'Test Video Title',
      channel: 'Test Channel'
    },
    summaries: {
      brief: 'Brief summary'
    }
  };
  
  // Mock localStorage
  let mockLocalStorage = {};
  
  beforeEach(() => {
    // Clear mock localStorage before each test
    mockLocalStorage = {};
    
    // Mock localStorage methods
    Storage.prototype.getItem = jest.fn(key => mockLocalStorage[key] || null);
    Storage.prototype.setItem = jest.fn((key, value) => {
      mockLocalStorage[key] = value;
    });
    Storage.prototype.removeItem = jest.fn(key => {
      delete mockLocalStorage[key];
    });
    Storage.prototype.clear = jest.fn(() => {
      mockLocalStorage = {};
    });
  });
  
  describe('cacheResult', () => {
    test('caches video result successfully', () => {
      const success = cacheResult(mockVideoId, mockResult);
      
      expect(success).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalled();
      
      // Check that metadata was updated
      expect(localStorage.setItem.mock.calls.some(call => 
        call[0] === 'yt_summarizer_cache_metadata'
      )).toBe(true);
      
      // Check that video data was stored
      expect(localStorage.setItem.mock.calls.some(call => 
        call[0] === `yt_summarizer_cache_${mockVideoId}`
      )).toBe(true);
    });
    
    test('handles errors gracefully', () => {
      // Mock localStorage.setItem to throw error
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const success = cacheResult(mockVideoId, mockResult);
      
      expect(success).toBe(false);
    });
  });
  
  describe('getCachedResult', () => {
    test('retrieves cached result successfully', () => {
      // Setup mock cached data
      mockLocalStorage[`yt_summarizer_cache_${mockVideoId}`] = JSON.stringify(mockResult);
      mockLocalStorage['yt_summarizer_cache_metadata'] = JSON.stringify({
        version: '1.0.0',
        lastCleanup: Date.now(),
        videos: [{ id: mockVideoId, timestamp: Date.now() }]
      });
      
      const result = getCachedResult(mockVideoId);
      
      expect(result).toEqual(mockResult);
    });
    
    test('returns null for non-existent cache entry', () => {
      const result = getCachedResult('non-existent-id');
      
      expect(result).toBeNull();
    });
    
    test('handles errors gracefully', () => {
      // Setup invalid JSON in cache
      mockLocalStorage[`yt_summarizer_cache_${mockVideoId}`] = 'invalid json';
      
      const result = getCachedResult(mockVideoId);
      
      expect(result).toBeNull();
    });
  });
  
  describe('clearCache', () => {
    test('clears all cache entries', () => {
      // Setup mock cached data
      mockLocalStorage[`yt_summarizer_cache_${mockVideoId}`] = JSON.stringify(mockResult);
      mockLocalStorage['yt_summarizer_cache_metadata'] = JSON.stringify({
        version: '1.0.0',
        lastCleanup: Date.now(),
        videos: [{ id: mockVideoId, timestamp: Date.now() }]
      });
      
      const success = clearCache();
      
      expect(success).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalled();
      
      // Check that metadata was reset
      expect(localStorage.setItem.mock.calls.some(call => 
        call[0] === 'yt_summarizer_cache_metadata' && 
        JSON.parse(call[1]).videos.length === 0
      )).toBe(true);
    });
    
    test('handles errors gracefully', () => {
      // Mock localStorage.removeItem to throw error
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const success = clearCache();
      
      expect(success).toBe(false);
    });
  });
  
  describe('getCacheStats', () => {
    test('returns correct cache statistics', () => {
      // Setup mock cached data
      const now = Date.now();
      mockLocalStorage['yt_summarizer_cache_metadata'] = JSON.stringify({
        version: '1.0.0',
        lastCleanup: now - 1000,
        videos: [
          { id: 'video1', timestamp: now - 5000 },
          { id: 'video2', timestamp: now - 3000 },
          { id: 'video3', timestamp: now - 1000 }
        ]
      });
      
      const stats = getCacheStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalVideos).toBe(3);
      expect(stats.cacheVersion).toBe('1.0.0');
      expect(new Date(stats.lastCleanup)).toBeInstanceOf(Date);
      expect(stats.oldestVideo).toBeDefined();
      expect(stats.newestVideo).toBeDefined();
    });
    
    test('handles empty cache gracefully', () => {
      const stats = getCacheStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalVideos).toBe(0);
    });
    
    test('handles errors gracefully', () => {
      // Setup invalid JSON in metadata
      mockLocalStorage['yt_summarizer_cache_metadata'] = 'invalid json';
      
      const stats = getCacheStats();
      
      expect(stats).toBeDefined();
      expect(stats.error).toBeDefined();
    });
  });
});
