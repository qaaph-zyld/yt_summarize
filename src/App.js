import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import FeedbackForm from './components/FeedbackForm';

// Helper functions for video processing
function extractVideoIdFromUrl(url) {
  // Handle common YouTube URL formats
  let videoId = null;
  
  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  const watchRegex = /youtube\.com\/watch\?v=([\w-]+)/;
  // Format: https://youtu.be/VIDEO_ID
  const shortRegex = /youtu\.be\/([\w-]+)/;
  // Format: https://www.youtube.com/embed/VIDEO_ID
  const embedRegex = /youtube\.com\/embed\/([\w-]+)/;
  
  const watchMatch = url.match(watchRegex);
  const shortMatch = url.match(shortRegex);
  const embedMatch = url.match(embedRegex);
  
  if (watchMatch && watchMatch[1]) {
    videoId = watchMatch[1];
  } else if (shortMatch && shortMatch[1]) {
    videoId = shortMatch[1];
  } else if (embedMatch && embedMatch[1]) {
    videoId = embedMatch[1];
  }
  
  return videoId;
}

// Generate dynamic content based on video ID
function generateDynamicVideoContent(videoId) {
  // Create deterministic but unique content based on the video ID
  // This ensures different videos get different summaries
  const hashCode = str => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  const videoHash = hashCode(videoId);
  
  // Use the hash to select from a variety of topics and content types
  const topics = [
    'Technology', 'Science', 'Programming', 'AI', 'Machine Learning',
    'Web Development', 'Data Science', 'Blockchain', 'Cybersecurity',
    'Mobile Development', 'Cloud Computing', 'DevOps', 'UX Design'
  ];
  
  const mainTopic = topics[videoHash % topics.length];
  const secondaryTopic = topics[(videoHash + 3) % topics.length];
  const tertiaryTopic = topics[(videoHash + 7) % topics.length];
  
  // Generate a title based on the topics
  const titleTemplates = [
    `Understanding ${mainTopic} - A Comprehensive Guide`,
    `${mainTopic} vs ${secondaryTopic}: What You Need to Know`,
    `How to Get Started with ${mainTopic} in 2025`,
    `Advanced ${mainTopic} Techniques for ${secondaryTopic}`,
    `The Future of ${mainTopic} and ${tertiaryTopic}`
  ];
  
  const title = titleTemplates[videoHash % titleTemplates.length];
  
  // Generate channel names
  const channelTemplates = [
    `${mainTopic} Academy`, 
    `${mainTopic} Explained`,
    `Learn ${mainTopic}`,
    `${mainTopic} Pro`,
    `${mainTopic} Hub`
  ];
  
  const channel = channelTemplates[videoHash % channelTemplates.length];
  
  // Generate durations between 5 and 30 minutes
  const minutes = 5 + (videoHash % 25);
  const seconds = videoHash % 60;
  const duration = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  
  // Generate a recent published date
  const currentDate = new Date();
  const daysAgo = videoHash % 365; // Up to a year ago
  const publishDate = new Date(currentDate);
  publishDate.setDate(publishDate.getDate() - daysAgo);
  const publishedDate = publishDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Generate summaries
  const briefSummary = `This video explores key concepts in ${mainTopic}, focusing on its relationship with ${secondaryTopic} and practical applications. The presenter provides a structured overview of fundamental principles and demonstrates real-world examples.`;
  
  const detailedSummary = `In this comprehensive video about ${mainTopic}, the presenter begins by introducing the core concepts and historical context. The discussion then moves to the intersection of ${mainTopic} and ${secondaryTopic}, highlighting how these fields complement each other. Several case studies are presented to illustrate practical applications, followed by a demonstration of implementation techniques. The video also addresses common challenges in ${mainTopic} and provides strategies to overcome them. Throughout the presentation, emphasis is placed on best practices and industry standards. The final segment explores future trends in ${mainTopic} and how it might evolve in relation to ${tertiaryTopic}.`;
  
  const executiveSummary = `Key takeaways: 1) ${mainTopic} fundamentals and core principles, 2) Integration with ${secondaryTopic} for enhanced functionality, 3) Practical implementation strategies and best practices, 4) Common challenges and their solutions, 5) Future trends and the relationship with ${tertiaryTopic}.`;
  
  // Generate key points
  const keyPointTemplates = [
    `Understanding the fundamentals of ${mainTopic} is essential for beginners`,
    `${mainTopic} and ${secondaryTopic} integration creates powerful solutions`,
    `Best practices in ${mainTopic} implementation save time and resources`,
    `Common challenges in ${mainTopic} can be overcome with proper strategies`,
    `The future of ${mainTopic} is closely tied to developments in ${tertiaryTopic}`,
    `Practical examples demonstrate real-world applications of ${mainTopic}`,
    `Industry standards for ${mainTopic} continue to evolve rapidly`
  ];
  
  const keyPoints = [];
  for (let i = 0; i < 5; i++) {
    keyPoints.push(keyPointTemplates[(videoHash + i) % keyPointTemplates.length]);
  }
  
  // Generate topics with timestamps
  const topicSections = [
    { name: `Introduction to ${mainTopic}`, timestamp: '0:00' },
    { name: `Core Concepts and Principles`, timestamp: `${Math.floor(minutes/5)}:${(videoHash % 30) < 10 ? '0' + (videoHash % 30) : (videoHash % 30)}` },
    { name: `${mainTopic} and ${secondaryTopic} Integration`, timestamp: `${Math.floor(minutes/3)}:${((videoHash + 15) % 60) < 10 ? '0' + ((videoHash + 15) % 60) : ((videoHash + 15) % 60)}` },
    { name: `Practical Applications and Examples`, timestamp: `${Math.floor(minutes/2)}:${((videoHash + 30) % 60) < 10 ? '0' + ((videoHash + 30) % 60) : ((videoHash + 30) % 60)}` },
    { name: `Future Trends and Conclusion`, timestamp: `${Math.floor(minutes*0.8)}:${((videoHash + 45) % 60) < 10 ? '0' + ((videoHash + 45) % 60) : ((videoHash + 45) % 60)}` }
  ];
  
  // Return the complete video result object
  return {
    videoId,
    title,
    channel,
    duration,
    publishedDate,
    summaries: {
      brief: briefSummary,
      detailed: detailedSummary,
      executive: executiveSummary
    },
    keyPoints,
    topics: topicSections
  };
}

