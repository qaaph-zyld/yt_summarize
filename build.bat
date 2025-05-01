@echo off
echo ===================================
echo YouTube Video Summarizer Build Tool
echo ===================================
echo.
echo This script will build the application for production deployment.
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: Node.js is not installed or not in PATH.
  echo Please install Node.js from https://nodejs.org/
  exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: npm is not installed or not in PATH.
  echo Please install npm (it usually comes with Node.js)
  exit /b 1
)

echo Node.js version:
node --version
echo npm version:
npm --version
echo.

echo Running tests...
call npm test -- --watchAll=false

if %ERRORLEVEL% neq 0 (
  echo.
  echo Warning: Tests failed. Do you want to continue with the build anyway?
  choice /C YN /M "Continue with build"
  if %ERRORLEVEL% equ 2 exit /b 1
)

echo.
echo Building for production...
call npm run build

if %ERRORLEVEL% neq 0 (
  echo.
  echo Error: Build failed.
  exit /b 1
)

echo.
echo Build completed successfully!
echo The production build is in the 'build' directory.
echo.
echo To serve the build locally, run:
echo npx serve -s build
echo.
echo To deploy to Netlify, run:
echo node scripts/deploy.js --platform=netlify --prod
echo.
echo To deploy to Vercel, run:
echo node scripts/deploy.js --platform=vercel --prod
echo.
echo To deploy to GitHub Pages, run:
echo node scripts/deploy.js --platform=github
echo.

choice /C YN /M "Would you like to serve the build locally now"
if %ERRORLEVEL% equ 1 (
  echo.
  echo Starting local server...
  npx serve -s build
)

exit /b 0
