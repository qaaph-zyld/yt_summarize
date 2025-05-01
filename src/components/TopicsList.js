import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Component to display topics identified in the transcript
 */
const TopicsList = ({ topics }) => {
  const [expandedTopics, setExpandedTopics] = useState({});
  
  // If no topics are available
  if (!topics || topics.length === 0) {
    return (
      <div className="topics-empty">
        <p>No distinct topics were identified for this video.</p>
      </div>
    );
  }

  const toggleTopic = (index) => {
    setExpandedTopics(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="topics-container">
      <div className="topics-header">
        <h3>Topics Identified ({topics.length})</h3>
      </div>
      
      <div className="topics-list">
        {topics.map((topic, index) => (
          <div key={index} className="topic-item">
            <div 
              className="topic-header" 
              onClick={() => toggleTopic(index)}
            >
              <span className="topic-name">{topic.name}</span>
              <span className="topic-toggle">
                {expandedTopics[index] ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </span>
            </div>
            
            {expandedTopics[index] && (
              <div className="topic-content">
                <p>Segments: {topic.segments.join(', ')}</p>
                <p className="topic-description">
                  This topic appears in {topic.segments.length} segments of the video.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicsList;
