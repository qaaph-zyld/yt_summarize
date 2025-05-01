import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * Component to display error messages with the ability to dismiss them
 * @param {Object} props - Component props
 * @param {string} props.message - Error message to display
 * @param {string} props.type - Error type (error, warning, info)
 * @param {Function} props.onClose - Function to call when closing the error
 */
const ErrorDisplay = ({ message, type = 'error', onClose }) => {
  // Determine the appropriate styling based on error type
  let className = 'error-display';
  let icon = <AlertTriangle size={18} />;
  
  if (type === 'warning') {
    className = 'warning-display';
  } else if (type === 'info') {
    className = 'info-display';
  }
  
  return (
    <div className={className}>
      <div className="error-content">
        <span className="error-icon">{icon}</span>
        <p><strong>{type === 'error' ? 'Error:' : type === 'warning' ? 'Warning:' : 'Info:'}</strong> {message}</p>
      </div>
      
      {onClose && (
        <button 
          className="error-close" 
          onClick={onClose}
          aria-label="Close error message"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
