import React, { useEffect } from 'react';
import { processYouTubeVideo } from './utils/youtubeUtils';
import { validateYouTubeUrl, getUserFriendlyErrorMessage } from './utils/errorUtils';
import { getCachedResult, cacheResult } from './utils/cacheUtils';
import { useAppContext } from './context/AppContext';
import { debug, error, measureAsyncExecutionTime, fixVideoResult, checkBrowserCompatibility } from './utils/debugUtils';
import config from './config';
import './App.css';

// Components
import SearchBar from './components/SearchBar';
import VideoInfo from './components/VideoInfo';
import SummarySection from './components/SummarySection';
import TranscriptViewer from './components/TranscriptViewer';
import KeyPointsList from './components/KeyPointsList';
import TopicsList from './components/TopicsList';
import LoadingState from './components/LoadingState';
import ErrorDisplay from './components/ErrorDisplay';
import ShareButton from './components/ShareButton';
import ExportOptions from './components/ExportOptions';

function App() {
  // Check browser compatibility on component mount
  useEffect(() => {
    const compatibility = checkBrowserCompatibility();
    if (!compatibility.isCompatible) {
      debug('Browser compatibility issues detected:', compatibility.missingFeatures);
    }
  }, []);
  const { 
    state: { url, result, loading, error, activeTab, summaryType },
    setUrl,
    setResult,
    setLoading,
    setError,
    clearError,
    setActiveTab,
    setSummaryType
  } = useAppContext();

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    
    try {
      // Validate URL
      debug('Validating URL:', url);
      const validationResult = validateYouTubeUrl(url);
      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }
      
      // Extract video ID
      const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      debug('Extracted video ID:', videoId);
      
      let videoResult = null;
      
      // Try to get from cache first
      if (videoId) {
        debug('Checking cache for video ID:', videoId);
        const cachedResult = getCachedResult(videoId);
        if (cachedResult) {
          debug('Using cached result for video:', videoId);
          videoResult = cachedResult;
        }
      }
      
      // Process video if not in cache
      if (!videoResult) {
        debug('Processing video from URL:', url);
        videoResult = await measureAsyncExecutionTime(
          processYouTubeVideo,
          'processYouTubeVideo',
          url
        );
        
        // Cache the result
        if (videoResult && videoResult.videoId) {
          debug('Caching result for video ID:', videoResult.videoId);
          cacheResult(videoResult.videoId, videoResult);
        }
      }
      
      // Fix any issues with the result
      videoResult = fixVideoResult(videoResult);
      
      // Update state with the result
      setResult(videoResult);
      
      // Add to recent videos
      addRecentVideo({
        id: videoResult.videoId,
        title: videoResult.metadata.title,
        url: url,
        timestamp: new Date().toISOString()
      });
      
      // Set active tab to summary
      setActiveTab('summary');
    } catch (err) {
      error('Error processing video:', err);
      setError({
        message: getUserFriendlyErrorMessage(err),
        details: err.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Note: Recent videos are now handled by the context

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleSummaryTypeChange = (type) => {
    setSummaryType(type);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>YouTube Video Summarizer</h1>
        <p>Extract transcripts, summaries, and key points from YouTube videos</p>
      </header>

      <main className="app-main">
        <SearchBar 
          url={url} 
          onUrlChange={handleUrlChange} 
          onSubmit={handleSubmit} 
        />

        {loading && <LoadingState />}
        
        {error && <ErrorDisplay message={error} onClose={clearError} />}
        
        {result && (
          <div className="results-container">
            <ShareButton videoId={result.videoId} />
            <ExportOptions />
            <VideoInfo metadata={result.metadata} videoId={result.videoId} />
            
            <div className="tabs">
              <button 
                className={activeTab === 'summary' ? 'active' : ''} 
                onClick={() => handleTabChange('summary')}
              >
                Summary
              </button>
              <button 
                className={activeTab === 'transcript' ? 'active' : ''} 
                onClick={() => handleTabChange('transcript')}
              >
                Transcript
              </button>
              <button 
                className={activeTab === 'keypoints' ? 'active' : ''} 
                onClick={() => handleTabChange('keypoints')}
              >
                Key Points
              </button>
              <button 
                className={activeTab === 'topics' ? 'active' : ''} 
                onClick={() => handleTabChange('topics')}
              >
                Topics
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'summary' && (
                <SummarySection 
                  summaries={result.summaries} 
                  currentType={summaryType}
                  onTypeChange={handleSummaryTypeChange}
                />
              )}
              
              {activeTab === 'transcript' && (
                <TranscriptViewer transcript={result.transcript.full} />
              )}
              
              {activeTab === 'keypoints' && (
                <KeyPointsList keyPoints={result.keyPoints} />
              )}
              
              {activeTab === 'topics' && (
                <TopicsList topics={result.topics} />
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>YouTube Video Summarizer - Powered by NLP Technology</p>
      </footer>
    </div>
  );
}

export default App;
