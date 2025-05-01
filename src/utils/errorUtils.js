/**
 * Error Handling Utilities
 * 
 * This module contains functions and classes for handling errors in the YouTube Video Summarizer application.
 * It provides standardized error types, validation functions, and error handling mechanisms.
 */

// Custom error classes
export class YouTubeError extends Error {
  constructor(message, code = 'YOUTUBE_ERROR') {
    super(message);
    this.name = 'YouTubeError';
    this.code = code;
  }
}

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class TranscriptError extends Error {
  constructor(message, code = 'TRANSCRIPT_ERROR') {
    super(message);
    this.name = 'TranscriptError';
    this.code = code;
  }
}

export class APIError extends Error {
  constructor(message, status = null, endpoint = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

export class ProcessingError extends Error {
  constructor(message, stage = null) {
    super(message);
    this.name = 'ProcessingError';
    this.stage = stage;
  }
}

/**
 * Validate a YouTube URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid, throws ValidationError if invalid
 */
export function validateYouTubeUrl(url) {
  if (!url) {
    throw new ValidationError('YouTube URL is required', 'url');
  }
  
  // Check if URL is a string
  if (typeof url !== 'string') {
    throw new ValidationError('YouTube URL must be a string', 'url');
  }
  
  // Check if URL is empty
  if (url.trim() === '') {
    throw new ValidationError('YouTube URL cannot be empty', 'url');
  }
  
  // Check if URL matches YouTube format
  const regExp = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
  if (!regExp.test(url)) {
    throw new ValidationError('Invalid YouTube URL format', 'url');
  }
  
  return true;
}

/**
 * Validate video ID
 * @param {string} videoId - Video ID to validate
 * @returns {boolean} - True if valid, throws ValidationError if invalid
 */
export function validateVideoId(videoId) {
  if (!videoId) {
    throw new ValidationError('Video ID is required', 'videoId');
  }
  
  // Check if video ID is a string
  if (typeof videoId !== 'string') {
    throw new ValidationError('Video ID must be a string', 'videoId');
  }
  
  // Check if video ID is empty
  if (videoId.trim() === '') {
    throw new ValidationError('Video ID cannot be empty', 'videoId');
  }
  
  // Check if video ID matches YouTube format (11 characters)
  if (videoId.length !== 11) {
    throw new ValidationError('Invalid YouTube video ID format', 'videoId');
  }
  
  return true;
}

/**
 * Handle API errors and provide user-friendly messages
 * @param {Error} error - The error object
 * @returns {Object} - Standardized error object with user-friendly message
 */
export function handleApiError(error) {
  console.error('API Error:', error);
  
  let userMessage = 'An error occurred while processing your request.';
  let errorCode = 'UNKNOWN_ERROR';
  
  if (error instanceof YouTubeError) {
    userMessage = error.message;
    errorCode = error.code;
  } else if (error instanceof ValidationError) {
    userMessage = error.message;
    errorCode = 'VALIDATION_ERROR';
  } else if (error instanceof TranscriptError) {
    userMessage = error.message;
    errorCode = error.code;
  } else if (error instanceof APIError) {
    userMessage = `API Error: ${error.message}`;
    errorCode = `API_ERROR_${error.status || 'UNKNOWN'}`;
  } else if (error instanceof ProcessingError) {
    userMessage = `Processing Error: ${error.message}`;
    errorCode = `PROCESSING_ERROR_${error.stage || 'UNKNOWN'}`;
  } else if (error.message) {
    userMessage = error.message;
  }
  
  return {
    error: true,
    message: userMessage,
    code: errorCode
  };
}

/**
 * Log errors to console and potentially to a monitoring service
 * @param {Error} error - The error object
 * @param {string} context - The context in which the error occurred
 */
export function logError(error, context = 'general') {
  console.error(`Error in ${context}:`, error);
  
  // In a production environment, this would send the error to a monitoring service
  // such as Sentry, LogRocket, or a custom logging endpoint
  
  // Example:
  // if (process.env.NODE_ENV === 'production') {
  //   sendErrorToMonitoringService(error, context);
  // }
}

/**
 * Create a user-friendly error message based on the error type
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export function getUserFriendlyErrorMessage(error) {
  if (error instanceof ValidationError) {
    return `Please check your input: ${error.message}`;
  }
  
  if (error instanceof YouTubeError) {
    switch (error.code) {
      case 'VIDEO_NOT_FOUND':
        return 'The YouTube video could not be found. Please check the URL and try again.';
      case 'VIDEO_UNAVAILABLE':
        return 'This video is unavailable. It may be private or have been removed.';
      case 'TRANSCRIPT_UNAVAILABLE':
        return 'No transcript is available for this video. The creator may not have added captions.';
      default:
        return `YouTube error: ${error.message}`;
    }
  }
  
  if (error instanceof APIError) {
    if (error.status === 403) {
      return 'API access denied. This may be due to quota limitations or authentication issues.';
    }
    if (error.status === 404) {
      return 'The requested resource was not found. Please check the URL and try again.';
    }
    if (error.status >= 500) {
      return 'The server encountered an error. Please try again later.';
    }
    return `API error: ${error.message}`;
  }
  
  if (error instanceof TranscriptError) {
    return `Transcript error: ${error.message}`;
  }
  
  if (error instanceof ProcessingError) {
    return `Error processing video: ${error.message}`;
  }
  
  // Generic error message for unknown errors
  return 'An unexpected error occurred. Please try again later.';
}
