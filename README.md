# YouTube Video Summarizer

A comprehensive tool that extracts transcripts from YouTube videos, processes them using NLP techniques, and generates various types of summaries to help users quickly understand video content.

## Features

- **Video Transcript Extraction**: Automatically extracts and formats transcripts from YouTube videos
- **Multiple Summary Types**: Generates brief, detailed, and executive summaries
- **Key Point Extraction**: Identifies and highlights the most important points from the video
- **Topic Identification**: Segments the video content into distinct topics
- **User-Friendly Interface**: Clean, intuitive interface for easy navigation
- **Timestamp Integration**: Preserves timestamps for easy reference to the original video
- **Copy/Share Functionality**: Easily copy or share summaries and key points
- **Export Options**: Export analysis as TXT, Markdown, HTML, PDF, or print directly
- **Video Preview**: Enhanced thumbnail experience with hover preview
- **Caching System**: Local storage-based caching for improved performance
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/youtube-summarizer.git
   cd youtube-summarizer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. Enter a YouTube URL in the search bar
2. Click "Analyze" to process the video
3. View the different tabs to see:
   - Summary (with options for brief, detailed, or executive format)
   - Full transcript with timestamps
   - Key points extracted from the video
   - Topics identified in the video

## Project Structure

- `src/` - Source code
  - `components/` - React components
  - `utils/` - Utility functions for processing videos and text
  - `context/` - Context API for state management
  - `__tests__/` - Test files for components and utilities
- `templates/` - Templates for project documentation
- `examples/` - Example analyses
- `docs/` - Project documentation
- `scripts/` - Utility scripts for deployment and testing

## Documentation

For more detailed information about the project, refer to:

- [User Guide](./docs/user-guide.md) - Comprehensive instructions for using the application
- [Developer Guide](./docs/developer-guide.md) - Technical documentation for developers
- [API Reference](./docs/api-reference.md) - Reference for the application's utility functions
- [Deployment Guide](./docs/deployment-guide.md) - Instructions for deploying the application
- [Documentation Index](./docs/index.md) - Overview of all documentation
- [Roadmap](./roadmap.md) - Development roadmap and progress

## Example

Try the application with this sample YouTube video:
```
https://youtu.be/FQlCWrsUpHo?si=gTI86azjgzruXN9c
```

## Command-Line Interface

In addition to the web interface, you can use the command-line interface:

```
npm run summarize -- --url="https://youtu.be/FQlCWrsUpHo"
```

Options:
- `--url`: YouTube URL (required)
- `--format`: Summary format (brief, detailed, executive)
- `--output`: Output file path

### Test Runner

Run tests using the test runner script:

```
node src/__tests__/runTests.js --all
```

Options:
- `--all`: Run all tests
- `--component`: Run component tests
- `--util`: Run utility tests
- `--coverage`: Generate coverage report
- `--watch`: Run tests in watch mode

### Deployment

Deploy the application using the deployment script:

```
node scripts/deploy.js
```

Options:
- `--platform=<platform>`: Deployment platform (netlify, vercel, github)
- `--prod`: Deploy to production
- `--site-name=<name>`: Site name for the deployment
- `--help`: Show help message

## Error Handling

The application includes comprehensive error handling for:
- Invalid YouTube URLs
- Videos without available transcripts
- API quota limitations
- Network connectivity issues

## Configuration

You can customize the application behavior by modifying the configuration file:
- `src/config.js` - Application configuration settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- YouTube API for providing access to video metadata
- Natural language processing libraries for text analysis
- React for the frontend framework

---

*YouTube Video Summarizer - Powered by NLP Technology*

---

## Latest Updates

- **Complete Documentation**: Added comprehensive user and developer guides
- **Deployment Ready**: Added deployment scripts and configuration for Netlify, Vercel, and GitHub Pages
- **Comprehensive Testing**: Added test suite for all components and utilities
- **Performance Optimization**: Implemented caching, lazy loading, and other performance enhancements
- **Enhanced UI/UX**: Added dark mode, video preview, and improved mobile compatibility
