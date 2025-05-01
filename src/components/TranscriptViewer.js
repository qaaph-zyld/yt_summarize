import React from 'react';
import { Clock } from 'lucide-react';

/**
 * Component to display the full transcript with timestamps
 */
const TranscriptViewer = ({ transcript }) => {
  // If transcript is empty or not provided
  if (!transcript) {
    return (
      <div className="transcript-viewer">
        <div className="transcript-empty">
          <Clock size={24} />
          <p>No transcript available for this video.</p>
        </div>
      </div>
    );
  }

  // Format the transcript with highlighted timestamps
  const formattedTranscript = transcript.split('\n\n').map((segment, index) => {
    // Extract timestamp and text
    const timestampMatch = segment.match(/\[([\d:]+)\]/);
    
    if (timestampMatch) {
      const timestamp = timestampMatch[0];
      const text = segment.replace(timestamp, '').trim();
      
      return (
        <p key={index} className="transcript-segment">
          <span className="transcript-timestamp">{timestamp}</span>
          <span className="transcript-text">{text}</span>
        </p>
      );
    }
    
    // If no timestamp found, just return the segment
    return <p key={index} className="transcript-segment">{segment}</p>;
  });

  return (
    <div className="transcript-viewer">
      <div className="transcript-controls">
        <button 
          className="copy-button"
          onClick={() => {
            navigator.clipboard.writeText(transcript);
            alert('Transcript copied to clipboard!');
          }}
        >
          Copy Full Transcript
        </button>
      </div>
      
      <div className="transcript-content">
        {formattedTranscript}
      </div>
    </div>
  );
};

export default TranscriptViewer;
