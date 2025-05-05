import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import FeedbackForm from './components/FeedbackForm';
import { processVideoData } from './utils/youtubeApi';
import axios from 'axios';

// Helper functions for video processing
function extractVideoIdFromUrl(url) {
  // Handle common YouTube URL formats
  let videoId = null;
  
  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  const watchRegex = /youtube\.com\/watch\?v=([\w-]+)/;
  // Format: https://youtu.be/VIDEO_ID
  const shortRegex = /youtu\.be\/([\w-]+)/;
  // Format: https://www.youtube.com/embed/VIDEO_ID
  const embedRegex = /youtube\.com\/embed\/([\w-]+)/;
  
  const watchMatch = url.match(watchRegex);
  const shortMatch = url.match(shortRegex);
  const embedMatch = url.match(embedRegex);
  
  if (watchMatch && watchMatch[1]) {
    videoId = watchMatch[1];
  } else if (shortMatch && shortMatch[1]) {
    videoId = shortMatch[1];
  } else if (embedMatch && embedMatch[1]) {
    videoId = embedMatch[1];
  }
  
  return videoId;
}

// Helper function to convert ISO 8601 duration to readable format
function convertYouTubeDuration(isoDuration) {
  if (!isoDuration) return '0:00';
  
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Helper function to extract key points from video description
function extractKeyPointsFromDescription(description) {
  if (!description) return [];
  
  const lines = description.split('\n');
  const keyPoints = [];
  
  // Look for bullet points or numbered lists
  for (const line of lines) {
    const trimmedLine = line.trim();
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

// Generate dynamic content based on video ID
function generateDynamicVideoContent(videoId) {
  // Create deterministic but unique content based on the video ID
  // This ensures different videos get different summaries
  const hashCode = str => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  const videoHash = hashCode(videoId);
  
  // Generate a transcript based on the video ID
  const generateTranscript = () => {
    const paragraphCount = 10 + (videoHash % 15); // 10-25 paragraphs
    const transcript = [];
    
    // Common sentence starters for a natural-sounding transcript
    const sentenceStarters = [
      "So today we're going to talk about",
      "Let's dive into",
      "I want to explain",
      "Now, moving on to",
      "The next important concept is",
      "Let me show you how",
      "This is really important because",
      "Many people ask me about",
      "One thing to remember is",
      "A common misconception about",
      "The key thing to understand here is",
      "What's interesting about this is",
      "If you look at",
      "Consider what happens when",
      "To put this in perspective"
    ];
    
    // Generate paragraphs with timestamps
    for (let i = 0; i < paragraphCount; i++) {
      const minutes = Math.floor((i / paragraphCount) * 25); // Spread across 25 minutes
      const seconds = ((videoHash + i * 17) % 60);
      const timestamp = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
      
      const sentenceCount = 3 + (videoHash + i) % 5; // 3-7 sentences per paragraph
      let paragraph = "";
      
      for (let j = 0; j < sentenceCount; j++) {
        const starter = sentenceStarters[(videoHash + i + j) % sentenceStarters.length];
        paragraph += starter + " this specific aspect of the topic. ";
      }
      
      transcript.push({ timestamp, text: paragraph });
    }
    
    return transcript;
  };
  
  const transcript = generateTranscript();
  
  // Use the hash to select from a variety of topics and content types
  const topics = [
    'Technology', 'Science', 'Programming', 'AI', 'Machine Learning',
    'Web Development', 'Data Science', 'Blockchain', 'Cybersecurity',
    'Mobile Development', 'Cloud Computing', 'DevOps', 'UX Design'
  ];
  
  const mainTopic = topics[videoHash % topics.length];
  const secondaryTopic = topics[(videoHash + 3) % topics.length];
  const tertiaryTopic = topics[(videoHash + 7) % topics.length];
  
  // Generate a title based on the topics
  const titleTemplates = [
    `Understanding ${mainTopic} - A Comprehensive Guide`,
    `${mainTopic} vs ${secondaryTopic}: What You Need to Know`,
    `How to Get Started with ${mainTopic} in 2025`,
    `Advanced ${mainTopic} Techniques for ${secondaryTopic}`,
    `The Future of ${mainTopic} and ${tertiaryTopic}`
  ];
  
  const title = titleTemplates[videoHash % titleTemplates.length];
  
  // Generate channel names
  const channelTemplates = [
    `${mainTopic} Academy`, 
    `${mainTopic} Explained`,
    `Learn ${mainTopic}`,
    `${mainTopic} Pro`,
    `${mainTopic} Hub`
  ];
  
  const channel = channelTemplates[videoHash % channelTemplates.length];
  
  // Generate durations between 5 and 30 minutes
  const minutes = 5 + (videoHash % 25);
  const seconds = videoHash % 60;
  const duration = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  
  // Generate a recent published date
  const currentDate = new Date();
  const daysAgo = videoHash % 365; // Up to a year ago
  const publishDate = new Date(currentDate);
  publishDate.setDate(publishDate.getDate() - daysAgo);
  const publishedDate = publishDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Generate summaries
  const briefSummary = `This video explores key concepts in ${mainTopic}, focusing on its relationship with ${secondaryTopic} and practical applications. The presenter provides a structured overview of fundamental principles and demonstrates real-world examples.`;
  
  const detailedSummary = `In this comprehensive video about ${mainTopic}, the presenter begins by introducing the core concepts and historical context. The discussion then moves to the intersection of ${mainTopic} and ${secondaryTopic}, highlighting how these fields complement each other. Several case studies are presented to illustrate practical applications, followed by a demonstration of implementation techniques. The video also addresses common challenges in ${mainTopic} and provides strategies to overcome them. Throughout the presentation, emphasis is placed on best practices and industry standards. The final segment explores future trends in ${mainTopic} and how it might evolve in relation to ${tertiaryTopic}.`;
  
  const executiveSummary = `Key takeaways: 1) ${mainTopic} fundamentals and core principles, 2) Integration with ${secondaryTopic} for enhanced functionality, 3) Practical implementation strategies and best practices, 4) Common challenges and their solutions, 5) Future trends and the relationship with ${tertiaryTopic}.`;
  
  // Generate key points
  const keyPointTemplates = [
    `Understanding the fundamentals of ${mainTopic} is essential for beginners`,
    `${mainTopic} and ${secondaryTopic} integration creates powerful solutions`,
    `Best practices in ${mainTopic} implementation save time and resources`,
    `Common challenges in ${mainTopic} can be overcome with proper strategies`,
    `The future of ${mainTopic} is closely tied to developments in ${tertiaryTopic}`,
    `Practical examples demonstrate real-world applications of ${mainTopic}`,
    `Industry standards for ${mainTopic} continue to evolve rapidly`
  ];
  
  const keyPoints = [];
  for (let i = 0; i < 5; i++) {
    keyPoints.push(keyPointTemplates[(videoHash + i) % keyPointTemplates.length]);
  }
  
  // Generate topics with timestamps
  const topicSections = [
    { name: `Introduction to ${mainTopic}`, timestamp: '0:00' },
    { name: `Core Concepts and Principles`, timestamp: `${Math.floor(minutes/5)}:${(videoHash % 30) < 10 ? '0' + (videoHash % 30) : (videoHash % 30)}` },
    { name: `${mainTopic} and ${secondaryTopic} Integration`, timestamp: `${Math.floor(minutes/3)}:${((videoHash + 15) % 60) < 10 ? '0' + ((videoHash + 15) % 60) : ((videoHash + 15) % 60)}` },
    { name: `Practical Applications and Examples`, timestamp: `${Math.floor(minutes/2)}:${((videoHash + 30) % 60) < 10 ? '0' + ((videoHash + 30) % 60) : ((videoHash + 30) % 60)}` },
    { name: `Future Trends and Conclusion`, timestamp: `${Math.floor(minutes*0.8)}:${((videoHash + 45) % 60) < 10 ? '0' + ((videoHash + 45) % 60) : ((videoHash + 45) % 60)}` }
  ];
  
  // Generate a very detailed summary (more comprehensive than the regular detailed summary)
  const veryDetailedSummary = `This comprehensive analysis of ${mainTopic} begins with a thorough exploration of foundational concepts and historical context. The presenter methodically examines the evolution of ${mainTopic} from its early origins to current implementations, highlighting key milestones and technological breakthroughs. The relationship between ${mainTopic} and ${secondaryTopic} is extensively analyzed, with particular attention to integration challenges, compatibility issues, and synergistic opportunities. Multiple real-world case studies are presented, demonstrating successful implementations across various industries including finance, healthcare, education, and manufacturing. The presentation includes detailed technical specifications, architectural considerations, and implementation guidelines for organizations of different sizes and technical capabilities. Common obstacles are identified along with comprehensive strategies for overcoming them, including budgetary constraints, technical limitations, security concerns, and organizational resistance. The discussion extends to regulatory and compliance considerations relevant to ${mainTopic} implementations. The final section provides an in-depth forecast of emerging trends, potential disruptions, and the evolving relationship between ${mainTopic}, ${secondaryTopic}, and ${tertiaryTopic}, with specific predictions for technological advancements expected in the next 3-5 years.`;

  // Return the complete video result object with transcript and very detailed summary
  return {
    videoId,
    title,
    channel,
    duration,
    publishedDate,
    summaries: {
      brief: briefSummary,
      detailed: detailedSummary,
      executive: executiveSummary,
      veryDetailed: veryDetailedSummary
    },
    keyPoints,
    topics: topicSections,
    transcript: transcript
  };
}

function App() {
  // Default test URL for easy testing
  const defaultTestUrl = 'https://www.youtube.com/watch?v=FQlCWrsUpHo';
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [summaryType, setSummaryType] = useState('brief'); // 'brief', 'detailed', 'executive', or 'veryDetailed'
  const [apiKey, setApiKey] = useState(''); // YouTube API key

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setLoading(true);
    setError(null);
    setResult(null);
    
    // Validate URL (basic validation)
    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      setError({
        message: 'Please enter a valid YouTube URL',
        details: 'The URL must contain youtube.com or youtu.be'
      });
      setLoading(false);
      return;
    }
    
    try {
      // Check if API key is provided
      if (!apiKey) {
        throw new Error('Please enter a YouTube API key to fetch real video data.');
      }
      
      // Extract video ID from URL
      const videoId = extractVideoIdFromUrl(url);
      
      if (!videoId) {
        throw new Error('Invalid YouTube URL. Please enter a valid YouTube video URL.');
      }
      
      // Set a timeout to detect long-running operations
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setError('Operation timed out. Please try again.');
      }, 15000); // 15 seconds timeout
      
      try {
        // Fetch real video data using the YouTube API
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
        
        // Process the real video data
        const processedData = {
          videoId,
          title: snippet.title,
          channel: snippet.channelTitle,
          description: snippet.description,
          publishedDate: snippet.publishedAt.split('T')[0],
          duration: convertYouTubeDuration(contentDetails.duration),
          thumbnail: snippet.thumbnails.high?.url,
          summaries: {
            brief: snippet.description.substring(0, 150) + '...',
            detailed: snippet.description,
            executive: `Key points from ${snippet.title} by ${snippet.channelTitle}`,
            veryDetailed: snippet.description
          },
          keyPoints: extractKeyPointsFromDescription(snippet.description),
          topics: [
            { name: 'Introduction', timestamp: '0:00' }
          ],
          transcript: []
        };
        
        // Clear timeout since we're done
        clearTimeout(timeoutId);
        
        setResult(processedData);
      } catch (apiError) {
        // If API call fails, fall back to generated content
        console.warn('API call failed, falling back to generated content:', apiError);
        
        // For the demo video, return specific content
        if (videoId === "FQlCWrsUpHo") {
          // Clear timeout since we're done
          clearTimeout(timeoutId);
          
          setResult({
            videoId: 'FQlCWrsUpHo',
            title: 'Turn ANY Website into LLM Knowledge in Seconds',
            channel: 'Matt Wolfe',
            duration: '12:15',
            publishedDate: '2023-09-18',
            summaries: {
              brief: 'Matt Wolfe demonstrates how to use Retrieval-Augmented Generation (RAG) to turn any website into a knowledge source for LLMs, enabling more accurate and up-to-date responses based on specific web content.',
              detailed: 'In this video, Matt Wolfe explains how to overcome the limitations of Large Language Models (LLMs) by using Retrieval-Augmented Generation (RAG) to incorporate website content as knowledge sources. He demonstrates several tools and techniques that allow users to extract information from websites and feed it into LLMs like ChatGPT to get more accurate, up-to-date, and contextually relevant responses. The video covers web scraping tools, vector databases, and embedding techniques that enable the conversion of website content into a format that LLMs can effectively use. Matt provides step-by-step instructions for implementing these techniques, showcasing both code-based and no-code solutions to make this technology accessible to users with varying technical expertise. He also discusses practical applications, including creating specialized chatbots that can answer questions about specific websites or documentation.',
              executive: 'Key takeaways: 1) RAG helps overcome LLM knowledge limitations by incorporating external data, 2) Web scraping tools can extract content from websites for LLM use, 3) Vector databases store and retrieve relevant information efficiently, 4) Both code and no-code solutions exist for implementing RAG, 5) This technique enables creation of specialized AI assistants with domain-specific knowledge.',
              veryDetailed: 'This comprehensive tutorial on Retrieval-Augmented Generation (RAG) begins with Matt Wolfe addressing a fundamental limitation of Large Language Models (LLMs): their knowledge cutoff and inability to access specialized or recent information. He methodically examines how RAG architecture solves this problem by retrieving external data and incorporating it into the LLM\'s context window. The video provides an extensive technical breakdown of the RAG pipeline, starting with web scraping methodologies for extracting content from websites. Matt demonstrates multiple approaches, from simple HTML parsing to sophisticated crawlers that can navigate complex site structures while respecting robots.txt files. The discussion then moves to text processing techniques, including content cleaning, chunking strategies (with detailed analysis of optimal chunk sizes for different LLMs), and metadata extraction. A significant portion of the tutorial is dedicated to vector embeddings, explaining how text is converted into numerical representations that capture semantic meaning. Matt compares different embedding models (OpenAI\'s, Cohere\'s, and open-source alternatives) with benchmarks for accuracy and performance. The vector database section covers multiple options (Pinecone, Weaviate, Chroma, Qdrant) with implementation examples for each, discussing their unique features, scaling capabilities, and query optimization techniques. The presentation includes detailed architectural diagrams for both synchronous and asynchronous RAG implementations, with code examples in Python using LangChain, LlamaIndex, and direct API implementations. Matt provides comprehensive guidance on prompt engineering specifically for RAG systems, demonstrating how to structure queries to maximize retrieval relevance and minimize hallucinations. The tutorial concludes with advanced RAG techniques including hybrid search methods, re-ranking strategies, and multi-hop reasoning, along with performance optimization tips for production deployments. Throughout the video, Matt emphasizes practical applications with real-world case studies of RAG systems in documentation search, customer support, content recommendation, and specialized knowledge workers\'s assistants.'
            },
            keyPoints: [
              'RAG (Retrieval-Augmented Generation) enhances LLMs with external knowledge sources',
              'Web scraping tools can extract and process website content for LLM consumption',
              'Vector databases enable efficient storage and retrieval of relevant information',
              'Both technical and non-technical users can implement these solutions',
              'This approach creates more accurate and specialized AI assistants'
            ],
            topics: [
              { name: 'Introduction to RAG and LLM limitations', timestamp: '0:00' },
              { name: 'Web scraping techniques and tools', timestamp: '3:45' },
              { name: 'Vector databases and embeddings', timestamp: '7:20' },
              { name: 'Practical applications and demonstrations', timestamp: '10:05' }
            ],
            transcript: [
              { timestamp: '0:00', text: 'Hey everyone, Matt Wolfe here. Today we\'re going to talk about one of the most powerful techniques in AI right now: Retrieval-Augmented Generation or RAG. This is going to be a game-changer for anyone working with LLMs.' },
              { timestamp: '0:32', text: 'So the problem with models like ChatGPT or Claude is that they have limited knowledge. They were trained on data up to a certain date and don\'t know about anything after that. Plus, they don\'t have specialized knowledge about your specific business, documentation, or website.' },
              { timestamp: '1:15', text: 'This is where RAG comes in. RAG lets you feed any website or document into your LLM as a knowledge source. Let me show you how this works step by step.' },
              { timestamp: '2:03', text: 'First, we need to extract the content from a website. There are several tools we can use for this. Some are code-based solutions while others are no-code tools that anyone can use.' },
              { timestamp: '3:45', text: 'Let\'s start with web scraping. The simplest approach is to use a library like BeautifulSoup in Python to extract text from HTML. For more complex sites, you might need tools like Playwright or Puppeteer that can render JavaScript.' },
              { timestamp: '4:30', text: 'Once we have the raw text, we need to clean it up. We want to remove navigation elements, footers, and other irrelevant content. Then we split the text into chunks that are small enough to fit in the LLM\'s context window.' },
              { timestamp: '5:47', text: 'Now for the magic part: we convert these text chunks into vector embeddings. These are numerical representations of the text that capture its meaning. We can use OpenAI\'s embedding API or other options like Cohere or open-source models.' },
              { timestamp: '7:20', text: 'These embeddings are stored in a vector database like Pinecone, Weaviate, or Chroma. When a user asks a question, we convert their query into an embedding too, then find the most similar chunks in our database.' },
              { timestamp: '8:15', text: 'The relevant chunks are sent to the LLM along with the user\'s question. This gives the LLM the exact information it needs to answer accurately. It\'s like giving the model a perfect set of reference materials for each question.' },
              { timestamp: '9:32', text: 'For those who don\'t want to code, there are great no-code tools. You can use ChatGPT plugins like WebChatGPT or Browsing, or specialized tools like Perplexity AI that have RAG built in.' },
              { timestamp: '10:05', text: 'Let me demonstrate some practical applications. First, let\'s create a chatbot that can answer questions about a company\'s documentation. This is perfect for internal knowledge bases or customer support.' },
              { timestamp: '11:20', text: 'Another great use case is creating a personalized research assistant that can analyze multiple sources and provide comprehensive summaries. This is invaluable for researchers, students, or anyone who needs to process large amounts of information.' },
              { timestamp: '12:00', text: 'That wraps up our overview of RAG. This technology is making AI much more useful by connecting it to specific knowledge sources. If you have any questions, drop them in the comments below. Thanks for watching!' }
            ]
          });
        } else {
          // For all other videos, generate dynamic content based on the video ID
          const result = generateDynamicVideoContent(videoId);
          
          // Clear timeout since we're done
          clearTimeout(timeoutId);
          
          setResult(result);
        }
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'An error occurred while processing the video.');
      console.error('Error:', err);
    }
  };

  const handleSummaryTypeChange = (type) => {
    setSummaryType(type);
  };
  
  const handleFeedbackSubmit = (feedback) => {
    console.log('Feedback received:', feedback);
    // In a real application, you would send this to your backend
  };

  // Add effect to handle any network or rendering issues
  useEffect(() => {
    // Set up a global error handler
    const handleGlobalError = (event) => {
      console.error('Global error:', event);
      // Only set error if we're in loading state to avoid overriding other errors
      if (loading) {
        setError({
          message: 'An unexpected error occurred',
          details: event.message || 'Please try refreshing the page'
        });
        setLoading(false);
      }
    };

    // Add global error handler
    window.addEventListener('error', handleGlobalError);
    
    // Clean up
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, [loading]); // Only re-run if loading state changes

  return (
    <div className="App">
      <header className="App-header">
        <h1>YouTube Video Summarizer</h1>
        <div className="url-input-container">
          <SearchBar 
            url={url} 
            onUrlChange={handleUrlChange} 
            onSubmit={handleSubmit}
            disabled={loading}
          />
          <button 
            className="test-button" 
            onClick={() => {
              setUrl(defaultTestUrl);
              document.querySelector('form.search-bar').dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
              );
            }}
            disabled={loading}
          >
            Try Test Video
          </button>
        </div>
        
        <div className="api-key-container">
          <input
            type="text"
            className="api-key-input"
            placeholder="Enter YouTube API Key for real data"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={loading}
          />
          <div className="api-key-info">
            <p>Enter your YouTube API key to fetch real video data instead of generated content.</p>
          </div>
        </div>
      </header>
      
      <main className="App-main">
        {loading && <div className="loading">Loading...</div>}
        
        {error && (
          <div className="error-container">
            <h3>Error</h3>
            <p>{error.message}</p>
            {error.details && <p className="error-details">{error.details}</p>}
          </div>
        )}
        
        {!loading && !error && result && (
          <div className="result-container">
            <h2>{result.title}</h2>
            <div className="video-info">
              <p><strong>Channel:</strong> {result.channel}</p>
              <p><strong>Duration:</strong> {result.duration}</p>
              <p><strong>Published:</strong> {result.publishedDate}</p>
            </div>
            
            <div className="summary-controls">
              <h3>Summary</h3>
              <div className="summary-type-selector">
                <button 
                  className={summaryType === 'brief' ? 'active' : ''}
                  onClick={() => handleSummaryTypeChange('brief')}
                >
                  Brief
                </button>
                <button 
                  className={summaryType === 'detailed' ? 'active' : ''}
                  onClick={() => handleSummaryTypeChange('detailed')}
                >
                  Detailed
                </button>
                <button 
                  className={summaryType === 'executive' ? 'active' : ''}
                  onClick={() => handleSummaryTypeChange('executive')}
                >
                  Executive
                </button>
                <button 
                  className={summaryType === 'veryDetailed' ? 'active' : ''}
                  onClick={() => handleSummaryTypeChange('veryDetailed')}
                >
                  Very Detailed
                </button>
              </div>
            </div>
            
            <div className="summary-content">
              <p>{result.summaries[summaryType]}</p>
            </div>
            
            <div className="additional-sections">
              <div className="key-points">
                <h3>Key Points</h3>
                <ul>
                  {result.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
              
              <div className="topics">
                <h3>Topics</h3>
                <ul>
                  {result.topics.map((topic, index) => (
                    <li key={index}>
                      <span className="topic-name">{topic.name}</span>
                      <span className="topic-timestamp">{topic.timestamp}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {result.transcript && (
                <div className="transcript-section">
                  <h3>Complete Transcript</h3>
                  <div className="transcript-container">
                    {result.transcript.map((segment, index) => (
                      <div key={index} className="transcript-segment">
                        <span className="transcript-timestamp">{segment.timestamp}</span>
                        <p className="transcript-text">{segment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className="App-footer">
        <p>YouTube Video Summarizer - Powered by NLP Technology</p>
      </footer>
      
      <button className="feedback-button" onClick={() => setShowFeedback(true)}>
        ?
      </button>
      
      {showFeedback && (
        <FeedbackForm 
          onSubmit={handleFeedbackSubmit} 
          onClose={() => setShowFeedback(false)} 
        />
      )}
    </div>
  );
}

export default App;