import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple mock processing
    setTimeout(() => {
      setResult({
        title: 'Sample YouTube Video',
        channel: 'Test Channel',
        duration: '10:00',
        summary: 'This is a sample summary of the video content.'
      });
      setLoading(false);
    }, 1500);
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
            <p>Channel: {result.channel}</p>
            <p>Duration: {result.duration}</p>
            <h3>Summary</h3>
            <p>{result.summary}</p>
          </div>
        )}
      </main>
      
      <footer className="App-footer">
        <p>YouTube Video Summarizer - Powered by NLP Technology</p>
      </footer>
    </div>
  );
}

export default App;
