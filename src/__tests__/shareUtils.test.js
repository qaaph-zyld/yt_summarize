/**
 * Share Utilities Tests
 * 
 * Tests for the share and export utilities.
 */

import { 
  generateShareableUrl,
  shareViaWebShare,
  copyToClipboard,
  generateSummaryText,
  generateFullAnalysisText,
  downloadAsFile,
  shareToSocialMedia
} from '../utils/shareUtils';

describe('Share Utilities', () => {
  // Mock data
  const mockVideoId = 'FQlCWrsUpHo';
  const mockResult = {
    videoId: mockVideoId,
    metadata: {
      title: 'Test Video Title',
      channel: 'Test Channel',
      publishedDate: '2023-01-01'
    },
    summaries: {
      brief: 'Brief summary of the video.',
      detailed: 'Detailed summary of the video with more information.',
      executive: 'Executive summary focusing on key points.'
    },
    keyPoints: [
      'First key point',
      'Second key point',
      'Third key point'
    ],
    transcript: {
      full: 'This is the full transcript text.',
      readable: 'This is the readable transcript text.'
    },
    topics: [
      'Topic 1',
      'Topic 2',
      'Topic 3'
    ]
  };
  
  // Save original window.location and window.open
  const originalLocation = window.location;
  const originalOpen = window.open;
  
  beforeEach(() => {
    // Mock window.location
    delete window.location;
    window.location = {
      origin: 'https://example.com',
      pathname: '/app',
      href: 'https://example.com/app'
    };
    
    // Mock window.open
    window.open = jest.fn();
    
    // Mock document.createElement and related methods
    document.createElement = jest.fn().mockImplementation(tag => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: jest.fn(),
          style: {}
        };
      }
      if (tag === 'textarea') {
        return {
          value: '',
          style: {},
          focus: jest.fn(),
          select: jest.fn()
        };
      }
      return {};
    });
    
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.execCommand = jest.fn().mockReturnValue(true);
  });
  
  afterEach(() => {
    // Restore window.location and window.open
    window.location = originalLocation;
    window.open = originalOpen;
  });
  
  describe('generateShareableUrl', () => {
    test('generates URL with video ID only', () => {
      const url = generateShareableUrl(mockVideoId);
      expect(url).toBe('https://example.com/app?v=FQlCWrsUpHo&tab=summary&type=detailed');
    });
    
    test('generates URL with video ID and tab', () => {
      const url = generateShareableUrl(mockVideoId, 'transcript');
      expect(url).toBe('https://example.com/app?v=FQlCWrsUpHo&tab=transcript&type=detailed');
    });
    
    test('generates URL with video ID, tab, and summary type', () => {
      const url = generateShareableUrl(mockVideoId, 'summary', 'brief');
      expect(url).toBe('https://example.com/app?v=FQlCWrsUpHo&tab=summary&type=brief');
    });
  });
  
  describe('shareViaWebShare', () => {
    test('shares content via Web Share API if available', async () => {
      // Mock navigator.share
      navigator.share = jest.fn().mockResolvedValue(undefined);
      
      const shareData = {
        title: 'Test Title',
        text: 'Test Text',
        url: 'https://example.com'
      };
      
      const result = await shareViaWebShare(shareData);
      
      expect(result).toBe(true);
      expect(navigator.share).toHaveBeenCalledWith(shareData);
    });
    
    test('returns false if Web Share API is not available', async () => {
      // Remove navigator.share
      delete navigator.share;
      
      const shareData = {
        title: 'Test Title',
        text: 'Test Text',
        url: 'https://example.com'
      };
      
      const result = await shareViaWebShare(shareData);
      
      expect(result).toBe(false);
    });
    
    test('handles errors from Web Share API', async () => {
      // Mock navigator.share to throw error
      navigator.share = jest.fn().mockRejectedValue(new Error('Share failed'));
      
      const shareData = {
        title: 'Test Title',
        text: 'Test Text',
        url: 'https://example.com'
      };
      
      const result = await shareViaWebShare(shareData);
      
      expect(result).toBe(false);
    });
  });
  
  describe('copyToClipboard', () => {
    test('copies text to clipboard using Clipboard API', async () => {
      const text = 'Text to copy';
      const result = await copyToClipboard(text);
      
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    });
    
    test('uses fallback method if Clipboard API fails', async () => {
      // Mock clipboard.writeText to throw error
      navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('Clipboard API failed'));
      
      const text = 'Text to copy';
      const result = await copyToClipboard(text);
      
      expect(result).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });
    
    test('returns false if both methods fail', async () => {
      // Mock clipboard.writeText to throw error
      navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('Clipboard API failed'));
      
      // Mock document.execCommand to return false
      document.execCommand = jest.fn().mockReturnValue(false);
      
      const text = 'Text to copy';
      const result = await copyToClipboard(text);
      
      expect(result).toBe(false);
    });
  });
  
  describe('generateSummaryText', () => {
    test('generates summary text with video title and summary', () => {
      const text = generateSummaryText(mockResult, 'brief');
      
      expect(text).toContain(mockResult.metadata.title);
      expect(text).toContain(mockResult.summaries.brief);
      expect(text).toContain(mockResult.videoId);
    });
    
    test('uses detailed summary by default', () => {
      const text = generateSummaryText(mockResult);
      
      expect(text).toContain(mockResult.summaries.detailed);
    });
    
    test('handles missing result gracefully', () => {
      const text1 = generateSummaryText(null);
      const text2 = generateSummaryText({});
      const text3 = generateSummaryText({ metadata: {} });
      
      expect(text1).toBe('');
      expect(text2).toBe('');
      expect(text3).toBe('');
    });
  });
  
  describe('generateFullAnalysisText', () => {
    test('generates full analysis text with all sections', () => {
      const text = generateFullAnalysisText(mockResult);
      
      expect(text).toContain(mockResult.metadata.title);
      expect(text).toContain(mockResult.metadata.channel);
      expect(text).toContain(mockResult.summaries.brief);
      expect(text).toContain(mockResult.summaries.detailed);
      expect(text).toContain(mockResult.keyPoints[0]);
      expect(text).toContain(mockResult.transcript.full);
      expect(text).toContain(mockResult.videoId);
    });
    
    test('handles missing result gracefully', () => {
      const text1 = generateFullAnalysisText(null);
      const text2 = generateFullAnalysisText({});
      
      expect(text1).toBe('');
      expect(text2).toBe('');
    });
  });
  
  describe('downloadAsFile', () => {
    test('downloads text as a plain text file', () => {
      const text = 'Text content';
      const filename = 'test-file';
      
      downloadAsFile(text, filename, 'txt');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      const mockAnchor = document.createElement('a');
      expect(mockAnchor.download).toBe('test-file.txt');
      expect(mockAnchor.click).toHaveBeenCalled();
    });
    
    test('downloads text as a markdown file', () => {
      const text = '# Markdown content';
      const filename = 'test-file';
      
      downloadAsFile(text, filename, 'md');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      const mockAnchor = document.createElement('a');
      expect(mockAnchor.download).toBe('test-file.md');
      expect(mockAnchor.click).toHaveBeenCalled();
    });
    
    test('downloads text as an HTML file', () => {
      const text = 'HTML content';
      const filename = 'test-file';
      
      downloadAsFile(text, filename, 'html');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      const mockAnchor = document.createElement('a');
      expect(mockAnchor.download).toBe('test-file.html');
      expect(mockAnchor.click).toHaveBeenCalled();
    });
  });
  
  describe('shareToSocialMedia', () => {
    test('shares to Twitter', () => {
      const data = {
        title: 'Test Title',
        text: 'Test Text',
        url: 'https://example.com'
      };
      
      shareToSocialMedia('twitter', data);
      
      expect(window.open).toHaveBeenCalled();
      const url = window.open.mock.calls[0][0];
      expect(url).toContain('twitter.com/intent/tweet');
      expect(url).toContain(encodeURIComponent(data.text));
      expect(url).toContain(encodeURIComponent(data.url));
    });
    
    test('shares to Facebook', () => {
      const data = {
        title: 'Test Title',
        text: 'Test Text',
        url: 'https://example.com'
      };
      
      shareToSocialMedia('facebook', data);
      
      expect(window.open).toHaveBeenCalled();
      const url = window.open.mock.calls[0][0];
      expect(url).toContain('facebook.com/sharer');
      expect(url).toContain(encodeURIComponent(data.url));
    });
    
    test('shares to LinkedIn', () => {
      const data = {
        title: 'Test Title',
        text: 'Test Text',
        url: 'https://example.com'
      };
      
      shareToSocialMedia('linkedin', data);
      
      expect(window.open).toHaveBeenCalled();
      const url = window.open.mock.calls[0][0];
      expect(url).toContain('linkedin.com/sharing');
      expect(url).toContain(encodeURIComponent(data.url));
      expect(url).toContain(encodeURIComponent(data.title));
    });
    
    test('shares via email', () => {
      const data = {
        title: 'Test Title',
        text: 'Test Text',
        url: 'https://example.com'
      };
      
      shareToSocialMedia('email', data);
      
      expect(window.open).toHaveBeenCalled();
      const url = window.open.mock.calls[0][0];
      expect(url).toContain('mailto:');
      expect(url).toContain(encodeURIComponent(data.title));
      expect(url).toContain(encodeURIComponent(data.text));
      expect(url).toContain(encodeURIComponent(data.url));
    });
    
    test('handles unsupported platform gracefully', () => {
      const data = {
        title: 'Test Title',
        text: 'Test Text',
        url: 'https://example.com'
      };
      
      shareToSocialMedia('unsupported', data);
      
      expect(window.open).not.toHaveBeenCalled();
    });
  });
});
