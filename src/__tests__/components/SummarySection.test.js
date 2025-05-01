/**
 * SummarySection Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SummarySection from '../../components/SummarySection';
import { AppProvider } from '../../context/AppContext';
import { copyToClipboard } from '../../utils/shareUtils';

// Mock the context
jest.mock('../../context/AppContext', () => {
  const originalModule = jest.requireActual('../../context/AppContext');
  
  return {
    ...originalModule,
    useAppContext: jest.fn(() => ({
      state: {
        result: {
          summaries: {
            brief: 'This is a brief summary.',
            detailed: 'This is a detailed summary with more information.',
            executive: 'This is an executive summary focusing on key points.'
          }
        },
        summaryType: 'detailed'
      },
      setSummaryType: jest.fn()
    }))
  };
});

// Mock the shareUtils
jest.mock('../../utils/shareUtils', () => ({
  copyToClipboard: jest.fn().mockResolvedValue(true)
}));

describe('SummarySection Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });
  
  test('renders the current summary type', () => {
    render(
      <AppProvider>
        <SummarySection />
      </AppProvider>
    );
    
    const summaryText = screen.getByText('This is a detailed summary with more information.');
    expect(summaryText).toBeInTheDocument();
  });
  
  test('renders summary type selector buttons', () => {
    render(
      <AppProvider>
        <SummarySection />
      </AppProvider>
    );
    
    const briefButton = screen.getByRole('button', { name: /Brief/i });
    const detailedButton = screen.getByRole('button', { name: /Detailed/i });
    const executiveButton = screen.getByRole('button', { name: /Executive/i });
    
    expect(briefButton).toBeInTheDocument();
    expect(detailedButton).toBeInTheDocument();
    expect(executiveButton).toBeInTheDocument();
  });
  
  test('highlights the active summary type button', () => {
    render(
      <AppProvider>
        <SummarySection />
      </AppProvider>
    );
    
    const detailedButton = screen.getByRole('button', { name: /Detailed/i });
    expect(detailedButton).toHaveClass('active');
  });
  
  test('calls setSummaryType when a summary type button is clicked', () => {
    const { useAppContext } = require('../../context/AppContext');
    const mockSetSummaryType = jest.fn();
    
    useAppContext.mockReturnValue({
      state: {
        result: {
          summaries: {
            brief: 'This is a brief summary.',
            detailed: 'This is a detailed summary with more information.',
            executive: 'This is an executive summary focusing on key points.'
          }
        },
        summaryType: 'detailed'
      },
      setSummaryType: mockSetSummaryType
    });
    
    render(
      <AppProvider>
        <SummarySection />
      </AppProvider>
    );
    
    const briefButton = screen.getByRole('button', { name: /Brief/i });
    fireEvent.click(briefButton);
    
    expect(mockSetSummaryType).toHaveBeenCalledWith('brief');
  });
  
  test('renders copy button', () => {
    render(
      <AppProvider>
        <SummarySection />
      </AppProvider>
    );
    
    const copyButton = screen.getByRole('button', { name: /Copy/i });
    expect(copyButton).toBeInTheDocument();
  });
  
  test('calls copyToClipboard when copy button is clicked', async () => {
    render(
      <AppProvider>
        <SummarySection />
      </AppProvider>
    );
    
    const copyButton = screen.getByRole('button', { name: /Copy/i });
    fireEvent.click(copyButton);
    
    expect(copyToClipboard).toHaveBeenCalledWith('This is a detailed summary with more information.');
  });
  
  test('shows different summary when summary type changes', () => {
    const { useAppContext } = require('../../context/AppContext');
    
    // First render with 'detailed' type
    render(
      <AppProvider>
        <SummarySection />
      </AppProvider>
    );
    
    expect(screen.getByText('This is a detailed summary with more information.')).toBeInTheDocument();
    
    // Update to 'brief' type
    useAppContext.mockReturnValue({
      state: {
        result: {
          summaries: {
            brief: 'This is a brief summary.',
            detailed: 'This is a detailed summary with more information.',
            executive: 'This is an executive summary focusing on key points.'
          }
        },
        summaryType: 'brief'
      },
      setSummaryType: jest.fn()
    });
    
    // Re-render
    render(
      <AppProvider>
        <SummarySection />
      </AppProvider>
    );
    
    expect(screen.getByText('This is a brief summary.')).toBeInTheDocument();
  });
  
  test('handles missing summaries gracefully', () => {
    const { useAppContext } = require('../../context/AppContext');
    
    useAppContext.mockReturnValue({
      state: {
        result: {
          summaries: {}
        },
        summaryType: 'detailed'
      },
      setSummaryType: jest.fn()
    });
    
    render(
      <AppProvider>
        <SummarySection />
      </AppProvider>
    );
    
    expect(screen.getByText(/No summary available/i)).toBeInTheDocument();
  });
});
