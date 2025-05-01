/**
 * YouTube Video Summarizer Configuration
 * 
 * This file contains configuration settings for the YouTube Video Summarizer application.
 * Modify these settings to customize the behavior of the application.
 */

const config = {
  // API Settings
  api: {
    // YouTube API key (required for production use)
    // In development mode, mock data is used for the test video
    youtubeApiKey: process.env.REACT_APP_YOUTUBE_API_KEY || '',
    
    // Maximum number of API requests per minute
    // Adjust based on your API quota
    maxRequestsPerMinute: 10,
    
    // Enable caching to reduce API calls
    enableCaching: true,
    
    // Cache duration in minutes
    cacheDuration: 60,
  },
  
  // NLP Processing Settings
  nlp: {
    // Minimum confidence score for key point extraction (0-1)
    keyPointMinConfidence: 0.6,
    
    // Maximum number of key points to extract
    maxKeyPoints: 10,
    
    // Minimum number of key points to extract
    minKeyPoints: 3,
    
    // Enable topic identification
    enableTopicIdentification: true,
    
    // Minimum similarity threshold for topic segmentation (0-1)
    topicSimilarityThreshold: 0.2,
    
    // Signal phrases that indicate important information
    signalPhrases: [
      "important", "significant", "key", "essential", "recommend", 
      "should", "must", "crucial", "critical", "main point",
      "to summarize", "in conclusion", "finally", "first", "second", "third"
    ],
  },
  
  // UI Settings
  ui: {
    // Default summary type to display
    defaultSummaryType: 'detailed', // 'brief', 'detailed', or 'executive'
    
    // Default active tab
    defaultActiveTab: 'summary', // 'summary', 'transcript', 'keypoints', or 'topics'
    
    // Enable dark mode
    enableDarkMode: false,
    
    // Enable responsive design
    enableResponsiveDesign: true,
    
    // Maximum transcript length to display (characters)
    // Longer transcripts will be paginated
    maxTranscriptLength: 5000,
    
    // Show video thumbnail
    showVideoThumbnail: true,
  },
  
  // Feature Flags
  features: {
    // Enable export to PDF
    enablePdfExport: true,
    
    // Enable export to text file
    enableTextExport: true,
    
    // Enable copy to clipboard
    enableCopyToClipboard: true,
    
    // Enable share functionality
    enableShare: true,
    
    // Enable command-line interface
    enableCli: true,
    
    // Enable offline mode (uses cached data when available)
    enableOfflineMode: true,
  },
  
  // Default test URL for development
  defaultTestUrl: 'https://youtu.be/FQlCWrsUpHo?si=gTI86azjgzruXN9c',
};

export default config;
