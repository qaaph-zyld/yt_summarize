import React from 'react';
import { Star } from 'lucide-react';

/**
 * Component to display key points extracted from the transcript
 */
const KeyPointsList = ({ keyPoints }) => {
  // If no key points are available
  if (!keyPoints || keyPoints.length === 0) {
    return (
      <div className="key-points-empty">
        <p>No key points were identified for this video.</p>
      </div>
    );
  }

  return (
    <div className="key-points-container">
      <div className="key-points-header">
        <h3>Key Points ({keyPoints.length})</h3>
        <button 
          className="copy-button"
          onClick={() => {
            const text = keyPoints.join('\n\n');
            navigator.clipboard.writeText(text);
            alert('Key points copied to clipboard!');
          }}
        >
          Copy All Points
        </button>
      </div>
      
      <ul className="key-points-list">
        {keyPoints.map((point, index) => (
          <li key={index}>
            <span className="key-point-icon">
              <Star size={18} />
            </span>
            <span className="key-point-text">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KeyPointsList;
