/**
 * ExportOptions Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportOptions from '../../components/ExportOptions';
import { AppProvider } from '../../context/AppContext';
import { 
  generateFullAnalysisText,
  downloadAsFile
} from '../../utils/shareUtils';

// Mock the context
jest.mock('../../context/AppContext', () => {
  const originalModule = jest.requireActual('../../context/AppContext');
  
  return {
    ...originalModule,
    useAppContext: jest.fn(() => ({
      state: {
        result: {
          videoId: 'FQlCWrsUpHo',
          metadata: {
            title: 'Test Video Title'
          },
          summaries: {
            brief: 'Brief summary',
            detailed: 'Detailed summary',
            executive: 'Executive summary'
          },
          keyPoints: ['Key point 1', 'Key point 2'],
          transcript: {
            full: 'Full transcript'
          }
        }
      }
    }))
  };
});

// Mock the shareUtils
jest.mock('../../utils/shareUtils', () => ({
  generateFullAnalysisText: jest.fn(() => 'Full analysis text'),
  downloadAsFile: jest.fn()
}));

// Mock dynamic imports
jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    addPage: jest.fn(),
    internal: {
      pageSize: {
        getWidth: jest.fn(() => 210),
        getHeight: jest.fn(() => 297)
      }
    },
    save: jest.fn()
  }))
}));

jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    toDataURL: jest.fn(() => 'data:image/png;base64,mockImageData'),
    width: 800,
    height: 1200
  })
}));

describe('ExportOptions Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock window.print
    window.print = jest.fn();
    
    // Mock document methods for PDF generation
    document.querySelector = jest.fn(() => ({
      cloneNode: jest.fn(() => ({
        style: {},
        querySelectorAll: jest.fn(() => [{ style: {} }])
      }))
    }));
    
    document.createElement = jest.fn(() => ({
      className: '',
      innerHTML: '',
      style: {}
    }));
    
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.body.classList = {
      add: jest.fn(),
      remove: jest.fn()
    };
  });
  
  test('renders export button', () => {
    render(
      <AppProvider>
        <ExportOptions />
      </AppProvider>
    );
    
    const exportButton = screen.getByRole('button', { name: /Export/i });
    expect(exportButton).toBeInTheDocument();
  });
  
  test('does not show export menu initially', () => {
    render(
      <AppProvider>
        <ExportOptions />
      </AppProvider>
    );
    
    expect(screen.queryByText(/Export Options/i)).not.toBeInTheDocument();
  });
  
  test('shows export menu when button is clicked', () => {
    render(
      <AppProvider>
        <ExportOptions />
      </AppProvider>
    );
    
    const exportButton = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportButton);
    
    expect(screen.getByText(/Export Options/i)).toBeInTheDocument();
    expect(screen.getByText(/Text File/i)).toBeInTheDocument();
    expect(screen.getByText(/Markdown/i)).toBeInTheDocument();
    expect(screen.getByText(/HTML Document/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF Document/i)).toBeInTheDocument();
    expect(screen.getByText(/Print/i)).toBeInTheDocument();
  });
  
  test('downloads text file when Text File option is clicked', () => {
    render(
      <AppProvider>
        <ExportOptions />
      </AppProvider>
    );
    
    // Open export menu
    const exportButton = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportButton);
    
    // Click Text File button
    const textFileButton = screen.getByText(/Text File/i);
    fireEvent.click(textFileButton);
    
    expect(generateFullAnalysisText).toHaveBeenCalled();
    expect(downloadAsFile).toHaveBeenCalledWith('Full analysis text', 'Test-Video-Title', 'txt');
  });
  
  test('downloads markdown file when Markdown option is clicked', () => {
    render(
      <AppProvider>
        <ExportOptions />
      </AppProvider>
    );
    
    // Open export menu
    const exportButton = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportButton);
    
    // Click Markdown button
    const markdownButton = screen.getByText(/Markdown/i);
    fireEvent.click(markdownButton);
    
    expect(generateFullAnalysisText).toHaveBeenCalled();
    expect(downloadAsFile).toHaveBeenCalledWith('Full analysis text', 'Test-Video-Title', 'md');
  });
  
  test('downloads HTML document when HTML Document option is clicked', () => {
    render(
      <AppProvider>
        <ExportOptions />
      </AppProvider>
    );
    
    // Open export menu
    const exportButton = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportButton);
    
    // Click HTML Document button
    const htmlButton = screen.getByText(/HTML Document/i);
    fireEvent.click(htmlButton);
    
    expect(generateFullAnalysisText).toHaveBeenCalled();
    expect(downloadAsFile).toHaveBeenCalledWith('Full analysis text', 'Test-Video-Title', 'html');
  });
  
  test('prints page when Print option is clicked', () => {
    render(
      <AppProvider>
        <ExportOptions />
      </AppProvider>
    );
    
    // Open export menu
    const exportButton = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportButton);
    
    // Click Print button
    const printButton = screen.getByText(/Print/i);
    fireEvent.click(printButton);
    
    expect(document.body.classList.add).toHaveBeenCalledWith('printing');
    expect(window.print).toHaveBeenCalled();
    
    // Fast-forward timers to check cleanup
    jest.runAllTimers();
    expect(document.body.classList.remove).toHaveBeenCalledWith('printing');
  });
  
  test('closes export menu when close button is clicked', () => {
    render(
      <AppProvider>
        <ExportOptions />
      </AppProvider>
    );
    
    // Open export menu
    const exportButton = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportButton);
    
    // Click close button
    const closeButton = screen.getByLabelText(/Close export menu/i);
    fireEvent.click(closeButton);
    
    expect(screen.queryByText(/Export Options/i)).not.toBeInTheDocument();
  });
});
