import React, { useState } from 'react';
import { Share2, Copy, Download, Twitter, Facebook, Linkedin, Mail, X } from 'lucide-react';
import { 
  generateShareableUrl, 
  shareViaWebShare, 
  copyToClipboard, 
  generateSummaryText,
  generateFullAnalysisText,
  downloadAsFile,
  shareToSocialMedia
} from '../utils/shareUtils';
import { useAppContext } from '../context/AppContext';

/**
 * ShareButton component for sharing video analysis results
 */
const ShareButton = ({ videoId }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { state } = useAppContext();
  const { activeTab, summaryType, result } = state;

  const handleShare = async () => {
    // Try Web Share API first
    if (navigator.share) {
      const shareData = {
        title: result?.metadata?.title || 'YouTube Video Summary',
        text: generateSummaryText(result, summaryType),
        url: generateShareableUrl(videoId, activeTab, summaryType)
      };
      
      const shared = await shareViaWebShare(shareData);
      if (shared) return; // If successful, don't show the menu
    }
    
    // If Web Share API is not available or failed, show our custom menu
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = async () => {
    const url = generateShareableUrl(videoId, activeTab, summaryType);
    const success = await copyToClipboard(url);
    
    if (success) {
      alert('Link copied to clipboard!');
    } else {
      alert('Failed to copy link. Please try again.');
    }
    
    setShowShareMenu(false);
  };

  const handleCopySummary = async () => {
    if (!result) return;
    
    const summaryText = generateSummaryText(result, summaryType);
    const success = await copyToClipboard(summaryText);
    
    if (success) {
      alert('Summary copied to clipboard!');
    } else {
      alert('Failed to copy summary. Please try again.');
    }
    
    setShowShareMenu(false);
  };

  const handleDownload = (format) => {
    if (!result) return;
    
    const title = result.metadata.title || 'YouTube-Summary';
    const filename = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const content = generateFullAnalysisText(result);
    
    downloadAsFile(content, filename, format);
    setShowShareMenu(false);
  };

  const handleSocialShare = (platform) => {
    if (!result) return;
    
    const shareData = {
      title: result.metadata.title || 'YouTube Video Summary',
      text: generateSummaryText(result, summaryType),
      url: generateShareableUrl(videoId, activeTab, summaryType)
    };
    
    shareToSocialMedia(platform, shareData);
    setShowShareMenu(false);
  };

  return (
    <div className="share-button-container">
      <button 
        className="share-button" 
        onClick={handleShare}
        aria-label="Share"
        aria-expanded={showShareMenu}
        title="Share"
      >
        <Share2 size={18} />
        <span>Share</span>
      </button>
      
      {showShareMenu && (
        <div className="share-menu">
          <div className="share-menu-header">
            <h3>Share</h3>
            <button 
              className="close-button" 
              onClick={() => setShowShareMenu(false)}
              aria-label="Close share menu"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="share-menu-options">
            <button onClick={handleCopyLink}>
              <Copy size={16} />
              <span>Copy Link</span>
            </button>
            
            <button onClick={handleCopySummary}>
              <Copy size={16} />
              <span>Copy Summary</span>
            </button>
            
            <div className="share-menu-section">
              <h4>Download</h4>
              <div className="download-options">
                <button onClick={() => handleDownload('txt')}>Text (.txt)</button>
                <button onClick={() => handleDownload('md')}>Markdown (.md)</button>
                <button onClick={() => handleDownload('html')}>HTML (.html)</button>
              </div>
            </div>
            
            <div className="share-menu-section">
              <h4>Share to</h4>
              <div className="social-options">
                <button onClick={() => handleSocialShare('twitter')}>
                  <Twitter size={16} />
                  <span>Twitter</span>
                </button>
                
                <button onClick={() => handleSocialShare('facebook')}>
                  <Facebook size={16} />
                  <span>Facebook</span>
                </button>
                
                <button onClick={() => handleSocialShare('linkedin')}>
                  <Linkedin size={16} />
                  <span>LinkedIn</span>
                </button>
                
                <button onClick={() => handleSocialShare('email')}>
                  <Mail size={16} />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
