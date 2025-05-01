import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

/**
 * VideoPreview component for enhanced thumbnail experience
 * Supports hover preview, click-to-play, and thumbnail quality options
 * 
 * @param {Object} props - Component props
 * @param {string} props.videoId - YouTube video ID
 * @param {string} props.title - Video title for accessibility
 * @param {string} props.quality - Thumbnail quality (default, medium, high, maxres)
 * @param {boolean} props.enablePreview - Whether to enable video preview on hover
 */
const VideoPreview = ({ 
  videoId, 
  title = 'YouTube Video', 
  quality = 'medium',
  enablePreview = true
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const previewTimer = useRef(null);
  const iframeRef = useRef(null);
  
  // Quality mapping for thumbnail URLs
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    standard: 'sddefault',
    maxres: 'maxresdefault'
  };
  
  const thumbnailQuality = qualityMap[quality] || 'mqdefault';
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${thumbnailQuality}.jpg`;
  
  // Fallback thumbnail in case the requested quality is not available
  const handleThumbnailError = () => {
    setThumbnailError(true);
    // Try a lower quality if the requested one fails
    if (quality === 'maxres') {
      setThumbnailError(false); // Reset error to try again
    }
  };
  
  // Handle mouse enter to start preview timer
  const handleMouseEnter = () => {
    if (!enablePreview || isPlaying) return;
    
    setIsHovering(true);
    // Start a timer to load the preview after a short delay
    previewTimer.current = setTimeout(() => {
      // Only load the iframe if we're still hovering
      if (isHovering && !isPlaying) {
        loadYouTubePreview();
      }
    }, 1000); // 1 second delay before loading preview
  };
  
  // Handle mouse leave to cancel preview
  const handleMouseLeave = () => {
    setIsHovering(false);
    if (previewTimer.current) {
      clearTimeout(previewTimer.current);
    }
    
    // If not actively playing, remove the iframe to save resources
    if (!isPlaying && iframeRef.current) {
      iframeRef.current.src = '';
    }
  };
  
  // Load the YouTube preview iframe
  const loadYouTubePreview = () => {
    if (!iframeRef.current) return;
    
    // Set the iframe source to load the YouTube player
    const startTime = 0; // Could be customized to start at a specific point
    iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&start=${startTime}&enablejsapi=1`;
  };
  
  // Toggle play/pause state
  const togglePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      // If starting to play, ensure the iframe is loaded
      loadYouTubePreview();
    } else {
      // If pausing, we could pause the video using YouTube API
      // For simplicity, we'll just remove the iframe source
      if (iframeRef.current) {
        iframeRef.current.src = '';
      }
    }
  };
  
  // Toggle mute state
  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsMuted(!isMuted);
    
    // Use YouTube API to mute/unmute if iframe is loaded
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const message = isMuted 
          ? JSON.stringify({ event: 'command', func: 'unMute' })
          : JSON.stringify({ event: 'command', func: 'mute' });
        
        iframeRef.current.contentWindow.postMessage(message, '*');
      }
    } catch (error) {
      console.error('Error toggling mute state:', error);
    }
  };
  
  // Open the video in a new tab
  const openVideo = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (previewTimer.current) {
        clearTimeout(previewTimer.current);
      }
    };
  }, []);
  
  return (
    <div 
      className={`video-preview ${isHovering ? 'hovering' : ''} ${isPlaying ? 'playing' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail Image */}
      {(!isHovering || !enablePreview) && !isPlaying && (
        <div className="thumbnail-container">
          <img 
            src={thumbnailError ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : thumbnailUrl}
            alt={title}
            className="video-thumbnail"
            onLoad={() => setThumbnailLoaded(true)}
            onError={handleThumbnailError}
          />
          
          {thumbnailLoaded && (
            <div className="thumbnail-overlay">
              <button 
                className="play-button"
                onClick={togglePlay}
                aria-label="Play video"
              >
                <Play size={24} />
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* YouTube Iframe (for preview and playing) */}
      {(isHovering || isPlaying) && enablePreview && (
        <div className="iframe-container">
          <iframe
            ref={iframeRef}
            title={`YouTube video player for ${title}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="youtube-iframe"
          ></iframe>
          
          <div className="video-controls">
            <button 
              className="control-button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button 
              className="control-button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isHovering && !thumbnailLoaded && !isPlaying && (
        <div className="thumbnail-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default VideoPreview;
