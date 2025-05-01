import React from 'react';
import { FileText, List, Award, Copy, Download } from 'lucide-react';

/**
 * Component to display different types of summaries
 * @param {Object} props - Component props
 * @param {Object} props.summaries - Object containing different summary types
 * @param {string} props.currentType - Currently selected summary type
 * @param {Function} props.onTypeChange - Function to call when changing summary type
 */
const SummarySection = ({ summaries, currentType = 'detailed', onTypeChange }) => {
  // Handle copy to clipboard
  const handleCopy = () => {
    if (summaries && summaries[currentType]) {
      navigator.clipboard.writeText(summaries[currentType])
        .then(() => {
          // Show success message (could be enhanced with a toast notification)
          alert('Summary copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy text:', err);
          alert('Failed to copy to clipboard');
        });
    }
  };
  
  // Handle download as text file
  const handleDownload = () => {
    if (summaries && summaries[currentType]) {
      const element = document.createElement('a');
      const file = new Blob([summaries[currentType]], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `summary-${currentType}-${new Date().toISOString().slice(0,10)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };
  
  return (
    <div className="summary-section">
      <div className="summary-controls">
        <div className="summary-types">
          <button 
            className={currentType === 'brief' ? 'active' : ''} 
            onClick={() => onTypeChange('brief')}
            aria-pressed={currentType === 'brief'}
          >
            <FileText size={16} />
            <span>Brief</span>
          </button>
          
          <button 
            className={currentType === 'detailed' ? 'active' : ''} 
            onClick={() => onTypeChange('detailed')}
            aria-pressed={currentType === 'detailed'}
          >
            <List size={16} />
            <span>Detailed</span>
          </button>
          
          <button 
            className={currentType === 'executive' ? 'active' : ''} 
            onClick={() => onTypeChange('executive')}
            aria-pressed={currentType === 'executive'}
          >
            <Award size={16} />
            <span>Executive</span>
          </button>
        </div>
        
        <div className="summary-actions">
          <button 
            className="action-button"
            onClick={handleCopy}
            aria-label="Copy to clipboard"
            title="Copy to clipboard"
          >
            <Copy size={16} />
          </button>
          
          <button 
            className="action-button"
            onClick={handleDownload}
            aria-label="Download as text file"
            title="Download as text file"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      
      <div className="summary-content">
        {summaries && summaries[currentType] ? (
          <p>{summaries[currentType]}</p>
        ) : (
          <p>No summary available for this format.</p>
        )}
      </div>
    </div>
  );
};

export default SummarySection;
