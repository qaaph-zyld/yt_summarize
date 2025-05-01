/**
 * Debug Utilities
 * 
 * This module provides functions for debugging, error reporting, and fixing edge cases
 * in the YouTube Video Summarizer application.
 */

import { logError } from './errorUtils';

/**
 * Debug levels
 */
export const DebugLevel = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  TRACE: 5
};

/**
 * Current debug level (can be changed at runtime)
 */
let currentDebugLevel = DebugLevel.ERROR;

/**
 * Set the current debug level
 * @param {number} level - Debug level from DebugLevel enum
 */
export function setDebugLevel(level) {
  if (Object.values(DebugLevel).includes(level)) {
    currentDebugLevel = level;
    debug('Debug level set to', Object.keys(DebugLevel).find(key => DebugLevel[key] === level));
  } else {
    warn('Invalid debug level:', level);
  }
}

/**
 * Log a debug message if the current debug level is high enough
 * @param {number} level - Debug level for this message
 * @param {string} message - Message to log
 * @param {any} data - Additional data to log
 */
export function log(level, message, data) {
  if (level <= currentDebugLevel) {
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(DebugLevel).find(key => DebugLevel[key] === level) || 'UNKNOWN';
    
    if (data !== undefined) {
      console.log(`[${timestamp}] [${levelName}] ${message}`, data);
    } else {
      console.log(`[${timestamp}] [${levelName}] ${message}`);
    }
  }
}

/**
 * Log an error message
 * @param {string} message - Error message
 * @param {any} data - Additional data
 */
export function error(message, data) {
  log(DebugLevel.ERROR, message, data);
}

/**
 * Log a warning message
 * @param {string} message - Warning message
 * @param {any} data - Additional data
 */
export function warn(message, data) {
  log(DebugLevel.WARN, message, data);
}

/**
 * Log an info message
 * @param {string} message - Info message
 * @param {any} data - Additional data
 */
export function info(message, data) {
  log(DebugLevel.INFO, message, data);
}

/**
 * Log a debug message
 * @param {string} message - Debug message
 * @param {any} data - Additional data
 */
export function debug(message, data) {
  log(DebugLevel.DEBUG, message, data);
}

/**
 * Log a trace message
 * @param {string} message - Trace message
 * @param {any} data - Additional data
 */
export function trace(message, data) {
  log(DebugLevel.TRACE, message, data);
}

/**
 * Measure the execution time of a function
 * @param {Function} fn - Function to measure
 * @param {string} name - Name of the function (for logging)
 * @param {Array} args - Arguments to pass to the function
 * @returns {any} - Return value of the function
 */
