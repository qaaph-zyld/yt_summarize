import React from 'react';

/**
 * Component to display loading state while processing a video
 */
const LoadingState = () => {
  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Processing video... This may take a moment.</p>
    </div>
  );
};

export default LoadingState;
