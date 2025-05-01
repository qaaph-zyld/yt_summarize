/**
 * ShareButton Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ShareButton from '../../components/ShareButton';
import { AppProvider } from '../../context/AppContext';
import { 
  generateShareableUrl, 
  shareViaWebShare, 
  copyToClipboard, 
  generateSummaryText,
  shareToSocialMedia
} from '../../utils/shareUtils';

// Mock the context
jest.mock('../../context/AppContext', () => {
  const originalModule = jest.requireActual('../../context/AppContext');
  
  return {
    ...originalModule,
    useAppContext: jest.fn(() => ({
      state: {
        activeTab: 'summary',
        summaryType: 'detailed',
        result: {
          videoId: 'FQlCWrsUpHo',
          metadata: {
            title: 'Test Video Title'
          },
          summaries: {
            detailed: 'This is a detailed summary.'
          }
        }
      }
    }))
  };
});

// Mock the shareUtils
jest.mock('../../utils/shareUtils', () => ({
  generateShareableUrl: jest.fn(() => 'https://example.com/share'),
  shareViaWebShare: jest.fn().mockResolvedValue(false),
  copyToClipboard: jest.fn().mockResolvedValue(true),
  generateSummaryText: jest.fn(() => 'Test summary text'),
  generateFullAnalysisText: jest.fn(),
  downloadAsFile: jest.fn(),
  shareToSocialMedia: jest.fn()
}));

describe('ShareButton Component', () => {
  const videoId = 'FQlCWrsUpHo';
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock window.alert
    window.alert = jest.fn();
  });
  
  test('renders share button', () => {
    render(
      <AppProvider>
        <ShareButton videoId={videoId} />
      </AppProvider>
    );
    
    const shareButton = screen.getByRole('button', { name: /Share/i });
    expect(shareButton).toBeInTheDocument();
  });
  
  test('does not show share menu initially', () => {
    render(
      <AppProvider>
        <ShareButton videoId={videoId} />
      </AppProvider>
    );
    
    expect(screen.queryByText(/Copy Link/i)).not.toBeInTheDocument();
  });
  
  test('shows share menu when button is clicked', () => {
    render(
      <AppProvider>
        <ShareButton videoId={videoId} />
      </AppProvider>
    );
    
    const shareButton = screen.getByRole('button', { name: /Share/i });
    fireEvent.click(shareButton);
    
    expect(screen.getByText(/Copy Link/i)).toBeInTheDocument();
    expect(screen.getByText(/Copy Summary/i)).toBeInTheDocument();
  });
  
  test('tries Web Share API first when share button is clicked', () => {
    render(
      <AppProvider>
        <ShareButton videoId={videoId} />
      </AppProvider>
    );
    
    const shareButton = screen.getByRole('button', { name: /Share/i });
    fireEvent.click(shareButton);
    
    expect(shareViaWebShare).toHaveBeenCalled();
    expect(generateShareableUrl).toHaveBeenCalledWith(videoId, 'summary', 'detailed');
    expect(generateSummaryText).toHaveBeenCalled();
  });
  
  test('copies link to clipboard when Copy Link is clicked', async () => {
    render(
      <AppProvider>
        <ShareButton videoId={videoId} />
      </AppProvider>
    );
    
    // Open share menu
    const shareButton = screen.getByRole('button', { name: /Share/i });
    fireEvent.click(shareButton);
    
    // Click Copy Link button
    const copyLinkButton = screen.getByText(/Copy Link/i);
    fireEvent.click(copyLinkButton);
    
    expect(generateShareableUrl).toHaveBeenCalledWith(videoId, 'summary', 'detailed');
    expect(copyToClipboard).toHaveBeenCalledWith('https://example.com/share');
    expect(window.alert).toHaveBeenCalledWith('Link copied to clipboard!');
  });
  
  test('copies summary to clipboard when Copy Summary is clicked', async () => {
    render(
      <AppProvider>
        <ShareButton videoId={videoId} />
      </AppProvider>
    );
    
    // Open share menu
    const shareButton = screen.getByRole('button', { name: /Share/i });
    fireEvent.click(shareButton);
    
    // Click Copy Summary button
    const copySummaryButton = screen.getByText(/Copy Summary/i);
    fireEvent.click(copySummaryButton);
    
    expect(generateSummaryText).toHaveBeenCalled();
    expect(copyToClipboard).toHaveBeenCalledWith('Test summary text');
    expect(window.alert).toHaveBeenCalledWith('Summary copied to clipboard!');
  });
  
  test('shares to social media when a social option is clicked', () => {
    render(
      <AppProvider>
        <ShareButton videoId={videoId} />
      </AppProvider>
    );
    
    // Open share menu
    const shareButton = screen.getByRole('button', { name: /Share/i });
    fireEvent.click(shareButton);
    
    // Click Twitter share button
    const twitterButton = screen.getByText(/Twitter/i);
    fireEvent.click(twitterButton);
    
    expect(shareToSocialMedia).toHaveBeenCalledWith('twitter', expect.any(Object));
    expect(generateShareableUrl).toHaveBeenCalledWith(videoId, 'summary', 'detailed');
  });
  
  test('closes share menu when close button is clicked', () => {
    render(
      <AppProvider>
        <ShareButton videoId={videoId} />
      </AppProvider>
    );
    
    // Open share menu
    const shareButton = screen.getByRole('button', { name: /Share/i });
    fireEvent.click(shareButton);
    
    // Click close button
    const closeButton = screen.getByLabelText(/Close share menu/i);
    fireEvent.click(closeButton);
    
    expect(screen.queryByText(/Copy Link/i)).not.toBeInTheDocument();
  });
});