export function measureExecutionTime(fn, name, ...args) {
  const start = performance.now();
  try {
    const result = fn(...args);
    const end = performance.now();
    debug(`Execution time for ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    warn(`Error in ${name} after ${(end - start).toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Measure the execution time of an async function
 * @param {Function} fn - Async function to measure
 * @param {string} name - Name of the function (for logging)
 * @param {Array} args - Arguments to pass to the function
 * @returns {Promise<any>} - Promise resolving to the return value of the function
 */
export async function measureAsyncExecutionTime(fn, name, ...args) {
  const start = performance.now();
  try {
    const result = await fn(...args);
    const end = performance.now();
    debug(`Execution time for ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    warn(`Error in ${name} after ${(end - start).toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Check if a value is undefined, null, or empty
 * @param {any} value - Value to check
 * @returns {boolean} - True if the value is empty
 */
export function isEmpty(value) {
  if (value === undefined || value === null) {
    return true;
  }
  
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * Get a safe default value if the provided value is empty
 * @param {any} value - Value to check
 * @param {any} defaultValue - Default value to return if value is empty
 * @returns {any} - Original value or default value
 */
export function getDefaultIfEmpty(value, defaultValue) {
  return isEmpty(value) ? defaultValue : value;
}

/**
 * Safely access a nested property in an object
 * @param {Object} obj - Object to access
 * @param {string} path - Path to the property (e.g., 'a.b.c')
 * @param {any} defaultValue - Default value to return if property doesn't exist
 * @returns {any} - Property value or default value
 */
export function safeGet(obj, path, defaultValue = undefined) {
  if (isEmpty(obj) || isEmpty(path)) {
    return defaultValue;
  }
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null || result[key] === undefined) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result;
}

/**
 * Safely parse JSON without throwing exceptions
 * @param {string} json - JSON string to parse
 * @param {any} defaultValue - Default value to return if parsing fails
 * @returns {any} - Parsed object or default value
 */
export function safeParseJSON(json, defaultValue = {}) {
  try {
    return JSON.parse(json);
  } catch (error) {
    warn('Error parsing JSON:', error);
    return defaultValue;
  }
}

/**
 * Safely stringify an object to JSON without throwing exceptions
 * @param {any} obj - Object to stringify
 * @param {string} defaultValue - Default value to return if stringification fails
 * @returns {string} - JSON string or default value
 */
export function safeStringifyJSON(obj, defaultValue = '{}') {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    warn('Error stringifying object:', error);
    return defaultValue;
  }
}

/**
 * Check if the application is running in a development environment
 * @returns {boolean} - True if in development environment
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if the application is running in a production environment
 * @returns {boolean} - True if in production environment
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if the application is running in a test environment
 * @returns {boolean} - True if in test environment
 */
export function isTest() {
  return process.env.NODE_ENV === 'test';
}

/**
 * Validate that an object has all required properties
 * @param {Object} obj - Object to validate
 * @param {Array<string>} requiredProps - Array of required property names
 * @returns {Object} - Object with validation result and missing properties
 */
export function validateRequiredProps(obj, requiredProps) {
  if (isEmpty(obj) || isEmpty(requiredProps)) {
    return { isValid: false, missingProps: requiredProps };
  }
  
  const missingProps = requiredProps.filter(prop => isEmpty(safeGet(obj, prop)));
  
  return {
    isValid: missingProps.length === 0,
    missingProps
  };
}

/**
 * Detect and fix common issues with YouTube video results
 * @param {Object} result - Video analysis result
 * @returns {Object} - Fixed result object
 */
export function fixVideoResult(result) {
  if (isEmpty(result)) {
    warn('Empty result object provided to fixVideoResult');
    return result;
  }
  
  const fixedResult = { ...result };
  
  // Fix missing metadata
  if (isEmpty(fixedResult.metadata)) {
    debug('Adding default metadata to result');
    fixedResult.metadata = {
      title: 'Unknown Video',
      channel: 'Unknown Channel',
      publishedDate: 'Unknown Date'
    };
  }
  
  // Ensure videoId is present
  if (isEmpty(fixedResult.videoId)) {
    warn('Missing videoId in result');
    if (!isEmpty(fixedResult.url)) {
      // Try to extract videoId from URL
      const match = fixedResult.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/([\w-]{11}))|youtu\.be\/([\w-]{11}))/i);
      if (match) {
        fixedResult.videoId = match[1] || match[2];
        debug('Extracted videoId from URL:', fixedResult.videoId);
      }
    }
  }
  
  // Ensure summaries object exists
  if (isEmpty(fixedResult.summaries)) {
    debug('Adding empty summaries object to result');
    fixedResult.summaries = {
      brief: '',
      detailed: '',
      executive: ''
    };
  }
  
  // Ensure transcript object exists
  if (isEmpty(fixedResult.transcript)) {
    debug('Adding empty transcript object to result');
    fixedResult.transcript = {
      full: '',
      readable: '',
      segments: [],
      text: ''
    };
  }
  
  // Ensure keyPoints array exists
  if (!Array.isArray(fixedResult.keyPoints)) {
    debug('Adding empty keyPoints array to result');
    fixedResult.keyPoints = [];
  }
  
  // Ensure topics array exists
  if (!Array.isArray(fixedResult.topics)) {
    debug('Adding empty topics array to result');
    fixedResult.topics = [];
  }
  
  return fixedResult;
}

/**
 * Check browser compatibility for required features
 * @returns {Object} - Object with compatibility information
 */
export function checkBrowserCompatibility() {
  const features = {
    localStorage: typeof localStorage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    promises: typeof Promise !== 'undefined',
    webShare: typeof navigator !== 'undefined' && 'share' in navigator,
    clipboard: typeof navigator !== 'undefined' && navigator.clipboard && 'writeText' in navigator.clipboard,
    webWorkers: typeof Worker !== 'undefined',
    indexedDB: typeof indexedDB !== 'undefined'
  };
  
  const missingFeatures = Object.entries(features)
    .filter(([_, supported]) => !supported)
    .map(([feature]) => feature);
  
  return {
    isCompatible: missingFeatures.length === 0,
    features,
    missingFeatures
  };
}

/**
 * Register global error handlers
 */
export function registerGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    error('Unhandled promise rejection:', event.reason);
    logError('Unhandled promise rejection', event.reason);
  });
  
  // Handle global errors
  window.addEventListener('error', event => {
    error('Global error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
    logError('Global error', event.error);
  });
  
  debug('Global error handlers registered');
}

/**
 * Initialize debugging tools
 * @param {Object} options - Debug options
 */
export function initDebugTools(options = {}) {
  // Set debug level
  if (options.debugLevel !== undefined) {
    setDebugLevel(options.debugLevel);
  } else if (isDevelopment()) {
    setDebugLevel(DebugLevel.DEBUG);
  } else if (isTest()) {
    setDebugLevel(DebugLevel.INFO);
  } else {
    setDebugLevel(DebugLevel.ERROR);
  }
  
  // Register global error handlers if requested
  if (options.registerErrorHandlers) {
    registerGlobalErrorHandlers();
  }
  
  // Check browser compatibility if requested
  if (options.checkCompatibility) {
    const compatibility = checkBrowserCompatibility();
    if (!compatibility.isCompatible) {
      warn('Browser missing required features:', compatibility.missingFeatures);
    } else {
      debug('Browser compatibility check passed');
    }
  }
  
  info('Debug tools initialized with options:', options);
}
