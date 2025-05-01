import React, { useState } from 'react';

/**
 * Feedback form component for collecting user feedback
 */
const FeedbackForm = ({ onSubmit, onClose }) => {
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: '',
    email: '',
    features: [],
    improvements: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFeedback(prev => {
      const features = [...prev.features];
      if (features.includes(feature)) {
        return {
          ...prev,
          features: features.filter(f => f !== feature)
        };
      } else {
        return {
          ...prev,
          features: [...features, feature]
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(feedback);
    setSubmitted(true);
    
    // Store feedback in localStorage
    const storedFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
    storedFeedback.push({
      ...feedback,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('userFeedback', JSON.stringify(storedFeedback));
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFeedback({
        rating: 5,
        comment: '',
        email: '',
        features: [],
        improvements: ''
      });
      onClose();
    }, 3000);
  };

  return (
    <div className="feedback-form-container">
      <div className="feedback-form">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Share Your Feedback</h2>
        
        {submitted ? (
          <div className="success-message">
            <p>Thank you for your feedback!</p>
            <p>Your input helps us improve the YouTube Video Summarizer.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>How would you rate your experience?</label>
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map(num => (
                  <label key={num} className="rating-label">
                    <input
                      type="radio"
                      name="rating"
                      value={num}
                      checked={feedback.rating === num}
                      onChange={() => setFeedback({...feedback, rating: num})}
                    />
                    <span>{num}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="comment">Comments (optional)</label>
              <textarea
                id="comment"
                name="comment"
                rows="4"
                value={feedback.comment}
                onChange={handleChange}
                placeholder="Tell us about your experience..."
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Which features did you find most useful?</label>
              <div className="checkbox-group">
                {['Video summaries', 'Transcript viewer', 'Key points extraction', 'Topic identification', 'Export options', 'Share functionality'].map(feature => (
                  <label key={feature} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={feedback.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                    />
                    {feature}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="improvements">What improvements would you like to see?</label>
              <textarea
                id="improvements"
                name="improvements"
                rows="3"
                value={feedback.improvements}
                onChange={handleChange}
                placeholder="Suggest features or improvements..."
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email (optional, for updates)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={feedback.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>
            
            <button type="submit" className="submit-button">Submit Feedback</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
