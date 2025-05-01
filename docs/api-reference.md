# YouTube Video Summarizer - API Reference

This document provides a comprehensive reference for the YouTube Video Summarizer API, including utility functions, parameters, return values, and examples. This reference is intended for developers who want to understand or extend the application's functionality.

## Table of Contents

1. [YouTube Utilities](#youtube-utilities)
2. [Error Utilities](#error-utilities)
3. [Cache Utilities](#cache-utilities)
4. [Share Utilities](#share-utilities)
5. [Debug Utilities](#debug-utilities)
6. [Optimization Utilities](#optimization-utilities)
7. [Context API](#context-api)

## YouTube Utilities

Located in `src/utils/youtubeUtils.js`, these functions handle YouTube video processing.

### extractVideoId

Extracts the YouTube video ID from a URL.

```javascript
/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
function extractVideoId(url)
```

Example:
```javascript
const videoId = extractVideoId('https://www.youtube.com/watch?v=FQlCWrsUpHo');
// Returns: 'FQlCWrsUpHo'
```

### processYouTubeVideo

Main function to process a YouTube video, extracting metadata, transcript, and generating summaries.

```javascript
/**
 * Process a YouTube video URL to extract metadata, transcript, and generate summaries
 * @param {string} url - YouTube URL
 * @returns {Promise<Object>} - Object containing video analysis results
 */
async function processYouTubeVideo(url)
```

Return value structure:
```javascript
{
  videoId: 'FQlCWrsUpHo',
  url: 'https://www.youtube.com/watch?v=FQlCWrsUpHo',
  metadata: {
    title: 'Video Title',
    channel: 'Channel Name',
    publishedDate: '2023-01-01',
    description: 'Video description',
    category: 'Category',
    tags: ['tag1', 'tag2'],
    duration: '10:00',
    views: '1000',
    likes: '100'
  },
  transcript: {
    full: 'Full transcript text with timestamps',
    readable: 'Readable transcript text without timestamps',
    segments: [
      { 
        text: 'Segment text', 
        start: 0, 
        duration: 5,
        formattedStart: '0:00'
      }
    ],
    text: 'Raw transcript text'
  },
  summaries: {
    brief: 'Brief summary',
    detailed: 'Detailed summary',
    executive: 'Executive summary'
  },
  keyPoints: [
    'Key point 1',
    'Key point 2'
  ],
  topics: [
    {
      name: 'Topic 1',
      description: 'Topic description',
      startTime: 0,
      endTime: 60
    }
  ]
}
```

### getVideoMetadata

Fetches metadata for a YouTube video.

```javascript
/**
 * Get metadata for a YouTube video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Video metadata
 */
async function getVideoMetadata(videoId)
```

### getVideoTranscript

Fetches the transcript for a YouTube video.

```javascript
/**
 * Get transcript for a YouTube video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Array>} - Array of transcript segments
 */
async function getVideoTranscript(videoId)
```

### processTranscript

Processes raw transcript segments into a structured format.

```javascript
/**
 * Process transcript segments into structured format
 * @param {Array} segments - Array of transcript segments
 * @returns {Object} - Processed transcript
 */
function processTranscript(segments)
```

### extractKeyPoints

Extracts key points from transcript text.

```javascript
/**
 * Extract key points from transcript text
 * @param {string} text - Transcript text
 * @returns {Array<string>} - Array of key points
 */
function extractKeyPoints(text)
```

### generateSummaries

Generates different types of summaries from transcript text.

```javascript
/**
 * Generate summaries from transcript text
 * @param {string} text - Transcript text
 * @returns {Object} - Object containing different summary types
 */
function generateSummaries(text)
```

### identifyTopics

Identifies topics from transcript text.

```javascript
/**
 * Identify topics from transcript text
 * @param {string} text - Transcript text
 * @returns {Array<Object>} - Array of topic objects
 */
function identifyTopics(text)
```

## Error Utilities

Located in `src/utils/errorUtils.js`, these functions handle error management and validation.

### Custom Error Classes

```javascript
class YouTubeError extends Error {}
class ValidationError extends Error {}
class TranscriptError extends Error {}
class APIError extends Error {}
class ProcessingError extends Error {}
```

### validateYouTubeUrl

Validates a YouTube URL.

```javascript
/**
 * Validate a YouTube URL
 * @param {string} url - URL to validate
 * @returns {Object} - Validation result with isValid and videoId or error
 */
function validateYouTubeUrl(url)
```

Example:
```javascript
const result = validateYouTubeUrl('https://www.youtube.com/watch?v=FQlCWrsUpHo');
// Returns: { isValid: true, videoId: 'FQlCWrsUpHo' }
```

### getUserFriendlyErrorMessage

Converts error objects to user-friendly messages.

```javascript
/**
 * Get user-friendly error message
 * @param {Error|string} error - Error object or message
 * @returns {string} - User-friendly error message
 */
function getUserFriendlyErrorMessage(error)
```

### logError

Logs errors for debugging.

```javascript
/**
 * Log error for debugging
 * @param {string} context - Error context
 * @param {Error} error - Error object
 * @param {Object} data - Additional data
 */
function logError(context, error, data)
```

## Cache Utilities

Located in `src/utils/cacheUtils.js`, these functions handle caching of processed videos.

### getCachedResult

Retrieves a cached result for a video.

```javascript
/**
 * Get cached result for a video
 * @param {string} videoId - YouTube video ID
 * @returns {Object|null} - Cached result or null if not found
 */
function getCachedResult(videoId)
```

### cacheResult

Caches a result for a video.

```javascript
/**
 * Cache result for a video
 * @param {string} videoId - YouTube video ID
 * @param {Object} result - Video analysis result
 * @returns {boolean} - True if cached successfully
 */
function cacheResult(videoId, result)
```

### clearCache

Clears all cached data.

```javascript
/**
 * Clear all cached data
 * @returns {boolean} - True if cleared successfully
 */
function clearCache()
```

### getCacheStats

Gets statistics about the cache.

```javascript
/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
function getCacheStats()
```

## Share Utilities

Located in `src/utils/shareUtils.js`, these functions handle sharing and exporting functionality.

### generateShareableUrl

Generates a shareable URL for a video analysis.

```javascript
/**
 * Generate a shareable URL for a video analysis
 * @param {string} videoId - YouTube video ID
 * @param {string} tab - Active tab (summary, transcript, keypoints, topics)
 * @param {string} summaryType - Summary type (brief, detailed, executive)
 * @returns {string} - Shareable URL
 */
function generateShareableUrl(videoId, tab, summaryType)
```

### shareViaWebShare

Shares content via the Web Share API.

```javascript
/**
 * Share via Web Share API if available
 * @param {Object} data - Share data
 * @param {string} data.title - Share title
 * @param {string} data.text - Share text
 * @param {string} data.url - Share URL
 * @returns {Promise<boolean>} - True if shared successfully
 */
async function shareViaWebShare(data)
```

### copyToClipboard

Copies text to the clipboard.

```javascript
/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - True if copied successfully
 */
async function copyToClipboard(text)
```

### generateSummaryText

Generates a summary text for sharing.

```javascript
/**
 * Generate a summary text for sharing
 * @param {Object} result - Video analysis result
 * @param {string} summaryType - Summary type (brief, detailed, executive)
 * @returns {string} - Formatted summary text
 */
function generateSummaryText(result, summaryType)
```

### generateFullAnalysisText

Generates a full analysis text for sharing or exporting.

```javascript
/**
 * Generate a full analysis text for sharing or exporting
 * @param {Object} result - Video analysis result
 * @returns {string} - Formatted analysis text
 */
function generateFullAnalysisText(result)
```

### downloadAsFile

Downloads text as a file.

```javascript
/**
 * Download text as a file
 * @param {string} text - Text content
 * @param {string} filename - File name
 * @param {string} fileType - File type (txt, md, html)
 */
function downloadAsFile(text, filename, fileType)
```

### shareToSocialMedia

Shares to social media platforms.

```javascript
/**
 * Share to social media platforms
 * @param {string} platform - Social media platform (twitter, facebook, linkedin)
 * @param {Object} data - Share data
 * @param {string} data.title - Share title
 * @param {string} data.text - Share text
 * @param {string} data.url - Share URL
 */
function shareToSocialMedia(platform, data)
```

## Debug Utilities

Located in `src/utils/debugUtils.js`, these functions provide debugging and error tracking.

### DebugLevel

Debug level enumeration.

```javascript
const DebugLevel = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  TRACE: 5
};
```

### setDebugLevel

Sets the current debug level.

```javascript
/**
 * Set the current debug level
 * @param {number} level - Debug level from DebugLevel enum
 */
function setDebugLevel(level)
```

### log, error, warn, info, debug, trace

Logging functions for different levels.

```javascript
/**
 * Log a message at a specific level
 * @param {number} level - Debug level
 * @param {string} message - Message to log
 * @param {any} data - Additional data
 */
function log(level, message, data)

function error(message, data)
function warn(message, data)
function info(message, data)
function debug(message, data)
function trace(message, data)
```

### measureExecutionTime

Measures the execution time of a function.

```javascript
/**
 * Measure the execution time of a function
 * @param {Function} fn - Function to measure
 * @param {string} name - Name of the function
 * @param {Array} args - Arguments to pass to the function
 * @returns {any} - Return value of the function
 */
function measureExecutionTime(fn, name, ...args)
```

### measureAsyncExecutionTime

Measures the execution time of an async function.

```javascript
/**
 * Measure the execution time of an async function
 * @param {Function} fn - Async function to measure
 * @param {string} name - Name of the function
 * @param {Array} args - Arguments to pass to the function
 * @returns {Promise<any>} - Promise resolving to the return value
 */
async function measureAsyncExecutionTime(fn, name, ...args)
```

### isEmpty

Checks if a value is empty.

```javascript
/**
 * Check if a value is undefined, null, or empty
 * @param {any} value - Value to check
 * @returns {boolean} - True if the value is empty
 */
function isEmpty(value)
```

### getDefaultIfEmpty

Gets a default value if the provided value is empty.

```javascript
/**
 * Get a safe default value if the provided value is empty
 * @param {any} value - Value to check
 * @param {any} defaultValue - Default value to return if value is empty
 * @returns {any} - Original value or default value
 */
function getDefaultIfEmpty(value, defaultValue)
```

### safeGet

Safely accesses a nested property in an object.

```javascript
/**
 * Safely access a nested property in an object
 * @param {Object} obj - Object to access
 * @param {string} path - Path to the property (e.g., 'a.b.c')
 * @param {any} defaultValue - Default value to return if property doesn't exist
 * @returns {any} - Property value or default value
 */
function safeGet(obj, path, defaultValue)
```

### fixVideoResult

Detects and fixes common issues with YouTube video results.

```javascript
/**
 * Detect and fix common issues with YouTube video results
 * @param {Object} result - Video analysis result
 * @returns {Object} - Fixed result object
 */
function fixVideoResult(result)
```

### checkBrowserCompatibility

Checks browser compatibility for required features.

```javascript
/**
 * Check browser compatibility for required features
 * @returns {Object} - Object with compatibility information
 */
function checkBrowserCompatibility()
```

### initDebugTools

Initializes debugging tools.

```javascript
/**
 * Initialize debugging tools
 * @param {Object} options - Debug options
 */
function initDebugTools(options)
```

## Optimization Utilities

Located in `src/utils/optimizationUtils.js`, these functions improve application performance.

### ResourceType

Resource type enumeration.

```javascript
const ResourceType = {
  IMAGE: 'image',
  SCRIPT: 'script',
  STYLE: 'style',
  FONT: 'font',
  VIDEO: 'video',
  AUDIO: 'audio',
  DATA: 'data'
};
```

### lazyLoadComponent

Lazy loads a component using React's lazy loading.

```javascript
/**
 * Lazy load a component using React's lazy loading
 * @param {Function} importFunc - Import function for the component
 * @param {string} componentName - Name of the component
 * @returns {React.LazyExoticComponent} - Lazy-loaded component
 */
function lazyLoadComponent(importFunc, componentName)
```

### preloadResource

Preloads a resource to improve performance.

```javascript
/**
 * Preload a resource to improve performance
 * @param {string} url - URL of the resource to preload
 * @param {string} type - Type of resource from ResourceType enum
 * @param {Object} options - Additional options
 * @returns {HTMLLinkElement} - The preload link element
 */
function preloadResource(url, type, options)
```

### preloadYouTubeThumbnail

Preloads a YouTube video thumbnail.

```javascript
/**
 * Preload YouTube video thumbnail to improve perceived performance
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality
 * @returns {HTMLLinkElement} - The preload link element
 */
function preloadYouTubeThumbnail(videoId, quality)
```

### optimizeImage

Optimizes images for faster loading.

```javascript
/**
 * Optimize images for faster loading
 * @param {string} imageUrl - URL of the image
 * @param {Object} options - Optimization options
 * @returns {string} - Optimized image URL
 */
function optimizeImage(imageUrl, options)
```

### debounce

Debounces a function to improve performance.

```javascript
/**
 * Debounce a function to improve performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Whether to call the function immediately
 * @returns {Function} - Debounced function
 */
function debounce(func, wait, immediate)
```

### throttle

Throttles a function to improve performance.

```javascript
/**
 * Throttle a function to improve performance
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(func, limit)
```

### memoize

Memoizes a function to improve performance for expensive calculations.

```javascript
/**
 * Memoize a function to improve performance for expensive calculations
 * @param {Function} func - Function to memoize
 * @returns {Function} - Memoized function
 */
function memoize(func)
```

### optimizeComponent

Optimizes React component rendering.

```javascript
/**
 * Optimize React component rendering
 * @param {React.Component} Component - React component to optimize
 * @param {Function} propsAreEqual - Function to compare props
 * @returns {React.MemoExoticComponent} - Memoized component
 */
function optimizeComponent(Component, propsAreEqual)
```

### initOptimizations

Initializes performance optimizations.

```javascript
/**
 * Initialize performance optimization
 * @param {Object} options - Optimization options
 */
function initOptimizations(options)
```

## Context API

Located in `src/context/AppContext.js`, these functions provide state management.

### AppProvider

Context provider component.

```javascript
/**
 * App context provider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} - Provider component
 */
function AppProvider({ children })
```

### useAppContext

Hook to access the app context.

```javascript
/**
 * Hook to access the app context
 * @returns {Object} - App context value
 */
function useAppContext()
```

Return value structure:
```javascript
{
  state: {
    url: 'https://www.youtube.com/watch?v=FQlCWrsUpHo',
    result: { /* Video analysis result */ },
    loading: false,
    error: null,
    activeTab: 'summary',
    summaryType: 'detailed',
    recentVideos: [/* Array of recent videos */],
    darkMode: false
  },
  setUrl: function(url) { /* ... */ },
  setResult: function(result) { /* ... */ },
  setLoading: function(loading) { /* ... */ },
  setError: function(error) { /* ... */ },
  clearError: function() { /* ... */ },
  setActiveTab: function(tab) { /* ... */ },
  setSummaryType: function(type) { /* ... */ },
  addRecentVideo: function(video) { /* ... */ },
  removeRecentVideo: function(id) { /* ... */ },
  clearRecentVideos: function() { /* ... */ },
  toggleDarkMode: function() { /* ... */ }
}
```

---

This API reference provides a comprehensive overview of the YouTube Video Summarizer application's utility functions and their parameters. For more detailed information about specific functions, refer to the inline documentation in the source code.

If you have any questions or need further assistance, please refer to the [Developer Guide](./developer-guide.md) or open an issue on the GitHub repository.

*YouTube Video Summarizer - API Reference*
