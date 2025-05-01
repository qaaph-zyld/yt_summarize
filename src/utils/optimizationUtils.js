/**
 * Optimization Utilities
 * 
 * This module provides functions for optimizing the application for production,
 * including performance improvements, code splitting, and resource optimization.
 */

import { debug, info, warn, isProduction, safeGet } from './debugUtils';

/**
 * Resource types for optimization
 */
export const ResourceType = {
  IMAGE: 'image',
  SCRIPT: 'script',
  STYLE: 'style',
  FONT: 'font',
  VIDEO: 'video',
  AUDIO: 'audio',
  DATA: 'data'
};

/**
 * Lazy load a component using React's lazy loading
 * @param {Function} importFunc - Import function for the component
 * @param {string} componentName - Name of the component (for logging)
 * @returns {React.LazyExoticComponent} - Lazy-loaded component
 */
export function lazyLoadComponent(importFunc, componentName) {
  info(`Lazy loading component: ${componentName}`);
  return React.lazy(async () => {
    try {
      return await importFunc();
    } catch (error) {
      warn(`Error lazy loading component ${componentName}:`, error);
      throw error;
    }
  });
}

/**
 * Preload a resource to improve performance
 * @param {string} url - URL of the resource to preload
 * @param {string} type - Type of resource from ResourceType enum
 * @param {Object} options - Additional options
 * @returns {HTMLLinkElement} - The preload link element
 */
export function preloadResource(url, type, options = {}) {
  if (!url) {
    warn('Cannot preload resource: URL is empty');
    return null;
  }
  
  debug(`Preloading ${type} resource: ${url}`);
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  
  switch (type) {
    case ResourceType.IMAGE:
      link.as = 'image';
      break;
    case ResourceType.SCRIPT:
      link.as = 'script';
      break;
    case ResourceType.STYLE:
      link.as = 'style';
      break;
    case ResourceType.FONT:
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      break;
    case ResourceType.VIDEO:
      link.as = 'video';
      break;
    case ResourceType.AUDIO:
      link.as = 'audio';
      break;
    case ResourceType.DATA:
      link.as = 'fetch';
      break;
    default:
      warn(`Unknown resource type: ${type}`);
      return null;
  }
  
  // Apply additional attributes from options
  Object.entries(options).forEach(([key, value]) => {
    link[key] = value;
  });
  
  document.head.appendChild(link);
  return link;
}

/**
 * Preload YouTube video thumbnail to improve perceived performance
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality (default, medium, high, maxres)
 * @returns {HTMLLinkElement} - The preload link element
 */
export function preloadYouTubeThumbnail(videoId, quality = 'medium') {
  if (!videoId) {
    warn('Cannot preload YouTube thumbnail: videoId is empty');
    return null;
  }
  
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    standard: 'sddefault',
    maxres: 'maxresdefault'
  };
  
  const thumbnailQuality = qualityMap[quality] || 'mqdefault';
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${thumbnailQuality}.jpg`;
  
  return preloadResource(thumbnailUrl, ResourceType.IMAGE);
}

/**
 * Optimize images for faster loading
 * @param {string} imageUrl - URL of the image
 * @param {Object} options - Optimization options
 * @returns {string} - Optimized image URL
 */
export function optimizeImage(imageUrl, options = {}) {
  if (!imageUrl) {
    warn('Cannot optimize image: URL is empty');
    return imageUrl;
  }
  
  // Default options
  const defaultOptions = {
    width: undefined,
    height: undefined,
    quality: 80,
    format: 'auto'
  };
  
  const settings = { ...defaultOptions, ...options };
  
  // For YouTube thumbnails, use the appropriate size
  if (imageUrl.includes('img.youtube.com/vi/')) {
    const maxWidth = settings.width || 1280;
    
    if (maxWidth <= 120) {
      return imageUrl.replace(/\/([\w]+)\.jpg$/, '/default.jpg');
    } else if (maxWidth <= 320) {
      return imageUrl.replace(/\/([\w]+)\.jpg$/, '/mqdefault.jpg');
    } else if (maxWidth <= 480) {
      return imageUrl.replace(/\/([\w]+)\.jpg$/, '/hqdefault.jpg');
    } else if (maxWidth <= 640) {
      return imageUrl.replace(/\/([\w]+)\.jpg$/, '/sddefault.jpg');
    } else {
      return imageUrl.replace(/\/([\w]+)\.jpg$/, '/maxresdefault.jpg');
    }
  }
  
  // For other images, we could use an image optimization service
  // or return the original URL
  return imageUrl;
}

/**
 * Debounce a function to improve performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Whether to call the function immediately
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
}

/**
 * Throttle a function to improve performance
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  let lastFunc;
  let lastRan;
  
  return function executedFunction(...args) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      
      lastFunc = setTimeout(function() {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Memoize a function to improve performance for expensive calculations
 * @param {Function} func - Function to memoize
 * @returns {Function} - Memoized function
 */
export function memoize(func) {
  const cache = new Map();
  
  return function memoized(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Optimize React component rendering
 * @param {React.Component} Component - React component to optimize
 * @param {Function} propsAreEqual - Function to compare props
 * @returns {React.MemoExoticComponent} - Memoized component
 */
export function optimizeComponent(Component, propsAreEqual = null) {
  return React.memo(Component, propsAreEqual);
}

/**
 * Measure component render time
 * @param {React.Component} Component - React component to measure
 * @param {string} componentName - Name of the component (for logging)
 * @returns {React.Component} - Wrapped component with performance measurement
 */
export function measureComponentPerformance(Component, componentName) {
  return function PerformanceWrapper(props) {
    const start = performance.now();
    const result = React.createElement(Component, props);
    const end = performance.now();
    
    debug(`Render time for ${componentName}: ${(end - start).toFixed(2)}ms`);
    
    return result;
  };
}

/**
 * Initialize performance optimization
 * @param {Object} options - Optimization options
 */
export function initOptimizations(options = {}) {
  // Default options
  const defaultOptions = {
    preloadYouTubeThumbnails: true,
    lazyLoadComponents: true,
    measurePerformance: !isProduction()
  };
  
  const settings = { ...defaultOptions, ...options };
  
  info('Initializing performance optimizations with settings:', settings);
  
  // Register performance observer if measuring performance
  if (settings.measurePerformance && window.PerformanceObserver) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          debug(`Performance entry: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
        });
      });
      
      observer.observe({ entryTypes: ['measure', 'resource', 'paint'] });
      info('Performance observer registered');
    } catch (error) {
      warn('Error registering performance observer:', error);
    }
  }
  
  // Preload common resources
  if (settings.preloadCommonResources) {
    // Preload app logo or other common resources
    // preloadResource('/logo.png', ResourceType.IMAGE);
  }
}
