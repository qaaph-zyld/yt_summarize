/**
 * Test Runner Script
 * 
 * This script runs all tests for the YouTube Video Summarizer application.
 * It can be executed from the command line to run all tests or specific test suites.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Test directories to scan for test files
  testDirs: [
    path.join(__dirname),
    path.join(__dirname, 'components')
  ],
  
  // Test file pattern
  testPattern: /\.test\.js$/,
  
  // Whether to show verbose output
  verbose: true,
  
  // Whether to watch for changes
  watch: false,
  
  // Test coverage options
  coverage: true
};

/**
 * Find all test files in the specified directories
 * @returns {Array<string>} Array of test file paths
 */
function findTestFiles() {
  const testFiles = [];
  
  config.testDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isFile() && config.testPattern.test(file)) {
          testFiles.push(filePath);
        }
      });
    }
  });
  
  return testFiles;
}

/**
 * Run tests using Jest
 * @param {Array<string>} testFiles - Array of test file paths
 */
function runTests(testFiles) {
  const jestBin = path.join(process.cwd(), 'node_modules', '.bin', 'jest');
  
  // Build Jest command
  let command = `"${jestBin}"`;
  
  if (testFiles.length > 0) {
    command += ` ${testFiles.map(file => `"${file}"`).join(' ')}`;
  }
  
  if (config.verbose) {
    command += ' --verbose';
  }
  
  if (config.watch) {
    command += ' --watch';
  }
  
  if (config.coverage) {
    command += ' --coverage';
  }
  
  // Add setup file
  const setupFile = path.join(__dirname, 'setup.js');
  if (fs.existsSync(setupFile)) {
    command += ` --setupFiles="${setupFile}"`;
  }
  
  // Run tests
  console.log(`Running tests with command: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Tests failed with error:', error.message);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  args.forEach(arg => {
    if (arg === '--watch' || arg === '-w') {
      config.watch = true;
    } else if (arg === '--no-coverage' || arg === '-nc') {
      config.coverage = false;
    } else if (arg === '--quiet' || arg === '-q') {
      config.verbose = false;
    }
  });
  
  // Filter out option arguments to get test file patterns
  const testPatterns = args.filter(arg => !arg.startsWith('-'));
  
  return testPatterns;
}

/**
 * Main function
 */
function main() {
  console.log('YouTube Video Summarizer Test Runner');
  console.log('====================================');
  
  const testPatterns = parseArgs();
  let testFiles = [];
  
  if (testPatterns.length > 0) {
    // Run specific tests based on patterns
    const allTestFiles = findTestFiles();
    
    testFiles = allTestFiles.filter(file => {
      return testPatterns.some(pattern => {
        return file.includes(pattern);
      });
    });
    
    console.log(`Running tests matching patterns: ${testPatterns.join(', ')}`);
  } else {
    // Run all tests
    testFiles = findTestFiles();
    console.log(`Running all ${testFiles.length} test files`);
  }
  
  if (testFiles.length === 0) {
    console.log('No test files found matching the specified patterns.');
    process.exit(0);
  }
  
  runTests(testFiles);
}

// Run the script
main();
