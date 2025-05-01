# YouTube Video Summarizer - Deployment Guide

This comprehensive guide provides detailed instructions for deploying the YouTube Video Summarizer application to various environments. Whether you're deploying for development, testing, or production, this guide will help you get the application up and running.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Deployment](#local-deployment)
3. [Development Server Deployment](#development-server-deployment)
4. [Production Deployment](#production-deployment)
5. [Netlify Deployment](#netlify-deployment)
6. [Vercel Deployment](#vercel-deployment)
7. [GitHub Pages Deployment](#github-pages-deployment)
8. [Docker Deployment](#docker-deployment)
9. [Environment Variables](#environment-variables)
10. [Continuous Integration/Continuous Deployment](#continuous-integrationcontinuous-deployment)
11. [Monitoring and Maintenance](#monitoring-and-maintenance)
12. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying the YouTube Video Summarizer, ensure you have the following:

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher) or Yarn (v1.22.0 or higher)
- Git
- Access to the deployment platform of your choice
- (Optional) YouTube API key for enhanced functionality

## Local Deployment

For local development and testing, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/youtube-summarizer.git
   cd youtube-summarizer
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory (optional):
   ```
   REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

5. The application will be available at `http://localhost:3000`

## Development Server Deployment

For deploying to a development or staging server:

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. The build output will be in the `build` directory.

3. Serve the build directory using a static file server:
   ```bash
   npx serve -s build
   ```

4. For a more permanent setup, configure a web server like Nginx or Apache to serve the build directory.

## Production Deployment

For production deployment, follow these steps:

1. Ensure all tests pass:
   ```bash
   npm test
   # or
   yarn test
   ```

2. Build the application with production optimization:
   ```bash
   npm run build
   # or
   yarn build
   ```

3. Configure your web server (Nginx, Apache, etc.) to serve the static files from the `build` directory.

4. Set up HTTPS for secure connections.

5. Configure caching headers for optimal performance.

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    root /path/to/youtube-summarizer/build;
    index index.html;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Don't cache HTML
    location ~* \.(html)$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
    }

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache Configuration Example

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    Redirect permanent / https://yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    DocumentRoot /path/to/youtube-summarizer/build

    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key

    <Directory "/path/to/youtube-summarizer/build">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Handle React Router
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </IfModule>

    # Cache settings
    <IfModule mod_expires.c>
        ExpiresActive On
        # Cache JS, CSS, and media files for 1 month
        ExpiresByType text/css "access plus 1 month"
        ExpiresByType application/javascript "access plus 1 month"
        ExpiresByType image/jpeg "access plus 1 month"
        ExpiresByType image/png "access plus 1 month"
        # Don't cache HTML
        ExpiresByType text/html "access plus 0 seconds"
    </IfModule>
</VirtualHost>
```

## Netlify Deployment

Netlify provides an easy way to deploy React applications:

1. Create a `netlify.toml` file in the root directory:
   ```toml
   [build]
     command = "npm run build"
     publish = "build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. Deploy using the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy
   ```

3. For production deployment:
   ```bash
   netlify deploy --prod
   ```

4. Alternatively, connect your GitHub repository to Netlify for automatic deployments.

## Vercel Deployment

Vercel is another excellent platform for deploying React applications:

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy the application:
   ```bash
   vercel
   ```

3. For production deployment:
   ```bash
   vercel --prod
   ```

4. Alternatively, connect your GitHub repository to Vercel for automatic deployments.

## GitHub Pages Deployment

To deploy to GitHub Pages:

1. Install the `gh-pages` package:
   ```bash
   npm install --save-dev gh-pages
   # or
   yarn add --dev gh-pages
   ```

2. Add the following to your `package.json`:
   ```json
   {
     "homepage": "https://yourusername.github.io/youtube-summarizer",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   # or
   yarn deploy
   ```

4. Configure GitHub Pages in your repository settings to use the `gh-pages` branch.

## Docker Deployment

For containerized deployment using Docker:

1. Create a `Dockerfile` in the root directory:
   ```dockerfile
   # Build stage
   FROM node:16-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   # Production stage
   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. Create an `nginx.conf` file:
   ```nginx
   server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. Build the Docker image:
   ```bash
   docker build -t youtube-summarizer .
   ```

4. Run the Docker container:
   ```bash
   docker run -p 80:80 youtube-summarizer
   ```

5. For production, consider using Docker Compose for more complex setups.

## Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
# YouTube API Key (optional)
REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key

# Feature Flags
REACT_APP_ENABLE_RECENT_VIDEOS=true
REACT_APP_ENABLE_DARK_MODE=true
REACT_APP_ENABLE_ANALYTICS=false

# Cache Configuration
REACT_APP_MAX_CACHE_SIZE=20
REACT_APP_CACHE_EXPIRATION_DAYS=7

# Debug Level (0-5)
REACT_APP_DEBUG_LEVEL=1
```

For production, set these variables in your deployment platform's environment configuration.

## Continuous Integration/Continuous Deployment

Set up CI/CD for automated testing and deployment:

### GitHub Actions Example

Create a `.github/workflows/ci-cd.yml` file:

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        cache: 'npm'
    - run: npm ci
    - run: npm test
    - run: npm run build

  deploy:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        cache: 'npm'
    - run: npm ci
    - run: npm run build
    
    # Deploy to Netlify
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      with:
        args: deploy --dir=build --prod
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Monitoring and Maintenance

After deployment, set up monitoring and maintenance procedures:

1. **Performance Monitoring**:
   - Use Lighthouse for performance audits
   - Implement web vitals monitoring
   - Set up error tracking with Sentry or similar tools

2. **Usage Analytics**:
   - Implement Google Analytics or Plausible for privacy-focused analytics
   - Track key user interactions and conversion metrics

3. **Regular Maintenance**:
   - Update dependencies regularly
   - Monitor for security vulnerabilities
   - Perform regular backups of configuration and data

4. **Scaling Considerations**:
   - Implement CDN for static assets
   - Consider serverless functions for API endpoints
   - Set up load balancing for high-traffic scenarios

## Troubleshooting

Common deployment issues and solutions:

### Blank Page After Deployment

This is often caused by incorrect paths. Check:
- The `homepage` field in `package.json`
- Server configuration for handling client-side routing
- Console errors in the browser developer tools

### API Requests Failing

Check:
- CORS configuration
- Environment variables for API keys
- Network tab in browser developer tools for specific error messages

### Performance Issues

If the application is slow after deployment:
- Check bundle size with `npm run build -- --stats`
- Implement code splitting for large components
- Optimize images and other assets
- Enable compression on your web server

### Environment Variable Issues

If environment variables aren't working:
- Ensure they are prefixed with `REACT_APP_`
- Restart the build process after changing environment variables
- Check that the variables are properly set in your deployment platform

---

This deployment guide provides comprehensive instructions for deploying the YouTube Video Summarizer application to various environments. For more detailed information about specific deployment platforms, refer to their official documentation.

If you encounter any issues during deployment, please open an issue on the GitHub repository or contact the project maintainers.

*YouTube Video Summarizer - Deployment Guide*