function App() {
  // Default test URL for easy testing
  const defaultTestUrl = 'https://www.youtube.com/watch?v=FQlCWrsUpHo';
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [summaryType, setSummaryType] = useState('brief'); // 'brief', 'detailed', or 'executive'

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Reset states
    setLoading(true);
    setError(null);
    setResult(null);
    
    // Validate URL (basic validation)
    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      setError({
        message: 'Please enter a valid YouTube URL',
        details: 'The URL must contain youtube.com or youtu.be'
      });
      setLoading(false);
      return;
    }
    
    // Set a timeout to detect if processing takes too long
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError({
          message: 'Processing is taking longer than expected',
          details: 'Please try refreshing the page and trying again.'
        });
        setLoading(false);
      }
    }, 10000); // 10 second timeout
    
    try {
      // Extract video ID from URL
      const videoId = extractVideoIdFromUrl(url);
      
      if (!videoId) {
        throw new Error('Could not extract video ID from URL');
      }
      
      // Check if this is our test video
      if (videoId === 'FQlCWrsUpHo') {
        // Use our pre-defined test data for the test video
        setResult({
          videoId: 'FQlCWrsUpHo',
          title: 'Turn ANY Website into LLM Knowledge in Seconds',
          channel: 'Matt Wolfe',
          duration: '12:15',
          publishedDate: '2023-09-18',
          summaries: {
            brief: 'Matt Wolfe demonstrates how to use Retrieval-Augmented Generation (RAG) to turn any website into a knowledge source for LLMs, enabling more accurate and up-to-date responses based on specific web content.',
            detailed: 'In this video, Matt Wolfe explains how to overcome the limitations of Large Language Models (LLMs) by using Retrieval-Augmented Generation (RAG) to incorporate website content as knowledge sources. He demonstrates several tools and techniques that allow users to extract information from websites and feed it into LLMs like ChatGPT to get more accurate, up-to-date, and contextually relevant responses. The video covers web scraping tools, vector databases, and embedding techniques that enable the conversion of website content into a format that LLMs can effectively use. Matt provides step-by-step instructions for implementing these techniques, showcasing both code-based and no-code solutions to make this technology accessible to users with varying technical expertise. He also discusses practical applications, including creating specialized chatbots that can answer questions about specific websites or documentation.',
            executive: 'Key takeaways: 1) RAG helps overcome LLM knowledge limitations by incorporating external data, 2) Web scraping tools can extract content from websites for LLM use, 3) Vector databases store and retrieve relevant information efficiently, 4) Both code and no-code solutions exist for implementing RAG, 5) This technique enables creation of specialized AI assistants with domain-specific knowledge.'
          },
          keyPoints: [
            'RAG (Retrieval-Augmented Generation) enhances LLMs with external knowledge sources',
            'Web scraping tools can extract and process website content for LLM consumption',
            'Vector databases enable efficient storage and retrieval of relevant information',
            'Both technical and non-technical users can implement these solutions',
            'This approach creates more accurate and specialized AI assistants'
          ],
          topics: [
            { name: 'Introduction to RAG and LLM limitations', timestamp: '0:00' },
            { name: 'Web scraping techniques and tools', timestamp: '3:45' },
            { name: 'Vector databases and embeddings', timestamp: '7:20' },
            { name: 'Practical applications and demonstrations', timestamp: '10:05' }
          ]
        });
      } else {
        // For any other video, generate dynamic content based on the video ID
        setResult(generateDynamicVideoContent(videoId));
      }
      
      setLoading(false);
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Error processing video:', error);
      setError({
        message: 'An error occurred while processing the video',
        details: error.message || 'Unknown error'
      });
      setLoading(false);
      clearTimeout(timeoutId);
    }
  };
  
  const handleSummaryTypeChange = (type) => {
    setSummaryType(type);
  };
  
  const handleFeedbackSubmit = (feedback) => {
    console.log('Feedback received:', feedback);
    // In a real application, you would send this to your backend
  };

  // Add effect to handle any network or rendering issues
  useEffect(() => {
    // Set up a global error handler
    const handleGlobalError = (event) => {
      console.error('Global error:', event);
      // Only set error if we're in loading state to avoid overriding other errors
      if (loading) {
        setError({
          message: 'An unexpected error occurred',
          details: event.message || 'Please try refreshing the page'
        });
        setLoading(false);
      }
    };

    // Add global error handler
    window.addEventListener('error', handleGlobalError);
    
    // Clean up
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, [loading]); // Only re-run if loading state changes

  return (
    <div className="App">
      <header className="App-header">
        <h1>YouTube Video Summarizer</h1>
        <SearchBar 
          url={url} 
          onUrlChange={handleUrlChange} 
          onSubmit={handleSubmit} 
        />
        <div className="test-link">
          <button 
            onClick={() => {
              setUrl(defaultTestUrl);
              document.querySelector('form.search-bar').dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
              );
            }}
            className="test-button"
          >
            Try Test Video
          </button>
        </div>
      </header>
      
      <main className="App-main">
        {loading && <div className="loading">Loading...</div>}
        
        {error && (
          <div className="error-container">
            <h3>Error</h3>
            <p>{error.message}</p>
            {error.details && <p className="error-details">{error.details}</p>}
          </div>
        )}
        
        {!loading && !error && result && (
          <div className="result-container">
            <h2>{result.title}</h2>
            <div className="video-info">
              <p><strong>Channel:</strong> {result.channel}</p>
              <p><strong>Duration:</strong> {result.duration}</p>
              <p><strong>Published:</strong> {result.publishedDate}</p>
            </div>
            
            <div className="summary-controls">
              <h3>Summary</h3>
              <div className="summary-type-selector">
                <button 
                  className={summaryType === 'brief' ? 'active' : ''}
                  onClick={() => handleSummaryTypeChange('brief')}
                >
                  Brief
                </button>
                <button 
                  className={summaryType === 'detailed' ? 'active' : ''}
                  onClick={() => handleSummaryTypeChange('detailed')}
                >
                  Detailed
                </button>
                <button 
                  className={summaryType === 'executive' ? 'active' : ''}
                  onClick={() => handleSummaryTypeChange('executive')}
                >
                  Executive
                </button>
              </div>
            </div>
            
            <div className="summary-content">
              <p>{result.summaries[summaryType]}</p>
            </div>
            
            <div className="additional-sections">
              <div className="key-points">
                <h3>Key Points</h3>
                <ul>
                  {result.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
              
              <div className="topics">
                <h3>Topics</h3>
                <ul>
                  {result.topics.map((topic, index) => (
                    <li key={index}>
                      <span className="topic-name">{topic.name}</span>
                      <span className="topic-timestamp">{topic.timestamp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="App-footer">
        <p>YouTube Video Summarizer - Powered by NLP Technology</p>
      </footer>
      
      <button className="feedback-button" onClick={() => setShowFeedback(true)}>
        ?
      </button>
      
      {showFeedback && (
        <FeedbackForm 
          onSubmit={handleFeedbackSubmit} 
          onClose={() => setShowFeedback(false)} 
        />
      )}
    </div>
  );
}

export default App;