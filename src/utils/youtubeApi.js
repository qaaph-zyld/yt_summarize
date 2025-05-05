/**
 * YouTube API Integration
 * 
 * This file contains functions for interacting with the YouTube Data API
 * and YouTube Transcript API to fetch video metadata and transcripts.
 */

import axios from 'axios';

// Function to fetch video details from YouTube API
export const fetchVideoDetails = async (videoId, apiKey) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
        key: apiKey
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const videoData = response.data.items[0];
    const snippet = videoData.snippet;
    const contentDetails = videoData.contentDetails;
    
    // Convert ISO 8601 duration to readable format
    const duration = convertDuration(contentDetails.duration);
    
    return {
      videoId,
      title: snippet.title,
      channel: snippet.channelTitle,
      description: snippet.description,
      publishedDate: snippet.publishedAt.split('T')[0],
      duration,
      thumbnail: snippet.thumbnails.high.url
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw new Error(`Failed to fetch video details: ${error.message}`);
  }
};

// Function to fetch video transcript using YouTube Transcript API
export const fetchTranscript = async (videoId) => {
  try {
    // This would typically use a server-side API or a library like youtube-transcript
    // For now, we'll use a mock implementation that returns a basic structure
    
    // In a real implementation, you would use:
    // const transcript = await getTranscript(videoId);
    
    // Mock implementation for testing
    const response = await axios.get(`https://yt-transcript-api.example.com/transcript/${videoId}`);
    return response.data.transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw new Error(`Failed to fetch transcript: ${error.message}`);
  }
};

// Helper function to convert ISO 8601 duration to readable format
function convertDuration(isoDuration) {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
  const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
  const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;
  
  let result = '';
  if (hours > 0) {
    result += `${hours}:`;
  }
  
  result += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return result;
}

// Function to process video data and generate summaries
export const processVideoData = async (videoId, apiKey) => {
  try {
    // Fetch video details
    const videoDetails = await fetchVideoDetails(videoId, apiKey);
    
    // Fetch transcript
    let transcript = [];
    try {
      transcript = await fetchTranscript(videoId);
    } catch (transcriptError) {
      console.warn('Could not fetch transcript, proceeding without it:', transcriptError);
      // Continue without transcript
    }
    
    // Extract key points from description
    const keyPoints = extractKeyPoints(videoDetails.description);
    
    // Generate summaries based on description and transcript
    const summaries = generateSummaries(videoDetails.description, transcript);
    
    // Identify topics from transcript
    const topics = identifyTopics(transcript);
    
    return {
      ...videoDetails,
      summaries,
      keyPoints,
      topics,
      transcript
    };
  } catch (error) {
    console.error('Error processing video data:', error);
    throw error;
  }
};

// Helper function to extract key points from description
function extractKeyPoints(description) {
  // Simple implementation: look for bullet points, numbered lists, or paragraphs
  const lines = description.split('\n');
  const keyPoints = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    // Check for bullet points or numbered lists
    if (trimmedLine.match(/^[\-\*•]|\d+\./) && trimmedLine.length > 5) {
      keyPoints.push(trimmedLine.replace(/^[\-\*•]|\d+\./, '').trim());
    }
  }
  
  // If no bullet points found, extract sentences that might be key points
  if (keyPoints.length === 0) {
    const sentences = description.match(/[^.!?]+[.!?]+/g) || [];
    for (let i = 0; i < Math.min(5, sentences.length); i++) {
      const sentence = sentences[i].trim();
      if (sentence.length > 10 && sentence.length < 150) {
        keyPoints.push(sentence);
      }
    }
  }
  
  // Limit to 5 key points
  return keyPoints.slice(0, 5);
}

// Helper function to generate summaries
function generateSummaries(description, transcript) {
  // In a real implementation, this would use NLP techniques
  // For now, we'll use a simple approach based on the description
  
  // Brief summary: first sentence or two
  const briefMatch = description.match(/^[^.!?]+[.!?]+(\s+[^.!?]+[.!?]+)?/);
  const brief = briefMatch ? briefMatch[0].trim() : 'No description available.';
  
  // Detailed summary: first few paragraphs
  const paragraphs = description.split('\n\n');
  const detailed = paragraphs.slice(0, 3).join('\n\n').trim() || 'No detailed description available.';
  
  // Executive summary: extract key sentences
  const sentences = description.match(/[^.!?]+[.!?]+/g) || [];
  const executiveSentences = sentences
    .filter(s => s.trim().length > 15 && s.trim().length < 100)
    .slice(0, 5);
  const executive = `Key takeaways: ${executiveSentences.map((s, i) => `${i+1}) ${s.trim()}`).join(' ')}`;
  
  // Very detailed summary: combine description and transcript insights
  const veryDetailed = detailed + '\n\n' + 
    (transcript.length > 0 
      ? 'The video also covers: ' + transcript.slice(0, 10).map(t => t.text).join(' ') 
      : '');
  
  return {
    brief,
    detailed,
    executive,
    veryDetailed
  };
}

// Helper function to identify topics from transcript
function identifyTopics(transcript) {
  // In a real implementation, this would use NLP techniques
  // For now, we'll create topics based on transcript timestamps
  
  if (!transcript || transcript.length === 0) {
    return [
      { name: 'Introduction', timestamp: '0:00' }
    ];
  }
  
  const topics = [];
  
  // Always add introduction
  topics.push({ name: 'Introduction', timestamp: '0:00' });
  
  // Add topics at regular intervals
  const segmentCount = transcript.length;
  if (segmentCount > 5) {
    const quarter = Math.floor(segmentCount / 4);
    const half = Math.floor(segmentCount / 2);
    const threeQuarters = Math.floor(segmentCount * 3 / 4);
    
    topics.push({ name: 'Main Content', timestamp: transcript[quarter].timestamp });
    topics.push({ name: 'Key Discussion', timestamp: transcript[half].timestamp });
    topics.push({ name: 'Final Points', timestamp: transcript[threeQuarters].timestamp });
  }
  
  return topics;
}
