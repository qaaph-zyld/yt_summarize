/**
 * YouTube Utilities Tests
 * 
 * Tests for the YouTube utilities module, including URL validation,
 * video ID extraction, transcript fetching, and processing.
 */

import { 
  extractVideoId, 
  processYouTubeVideo,
  getVideoMetadata,
  getVideoTranscript,
  processTranscript,
  extractKeyPoints,
  generateSummaries,
  identifyTopics
} from '../utils/youtubeUtils';

import { validateYouTubeUrl } from '../utils/errorUtils';

// Mock the API calls
jest.mock('../utils/youtubeUtils', () => {
  const originalModule = jest.requireActual('../utils/youtubeUtils');
  
  // Return the original functions for the ones we want to test directly
  return {
    ...originalModule,
    // Mock the API-dependent functions
    getVideoMetadata: jest.fn(),
    getVideoTranscript: jest.fn(),
  };
});

describe('YouTube Utilities', () => {
  // Test data
  const testVideoId = 'FQlCWrsUpHo';
  const testVideoUrl = `https://www.youtube.com/watch?v=${testVideoId}`;
  
  // Mock data
  const mockMetadata = {
    title: 'Test Video Title',
    channel: 'Test Channel',
    publishedDate: '2023-01-01',
    description: 'This is a test video description',
    category: 'Education',
    tags: ['test', 'video', 'youtube'],
    duration: '10:00',
    views: '1000',
    likes: '100'
  };
  
  const mockTranscriptSegments = [
    { text: 'This is the first segment of the transcript.', start: 0, duration: 5 },
    { text: 'This is the second segment of the transcript.', start: 5, duration: 5 },
    { text: 'This is the third segment of the transcript.', start: 10, duration: 5 },
    { text: 'This is the fourth segment of the transcript.', start: 15, duration: 5 },
    { text: 'This is the fifth segment of the transcript.', start: 20, duration: 5 }
  ];
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    getVideoMetadata.mockResolvedValue(mockMetadata);
    getVideoTranscript.mockResolvedValue(mockTranscriptSegments);
  });
  
  describe('extractVideoId', () => {
    test('extracts video ID from standard YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=FQlCWrsUpHo';
      expect(extractVideoId(url)).toBe('FQlCWrsUpHo');
    });
    
    test('extracts video ID from shortened YouTube URL', () => {
      const url = 'https://youtu.be/FQlCWrsUpHo';
      expect(extractVideoId(url)).toBe('FQlCWrsUpHo');
    });
    
    test('extracts video ID from YouTube URL with timestamp', () => {
      const url = 'https://www.youtube.com/watch?v=FQlCWrsUpHo&t=120s';
      expect(extractVideoId(url)).toBe('FQlCWrsUpHo');
    });
    
    test('extracts video ID from YouTube URL with additional parameters', () => {
      const url = 'https://www.youtube.com/watch?v=FQlCWrsUpHo&feature=youtu.be&t=120s';
      expect(extractVideoId(url)).toBe('FQlCWrsUpHo');
    });
    
    test('extracts video ID from YouTube embed URL', () => {
      const url = 'https://www.youtube.com/embed/FQlCWrsUpHo';
      expect(extractVideoId(url)).toBe('FQlCWrsUpHo');
    });
    
    test('returns null for invalid YouTube URL', () => {
      const url = 'https://www.example.com/video';
      expect(extractVideoId(url)).toBeNull();
    });
  });
  
  describe('validateYouTubeUrl', () => {
    test('validates correct YouTube URL', () => {
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
    
    test('rejects empty URL', () => {
      const url = '';
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
  });
  
  describe('processTranscript', () => {
    test('combines transcript segments correctly', () => {
      const processed = processTranscript(mockTranscriptSegments);
      
      expect(processed).toBeDefined();
      expect(processed.full).toContain('This is the first segment');
      expect(processed.full).toContain('This is the fifth segment');
      expect(processed.readable).toBeDefined();
      expect(processed.segments).toHaveLength(mockTranscriptSegments.length);
      expect(processed.text).toBeDefined();
    });
    
    test('formats timestamps correctly', () => {
      const processed = processTranscript(mockTranscriptSegments);
      
      // Check that timestamps are formatted as expected (e.g., "0:00")
      expect(processed.segments[0].formattedStart).toBe('0:00');
      expect(processed.segments[4].formattedStart).toBe('0:20');
    });
    
    test('handles empty transcript gracefully', () => {
      const processed = processTranscript([]);
      
      expect(processed).toBeDefined();
      expect(processed.full).toBe('');
      expect(processed.readable).toBe('');
      expect(processed.segments).toHaveLength(0);
      expect(processed.text).toBe('');
    });
  });
  
  describe('extractKeyPoints', () => {
    test('extracts key points from transcript text', () => {
      const text = 'This is an important point. Another key insight is this. The main takeaway is that testing is essential.';
      const keyPoints = extractKeyPoints(text);
      
      expect(keyPoints).toBeDefined();
      expect(Array.isArray(keyPoints)).toBe(true);
      expect(keyPoints.length).toBeGreaterThan(0);
    });
    
    test('handles empty text gracefully', () => {
      const keyPoints = extractKeyPoints('');
      
      expect(keyPoints).toBeDefined();
      expect(Array.isArray(keyPoints)).toBe(true);
      expect(keyPoints.length).toBe(0);
    });
  });
  
  describe('generateSummaries', () => {
    test('generates brief, detailed, and executive summaries', () => {
      const text = 'This is a test transcript. It contains multiple sentences. ' +
                  'We want to test the summary generation. This should create summaries of different lengths. ' +
                  'The brief summary should be shortest. The detailed summary should have more information. ' +
                  'The executive summary should focus on key points and insights.';
      
      const summaries = generateSummaries(text);
      
      expect(summaries).toBeDefined();
      expect(summaries.brief).toBeDefined();
      expect(summaries.detailed).toBeDefined();
      expect(summaries.executive).toBeDefined();
      
      // Brief should be shorter than detailed
      expect(summaries.brief.length).toBeLessThan(summaries.detailed.length);
    });
    
    test('handles empty text gracefully', () => {
      const summaries = generateSummaries('');
      
      expect(summaries).toBeDefined();
      expect(summaries.brief).toBe('');
      expect(summaries.detailed).toBe('');
      expect(summaries.executive).toBe('');
    });
  });
  
  describe('identifyTopics', () => {
    test('identifies topics from transcript text', () => {
      const text = 'This video discusses artificial intelligence and machine learning. ' +
                  'We also cover neural networks and deep learning concepts. ' +
                  'Finally, we talk about data science applications.';
      
      const topics = identifyTopics(text);
      
      expect(topics).toBeDefined();
      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBeGreaterThan(0);
    });
    
    test('handles empty text gracefully', () => {
      const topics = identifyTopics('');
      
      expect(topics).toBeDefined();
      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBe(0);
    });
  });
  
  describe('processYouTubeVideo', () => {
    test('processes YouTube video correctly', async () => {
      const result = await processYouTubeVideo(testVideoUrl);
      
      expect(result).toBeDefined();
      expect(result.videoId).toBe(testVideoId);
      expect(result.metadata).toEqual(mockMetadata);
      expect(result.transcript).toBeDefined();
      expect(result.keyPoints).toBeDefined();
      expect(result.summaries).toBeDefined();
      expect(result.topics).toBeDefined();
    });
    
    test('handles errors gracefully', async () => {
      // Mock an error in getVideoMetadata
      getVideoMetadata.mockRejectedValueOnce(new Error('API error'));
      
      try {
        await processYouTubeVideo(testVideoUrl);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('API error');
      }
    });
  });
});
