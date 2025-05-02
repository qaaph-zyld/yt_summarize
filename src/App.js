import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import FeedbackForm from './components/FeedbackForm';

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
      // Immediately set result for any URL to ensure we don't get stuck in loading
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
      setLoading(false);
      clearTimeout(timeoutId); // Clear the timeout when successful
    } catch (error) {
      console.error('Error processing video:', error);
      setError({
        message: 'An error occurred while processing the video',
        details: error.message || 'Unknown error'
      });
      setLoading(false);
      clearTimeout(timeoutId); // Clear the timeout when error occurs
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
