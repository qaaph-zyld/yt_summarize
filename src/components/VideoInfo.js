import React from 'react';
import { Calendar, User, Tag, Eye, ThumbsUp } from 'lucide-react';
import VideoPreview from './VideoPreview';

/**
 * Component to display video metadata and thumbnail
 */
const VideoInfo = ({ metadata, videoId }) => {
  return (
    <div className="video-info">
      <VideoPreview 
        videoId={videoId} 
        title={metadata.title} 
        quality="maxres" 
        enablePreview={true} 
      />
      
      <div className="video-details">
        <h2>{metadata.title}</h2>
        <div className="video-metadata">
          <div className="video-metadata-item">
            <User size={16} />
            <span>{metadata.channel}</span>
          </div>
          
          <div className="video-metadata-item">
            <Calendar size={16} />
            <span>{metadata.publishedDate}</span>
          </div>
          
          {metadata.category && (
            <div className="video-metadata-item">
              <Tag size={16} />
              <span>{metadata.category}</span>
            </div>
          )}
          
          {metadata.views && (
            <div className="video-metadata-item">
              <Eye size={16} />
              <span>{metadata.views} views</span>
            </div>
          )}
          
          {metadata.likes && (
            <div className="video-metadata-item">
              <ThumbsUp size={16} />
              <span>{metadata.likes} likes</span>
            </div>
          )}
        </div>
        
        {metadata.description && (
          <p className="video-description">{metadata.description}</p>
        )}
        
        <div className="video-link">
          <a 
            href={`https://www.youtube.com/watch?v=${videoId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="watch-link"
          >
            Watch on YouTube
          </a>
        </div>
      </div>
    </div>
  );
};

export default VideoInfo;
