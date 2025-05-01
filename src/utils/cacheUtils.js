/**
 * Cache Utilities
 * 
 * This module provides functions for caching and retrieving processed video results
 * to improve performance and reduce loading times.
 */

// Cache configuration
const CACHE_CONFIG = {
  // Maximum number of videos to store in cache
  maxCacheSize: 20,
  
  // Cache expiration time in milliseconds (default: 24 hours)
  cacheExpiration: 24 * 60 * 60 * 1000,
  
  // Cache version - increment when cache structure changes
  cacheVersion: '1.0.0',
  
  // Cache key prefix
  cacheKeyPrefix: 'yt_summarizer_cache_',
  
  // Cache metadata key
  cacheMetadataKey: 'yt_summarizer_cache_metadata'
};

/**
 * Get a cache key for a video ID
 * @param {string} videoId - YouTube video ID
 * @returns {string} - Cache key
 */
const getCacheKey = (videoId) => {
  return `${CACHE_CONFIG.cacheKeyPrefix}${videoId}`;
};

/**
 * Get cache metadata
 * @returns {Object} - Cache metadata object
 */
const getCacheMetadata = () => {
  try {
    const metadata = localStorage.getItem(CACHE_CONFIG.cacheMetadataKey);
    if (!metadata) {
      return {
        version: CACHE_CONFIG.cacheVersion,
        lastCleanup: Date.now(),
        videos: []
      };
    }
    
    return JSON.parse(metadata);
  } catch (error) {
    console.error('Error getting cache metadata:', error);
    return {
      version: CACHE_CONFIG.cacheVersion,
      lastCleanup: Date.now(),
      videos: []
    };
  }
};

/**
 * Save cache metadata
 * @param {Object} metadata - Cache metadata object
 */
const saveCacheMetadata = (metadata) => {
  try {
    localStorage.setItem(CACHE_CONFIG.cacheMetadataKey, JSON.stringify(metadata));
  } catch (error) {
    console.error('Error saving cache metadata:', error);
  }
};

/**
 * Update cache metadata for a video
 * @param {string} videoId - YouTube video ID
 */
const updateCacheMetadata = (videoId) => {
  try {
    const metadata = getCacheMetadata();
    
    // Check if cache version has changed
    if (metadata.version !== CACHE_CONFIG.cacheVersion) {
      // Clear cache if version has changed
      clearCache();
      return;
    }
    
    // Remove existing entry for this video if it exists
    const existingIndex = metadata.videos.findIndex(v => v.id === videoId);
    if (existingIndex !== -1) {
      metadata.videos.splice(existingIndex, 1);
    }
    
    // Add new entry at the beginning (most recent)
    metadata.videos.unshift({
      id: videoId,
      timestamp: Date.now()
    });
    
    // Trim cache if it exceeds max size
    if (metadata.videos.length > CACHE_CONFIG.maxCacheSize) {
      const removedVideos = metadata.videos.splice(CACHE_CONFIG.maxCacheSize);
      
      // Remove cached data for removed videos
      removedVideos.forEach(video => {
        try {
          localStorage.removeItem(getCacheKey(video.id));
        } catch (error) {
          console.error(`Error removing cached video ${video.id}:`, error);
        }
      });
    }
    
    saveCacheMetadata(metadata);
  } catch (error) {
    console.error('Error updating cache metadata:', error);
  }
};

/**
 * Clean up expired cache entries
 */
const cleanupCache = () => {
  try {
    const metadata = getCacheMetadata();
    const now = Date.now();
    
    // Only clean up once a day
    if (now - metadata.lastCleanup < 24 * 60 * 60 * 1000) {
      return;
    }
    
    metadata.lastCleanup = now;
    
    // Filter out expired videos
    const validVideos = [];
    const expiredVideos = [];
    
    metadata.videos.forEach(video => {
      if (now - video.timestamp > CACHE_CONFIG.cacheExpiration) {
        expiredVideos.push(video);
      } else {
        validVideos.push(video);
      }
    });
    
    // Remove expired videos from cache
    expiredVideos.forEach(video => {
      try {
        localStorage.removeItem(getCacheKey(video.id));
      } catch (error) {
        console.error(`Error removing expired video ${video.id}:`, error);
      }
    });
    
    metadata.videos = validVideos;
    saveCacheMetadata(metadata);
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
};

/**
 * Clear all cached data
 */
export const clearCache = () => {
  try {
    const metadata = getCacheMetadata();
    
    // Remove all cached videos
    metadata.videos.forEach(video => {
      try {
        localStorage.removeItem(getCacheKey(video.id));
      } catch (error) {
        console.error(`Error removing cached video ${video.id}:`, error);
      }
    });
    
    // Reset metadata
    saveCacheMetadata({
      version: CACHE_CONFIG.cacheVersion,
      lastCleanup: Date.now(),
      videos: []
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

/**
 * Get cached result for a video
 * @param {string} videoId - YouTube video ID
 * @returns {Object|null} - Cached result or null if not found
 */
export const getCachedResult = (videoId) => {
  try {
    // Run cleanup routine
    cleanupCache();
    
    const cacheKey = getCacheKey(videoId);
    const cachedData = localStorage.getItem(cacheKey);
    
    if (!cachedData) {
      return null;
    }
    
    const result = JSON.parse(cachedData);
    
    // Update metadata to mark this video as recently accessed
    updateCacheMetadata(videoId);
    
    return result;
  } catch (error) {
    console.error(`Error getting cached result for video ${videoId}:`, error);
    return null;
  }
};

/**
 * Cache result for a video
 * @param {string} videoId - YouTube video ID
 * @param {Object} result - Video analysis result
 * @returns {boolean} - True if cached successfully
 */
export const cacheResult = (videoId, result) => {
  try {
    const cacheKey = getCacheKey(videoId);
    
    // Store the result
    localStorage.setItem(cacheKey, JSON.stringify(result));
    
    // Update metadata
    updateCacheMetadata(videoId);
    
    return true;
  } catch (error) {
    console.error(`Error caching result for video ${videoId}:`, error);
    return false;
  }
};

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
export const getCacheStats = () => {
  try {
    const metadata = getCacheMetadata();
    const now = Date.now();
    
    return {
      totalVideos: metadata.videos.length,
      maxCacheSize: CACHE_CONFIG.maxCacheSize,
      cacheVersion: metadata.version,
      lastCleanup: new Date(metadata.lastCleanup).toLocaleString(),
      oldestVideo: metadata.videos.length > 0 ? 
        new Date(metadata.videos[metadata.videos.length - 1].timestamp).toLocaleString() : 
        null,
      newestVideo: metadata.videos.length > 0 ? 
        new Date(metadata.videos[0].timestamp).toLocaleString() : 
        null,
      approximateSizeKB: calculateApproximateCacheSize() / 1024
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      error: 'Failed to get cache statistics',
      totalVideos: 0
    };
  }
};

/**
 * Calculate approximate size of the cache in bytes
 * @returns {number} - Approximate size in bytes
 */
const calculateApproximateCacheSize = () => {
  try {
    let totalSize = 0;
    const metadata = getCacheMetadata();
    
    // Add metadata size
    totalSize += JSON.stringify(metadata).length;
    
    // Add size of each cached video
    metadata.videos.forEach(video => {
      try {
        const cacheKey = getCacheKey(video.id);
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          totalSize += cachedData.length;
        }
      } catch (error) {
        // Ignore errors for individual videos
      }
    });
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating cache size:', error);
    return 0;
  }
};
