#!/usr/bin/env node

/**
 * YouTube Video Summarizer - Deployment Script
 * 
 * This script automates the deployment process for the YouTube Video Summarizer application.
 * It supports deployment to Netlify, Vercel, and GitHub Pages.
 * 
 * Usage:
 *   node deploy.js [options]
 * 
 * Options:
 *   --platform=<platform>  Deployment platform (netlify, vercel, github)
 *   --prod                 Deploy to production
 *   --site-name=<name>     Site name for the deployment
 *   --help                 Show this help message
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  platform: getArgValue(args, '--platform') || 'netlify',
  prod: args.includes('--prod'),
  siteName: getArgValue(args, '--site-name') || '',
  help: args.includes('--help')
};

// Show help message if requested
if (options.help) {
  showHelp();
  process.exit(0);
}

/**
 * Main function to run the deployment process
 */
async function main() {
  console.log('\n🚀 YouTube Video Summarizer - Deployment Script\n');
  
  try {
    // Check prerequisites
    checkPrerequisites();
    
    // Get deployment options
    const deployOptions = await getDeploymentOptions(options);
    
    // Build the application
    await buildApplication();
    
    // Deploy the application
    await deployApplication(deployOptions);
    
    console.log('\n✅ Deployment completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Check if all prerequisites are installed
 */
function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...');
  
  try {
    // Check Node.js version
    const nodeVersion = execSync('node --version').toString().trim();
    console.log(`  ✓ Node.js ${nodeVersion}`);
    
    // Check npm version
    const npmVersion = execSync('npm --version').toString().trim();
    console.log(`  ✓ npm ${npmVersion}`);
    
    // Check if build directory exists
    const buildDir = path.join(process.cwd(), 'build');
    if (!fs.existsSync(buildDir)) {
      console.log('  ✓ Build directory will be created during build');
    } else {
      console.log('  ✓ Build directory exists');
    }
    
    // Check deployment platform CLI
    if (options.platform === 'netlify') {
      try {
        const netlifyVersion = execSync('netlify --version').toString().trim();
        console.log(`  ✓ Netlify CLI ${netlifyVersion}`);
      } catch (error) {
        throw new Error('Netlify CLI is not installed. Please install it with: npm install -g netlify-cli');
      }
    } else if (options.platform === 'vercel') {
      try {
        const vercelVersion = execSync('vercel --version').toString().trim();
        console.log(`  ✓ Vercel CLI ${vercelVersion}`);
      } catch (error) {
        throw new Error('Vercel CLI is not installed. Please install it with: npm install -g vercel');
      }
    } else if (options.platform === 'github') {
      // Check if gh-pages is installed in the project
      const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
      if (!packageJson.devDependencies['gh-pages'] && !packageJson.dependencies['gh-pages']) {
        throw new Error('gh-pages is not installed. Please install it with: npm install --save-dev gh-pages');
      }
      console.log('  ✓ gh-pages is installed');
    }
    
    console.log('✅ All prerequisites are met\n');
  } catch (error) {
    throw new Error(`Prerequisites check failed: ${error.message}`);
  }
}

/**
 * Get deployment options from user input
 */
async function getDeploymentOptions(options) {
  console.log('📋 Deployment configuration:');
  
  // Get platform
  const platform = options.platform || await promptUser('Deployment platform (netlify, vercel, github): ', 'netlify');
  if (!['netlify', 'vercel', 'github'].includes(platform)) {
    throw new Error(`Invalid platform: ${platform}. Must be one of: netlify, vercel, github`);
  }
  
  // Get production flag
  const prod = options.prod || (await promptUser('Deploy to production? (y/n): ', 'y')).toLowerCase() === 'y';
  
  // Get site name
  let siteName = options.siteName;
  if (!siteName) {
    if (platform === 'netlify' || platform === 'vercel') {
      siteName = await promptUser(`${platform} site name (leave empty for default): `, '');
    } else if (platform === 'github') {
      // For GitHub Pages, we need the repository name
      siteName = await promptUser('GitHub repository name: ', 'youtube-summarizer');
    }
  }
  
  console.log('\nDeployment configuration:');
  console.log(`  Platform: ${platform}`);
  console.log(`  Environment: ${prod ? 'production' : 'development'}`);
  if (siteName) {
    console.log(`  Site name: ${siteName}`);
  }
  
  const confirm = await promptUser('\nProceed with deployment? (y/n): ', 'y');
  if (confirm.toLowerCase() !== 'y') {
    throw new Error('Deployment cancelled by user');
  }
  
  return { platform, prod, siteName };
}

/**
 * Build the application
 */
async function buildApplication() {
  console.log('\n🔨 Building the application...');
  
  try {
    // Run tests
    console.log('  Running tests...');
    execSync('npm test -- --watchAll=false', { stdio: 'inherit' });
    
    // Build the application
    console.log('  Building the application...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('✅ Build completed successfully');
  } catch (error) {
    throw new Error(`Build failed: ${error.message}`);
  }
}

/**
 * Deploy the application to the selected platform
 */
async function deployApplication(options) {
  console.log('\n🚀 Deploying the application...');
  
  try {
    if (options.platform === 'netlify') {
      await deployToNetlify(options);
    } else if (options.platform === 'vercel') {
      await deployToVercel(options);
    } else if (options.platform === 'github') {
      await deployToGitHub(options);
    }
  } catch (error) {
    throw new Error(`Deployment failed: ${error.message}`);
  }
}

/**
 * Deploy the application to Netlify
 */
async function deployToNetlify(options) {
  console.log('  Deploying to Netlify...');
  
  // Create netlify.toml if it doesn't exist
  const netlifyTomlPath = path.join(process.cwd(), 'netlify.toml');
  if (!fs.existsSync(netlifyTomlPath)) {
    console.log('  Creating netlify.toml...');
    const netlifyToml = `[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
    fs.writeFileSync(netlifyTomlPath, netlifyToml);
  }
  
  // Deploy to Netlify
  const deployCommand = options.prod
    ? `netlify deploy --prod${options.siteName ? ` --site=${options.siteName}` : ''}`
    : `netlify deploy${options.siteName ? ` --site=${options.siteName}` : ''}`;
  
  execSync(deployCommand, { stdio: 'inherit' });
}

/**
 * Deploy the application to Vercel
 */
async function deployToVercel(options) {
  console.log('  Deploying to Vercel...');
  
  // Create vercel.json if it doesn't exist
  const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
  if (!fs.existsSync(vercelJsonPath)) {
    console.log('  Creating vercel.json...');
    const vercelJson = `{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ]
}`;
    fs.writeFileSync(vercelJsonPath, vercelJson);
  }
  
  // Deploy to Vercel
  const deployCommand = options.prod
    ? `vercel --prod${options.siteName ? ` --name=${options.siteName}` : ''}`
    : `vercel${options.siteName ? ` --name=${options.siteName}` : ''}`;
  
  execSync(deployCommand, { stdio: 'inherit' });
}

/**
 * Deploy the application to GitHub Pages
 */
async function deployToGitHub(options) {
  console.log('  Deploying to GitHub Pages...');
  
  // Update package.json with homepage
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Set homepage
  const username = await promptUser('GitHub username: ', '');
  if (!username) {
    throw new Error('GitHub username is required for GitHub Pages deployment');
  }
  
  packageJson.homepage = `https://${username}.github.io/${options.siteName}`;
  
  // Add deploy script if it doesn't exist
  if (!packageJson.scripts.deploy) {
    packageJson.scripts.predeploy = 'npm run build';
    packageJson.scripts.deploy = 'gh-pages -d build';
  }
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  // Deploy to GitHub Pages
  execSync('npm run deploy', { stdio: 'inherit' });
  
  console.log(`\n✅ Deployed to GitHub Pages at ${packageJson.homepage}`);
}

/**
 * Helper function to prompt the user for input
 */
function promptUser(question, defaultValue) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

/**
 * Helper function to get the value of a command line argument
 */
function getArgValue(args, name) {
  const arg = args.find(arg => arg.startsWith(`${name}=`));
  return arg ? arg.split('=')[1] : null;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
YouTube Video Summarizer - Deployment Script

This script automates the deployment process for the YouTube Video Summarizer application.
It supports deployment to Netlify, Vercel, and GitHub Pages.

Usage:
  node deploy.js [options]

Options:
  --platform=<platform>  Deployment platform (netlify, vercel, github)
  --prod                 Deploy to production
  --site-name=<name>     Site name for the deployment
  --help                 Show this help message

Examples:
  node deploy.js                           # Deploy to Netlify (interactive mode)
  node deploy.js --platform=netlify --prod # Deploy to Netlify production
  node deploy.js --platform=vercel         # Deploy to Vercel
  node deploy.js --platform=github         # Deploy to GitHub Pages
  `);
}

// Run the main function
main();
