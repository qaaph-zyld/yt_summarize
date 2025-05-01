/**
 * Error Utilities Tests
 * 
 * Tests for the error handling and validation utilities.
 */

import { 
  YouTubeError,
  ValidationError,
  TranscriptError,
  APIError,
  ProcessingError,
  validateYouTubeUrl,
  getUserFriendlyErrorMessage,
  logError
} from '../utils/errorUtils';

describe('Error Utilities', () => {
  describe('Custom Error Classes', () => {
    test('YouTubeError has correct properties', () => {
      const error = new YouTubeError('Test error', 'TEST_CODE');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('YouTubeError');
    });
    
    test('ValidationError has correct properties', () => {
      const error = new ValidationError('Test validation error');
      expect(error.message).toBe('Test validation error');
      expect(error.name).toBe('ValidationError');
    });
    
    test('TranscriptError has correct properties', () => {
      const error = new TranscriptError('Test transcript error');
      expect(error.message).toBe('Test transcript error');
      expect(error.name).toBe('TranscriptError');
    });
    
    test('APIError has correct properties', () => {
      const error = new APIError('Test API error', 404);
      expect(error.message).toBe('Test API error');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('APIError');
    });
    
    test('ProcessingError has correct properties', () => {
      const error = new ProcessingError('Test processing error');
      expect(error.message).toBe('Test processing error');
      expect(error.name).toBe('ProcessingError');
    });
  });
  
  describe('validateYouTubeUrl', () => {
    test('validates standard YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=FQlCWrsUpHo';
      const result = validateYouTubeUrl(url);
      expect(result.isValid).toBe(true);
      expect(result.videoId).toBe('FQlCWrsUpHo');
    });
    
    test('validates shortened YouTube URL', () => {
      const url = 'https://youtu.be/FQlCWrsUpHo';
      const result = validateYouTubeUrl(url);
      expect(result.isValid).toBe(true);
      expect(result.videoId).toBe('FQlCWrsUpHo');
    });
    
    test('validates YouTube URL with timestamp', () => {
      const url = 'https://www.youtube.com/watch?v=FQlCWrsUpHo&t=120s';
      const result = validateYouTubeUrl(url);
      expect(result.isValid).toBe(true);
      expect(result.videoId).toBe('FQlCWrsUpHo');
    });
    
    test('validates YouTube embed URL', () => {
      const url = 'https://www.youtube.com/embed/FQlCWrsUpHo';
      const result = validateYouTubeUrl(url);
      expect(result.isValid).toBe(true);
      expect(result.videoId).toBe('FQlCWrsUpHo');
    });
    
    test('rejects empty URL', () => {
      const url = '';
      const result = validateYouTubeUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
    
    test('rejects null URL', () => {
      const url = null;
      const result = validateYouTubeUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
    
    test('rejects non-string URL', () => {
      const url = 123;
      const result = validateYouTubeUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
    
    test('rejects non-YouTube URL', () => {
      const url = 'https://www.example.com/video';
      const result = validateYouTubeUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
    
    test('rejects YouTube URL without video ID', () => {
      const url = 'https://www.youtube.com/';
      const result = validateYouTubeUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
    
    test('rejects YouTube URL with invalid video ID', () => {
      const url = 'https://www.youtube.com/watch?v=abc';
      const result = validateYouTubeUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
  
  describe('getUserFriendlyErrorMessage', () => {
    test('returns message for YouTubeError', () => {
      const error = new YouTubeError('Test YouTube error', 'INVALID_URL');
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('YouTube');
    });
    
    test('returns message for ValidationError', () => {
      const error = new ValidationError('Test validation error');
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('valid');
    });
    
    test('returns message for TranscriptError', () => {
      const error = new TranscriptError('Test transcript error');
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('transcript');
    });
    
    test('returns message for APIError', () => {
      const error = new APIError('Test API error', 404);
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('API');
    });
    
    test('returns message for ProcessingError', () => {
      const error = new ProcessingError('Test processing error');
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('process');
    });
    
    test('returns generic message for unknown error', () => {
      const error = new Error('Unknown error');
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('error');
    });
    
    test('handles error as string', () => {
      const message = getUserFriendlyErrorMessage('String error');
      expect(message).toBeTruthy();
    });
    
    test('handles null/undefined error', () => {
      const message1 = getUserFriendlyErrorMessage(null);
      const message2 = getUserFriendlyErrorMessage(undefined);
      expect(message1).toBeTruthy();
      expect(message2).toBeTruthy();
    });
  });
  
  describe('logError', () => {
    // Save original console.error
    const originalConsoleError = console.error;
    
    beforeEach(() => {
      // Mock console.error
      console.error = jest.fn();
    });
    
    afterEach(() => {
      // Restore console.error
      console.error = originalConsoleError;
    });
    
    test('logs error message and details', () => {
      const error = new Error('Test error');
      logError('Error context', error);
      
      expect(console.error).toHaveBeenCalled();
      const args = console.error.mock.calls[0];
      expect(args[0]).toContain('Error context');
      expect(args[1]).toBe(error);
    });
    
    test('logs error with additional data', () => {
      const error = new Error('Test error');
      const data = { userId: '123', action: 'test' };
      logError('Error context', error, data);
      
      expect(console.error).toHaveBeenCalled();
      const args = console.error.mock.calls[0];
      expect(args[0]).toContain('Error context');
      expect(args[1]).toBe(error);
      expect(args[2]).toEqual(data);
    });
    
    test('handles non-Error objects', () => {
      logError('Error context', 'String error');
      
      expect(console.error).toHaveBeenCalled();
      const args = console.error.mock.calls[0];
      expect(args[0]).toContain('Error context');
      expect(args[1]).toBe('String error');
    });
  });
});
