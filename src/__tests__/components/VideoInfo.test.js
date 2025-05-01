/**
 * VideoInfo Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import VideoInfo from '../../components/VideoInfo';

// Mock the VideoPreview component
jest.mock('../../components/VideoPreview', () => {
  return function MockVideoPreview({ videoId, title }) {
    return (
      <div data-testid="video-preview" data-videoid={videoId} data-title={title}>
        Video Preview
      </div>
    );
  };
});

describe('VideoInfo Component', () => {
  // Test data
  const mockMetadata = {
    title: 'Test Video Title',
    channel: 'Test Channel',
    publishedDate: '2023-01-01',
    category: 'Education',
    views: '1000',
    likes: '100'
  };
  
  const mockVideoId = 'FQlCWrsUpHo';
  
  test('renders video preview and title', () => {
    render(<VideoInfo metadata={mockMetadata} videoId={mockVideoId} />);
    
    const videoPreview = screen.getByTestId('video-preview');
    const title = screen.getByText(mockMetadata.title);
    
    expect(videoPreview).toBeInTheDocument();
    expect(videoPreview).toHaveAttribute('data-videoid', mockVideoId);
    expect(videoPreview).toHaveAttribute('data-title', mockMetadata.title);
    expect(title).toBeInTheDocument();
  });
  
  test('renders channel name', () => {
    render(<VideoInfo metadata={mockMetadata} videoId={mockVideoId} />);
    
    const channel = screen.getByText(mockMetadata.channel);
    expect(channel).toBeInTheDocument();
  });
  
  test('renders published date', () => {
    render(<VideoInfo metadata={mockMetadata} videoId={mockVideoId} />);
    
    const publishedDate = screen.getByText(mockMetadata.publishedDate);
    expect(publishedDate).toBeInTheDocument();
  });
  
  test('renders category when available', () => {
    render(<VideoInfo metadata={mockMetadata} videoId={mockVideoId} />);
    
    const category = screen.getByText(mockMetadata.category);
    expect(category).toBeInTheDocument();
  });
  
  test('renders views when available', () => {
    render(<VideoInfo metadata={mockMetadata} videoId={mockVideoId} />);
    
    const views = screen.getByText(/1000 views/i);
    expect(views).toBeInTheDocument();
  });
  
  test('renders likes when available', () => {
    render(<VideoInfo metadata={mockMetadata} videoId={mockVideoId} />);
    
    const likes = screen.getByText(/100 likes/i);
    expect(likes).toBeInTheDocument();
  });
  
  test('does not render optional metadata when not available', () => {
    const minimalMetadata = {
      title: 'Test Video Title',
      channel: 'Test Channel',
      publishedDate: '2023-01-01'
    };
    
    render(<VideoInfo metadata={minimalMetadata} videoId={mockVideoId} />);
    
    expect(screen.queryByText(/views/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/likes/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('category-item')).not.toBeInTheDocument();
  });
  
  test('renders all metadata items with correct icons', () => {
    render(<VideoInfo metadata={mockMetadata} videoId={mockVideoId} />);
    
    const metadataItems = screen.getAllByTestId('metadata-item');
    expect(metadataItems.length).toBeGreaterThanOrEqual(3); // At least channel, date, and category
  });
});
