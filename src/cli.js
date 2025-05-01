#!/usr/bin/env node

/**
 * YouTube Video Summarizer - Command Line Interface
 * 
 * This script provides a command-line interface for the YouTube Video Summarizer.
 * It allows users to process YouTube videos and generate summaries directly from the terminal.
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { processYouTubeVideo } = require('./utils/youtubeUtils');
const config = require('./config').default;

// Configure the CLI
program
  .name('youtube-summarizer')
  .description('Extract and summarize content from YouTube videos')
  .version('1.0.0');

program
  .requiredOption('-u, --url <url>', 'YouTube video URL')
  .option('-f, --format <format>', 'Summary format (brief, detailed, executive)', 'detailed')
  .option('-o, --output <path>', 'Output file path')
  .option('-k, --key-points', 'Include key points in output', false)
  .option('-t, --transcript', 'Include full transcript in output', false)
  .option('-m, --metadata', 'Include video metadata in output', false)
  .option('--topics', 'Include topic segmentation in output', false)
  .option('--all', 'Include all information in output', false)
  .option('--json', 'Output in JSON format', false)
  .option('--markdown', 'Output in Markdown format', true)
  .option('--no-color', 'Disable colored output')
  .parse(process.argv);

const options = program.opts();

// Validate options
if (!options.url) {
  console.error(chalk.red('Error: YouTube URL is required'));
  process.exit(1);
}

// Main function
async function main() {
  const spinner = ora('Processing YouTube video...').start();
  
  try {
    // Process the video
    const result = await processYouTubeVideo(options.url);
    
    if (result.error) {
      spinner.fail(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    spinner.succeed(chalk.green('Video processed successfully'));
    
    // Prepare output based on selected format
    let output = '';
    
    if (options.json) {
      // JSON output
      const outputData = {
        videoId: result.videoId,
        metadata: result.metadata
      };
      
      // Include selected sections based on options
      if (options.all || options.format) {
        outputData.summaries = result.summaries;
      } else {
        outputData.summary = result.summaries[options.format];
      }
      
      if (options.all || options.keyPoints) {
        outputData.keyPoints = result.keyPoints;
      }
      
      if (options.all || options.topics) {
        outputData.topics = result.topics;
      }
      
      if (options.all || options.transcript) {
        outputData.transcript = result.transcript;
      }
      
      output = JSON.stringify(outputData, null, 2);
    } else {
      // Markdown output
      output = generateMarkdownOutput(result, options);
    }
    
    // Output to file or console
    if (options.output) {
      fs.writeFileSync(options.output, output);
      console.log(chalk.green(`Output saved to ${options.output}`));
    } else {
      console.log(output);
    }
    
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Generate Markdown output based on the processing results and options
 */
function generateMarkdownOutput(result, options) {
  const { metadata, summaries, keyPoints, topics, transcript } = result;
  let output = '';
  
  // Add title and metadata
  output += `# ${metadata.title}\n\n`;
  
  if (options.all || options.metadata) {
    output += `## Video Information\n`;
    output += `- **Channel**: ${metadata.channel}\n`;
    output += `- **Published Date**: ${metadata.publishedDate}\n`;
    output += `- **Category**: ${metadata.category}\n`;
    output += `- **Views**: ${metadata.views}\n`;
    output += `- **Likes**: ${metadata.likes}\n\n`;
  }
  
  // Add summary
  if (options.all) {
    output += `## Summaries\n\n`;
    output += `### Brief Summary\n${summaries.brief}\n\n`;
    output += `### Detailed Summary\n${summaries.detailed}\n\n`;
    output += `### Executive Summary\n${summaries.executive}\n\n`;
  } else {
    const format = options.format || 'detailed';
    output += `## ${format.charAt(0).toUpperCase() + format.slice(1)} Summary\n\n`;
    output += `${summaries[format]}\n\n`;
  }
  
  // Add key points
  if (options.all || options.keyPoints) {
    output += `## Key Points\n\n`;
    keyPoints.forEach((point, index) => {
      output += `${index + 1}. ${point}\n`;
    });
    output += '\n';
  }
  
  // Add topics
  if (options.all || options.topics) {
    output += `## Topics\n\n`;
    topics.forEach((topic) => {
      output += `- **${topic.name}**: Segments ${topic.segments.join(', ')}\n`;
    });
    output += '\n';
  }
  
  // Add transcript
  if (options.all || options.transcript) {
    output += `## Full Transcript\n\n\`\`\`\n${transcript.full}\n\`\`\`\n\n`;
  }
  
  // Add footer
  output += `---\n\n*Generated by YouTube Video Summarizer on ${new Date().toLocaleDateString()}*`;
  
  return output;
}

// Run the main function
main().catch(error => {
  console.error(chalk.red(`Unhandled error: ${error.message}`));
  process.exit(1);
});
