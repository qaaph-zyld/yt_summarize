import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import FeedbackForm from './components/FeedbackForm';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [summaryType, setSummaryType] = useState('brief'); // 'brief', 'detailed', or 'executive'

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Enhanced mock processing with different summary types
    setTimeout(() => {
      setResult({
        videoId: 'FQlCWrsUpHo',
        title: 'Sample YouTube Video',
        channel: 'Test Channel',
        duration: '10:00',
        publishedDate: '2023-01-01',
        summaries: {
          brief: 'This is a brief summary of the video content.',
          detailed: 'This is a more detailed summary of the video content. It includes additional information about the topics covered and provides more context about the discussion points. The detailed summary is designed to give viewers a comprehensive understanding without watching the full video.',
          executive: 'Key takeaways: 1) Main point one, 2) Main point two, 3) Main point three.'
        },
        keyPoints: [
          'First key point from the video',
          'Second important concept discussed',
          'Third significant idea presented'
        ],
        topics: [
          { name: 'Introduction', timestamp: '0:00' },
          { name: 'Main Content', timestamp: '2:30' },
          { name: 'Conclusion', timestamp: '8:45' }
        ]
      });
      setLoading(false);
    }, 1500);
  };
  
  const handleSummaryTypeChange = (type) => {
    setSummaryType(type);
  };
  
  const handleFeedbackSubmit = (feedback) => {
    console.log('Feedback received:', feedback);
    // In a real application, you would send this to your backend
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>YouTube Video Summarizer</h1>
        <SearchBar 
          url={url} 
          onUrlChange={handleUrlChange} 
          onSubmit={handleSubmit} 
        />
      </header>
      
      <main className="App-main">
        {loading && <div className="loading">Loading...</div>}
        
        {result && (
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
