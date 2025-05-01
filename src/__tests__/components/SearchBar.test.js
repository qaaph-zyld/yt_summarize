/**
 * SearchBar Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../../components/SearchBar';
import { AppProvider } from '../../context/AppContext';

// Mock the context
jest.mock('../../context/AppContext', () => {
  const originalModule = jest.requireActual('../../context/AppContext');
  
  return {
    ...originalModule,
    useAppContext: jest.fn(() => ({
      state: {
        url: 'https://www.youtube.com/watch?v=FQlCWrsUpHo',
        loading: false
      },
      setUrl: jest.fn(),
      handleSubmit: jest.fn()
    }))
  };
});

describe('SearchBar Component', () => {
  test('renders search input and button', () => {
    render(
      <AppProvider>
        <SearchBar />
      </AppProvider>
    );
    
    const input = screen.getByPlaceholderText(/Enter YouTube URL/i);
    const button = screen.getByRole('button', { name: /Analyze/i });
    
    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });
  
  test('displays the current URL in the input', () => {
    render(
      <AppProvider>
        <SearchBar />
      </AppProvider>
    );
    
    const input = screen.getByPlaceholderText(/Enter YouTube URL/i);
    expect(input.value).toBe('https://www.youtube.com/watch?v=FQlCWrsUpHo');
  });
  
  test('calls setUrl when input changes', () => {
    const { useAppContext } = require('../../context/AppContext');
    const mockSetUrl = jest.fn();
    
    useAppContext.mockReturnValue({
      state: {
        url: '',
        loading: false
      },
      setUrl: mockSetUrl,
      handleSubmit: jest.fn()
    });
    
    render(
      <AppProvider>
        <SearchBar />
      </AppProvider>
    );
    
    const input = screen.getByPlaceholderText(/Enter YouTube URL/i);
    fireEvent.change(input, { target: { value: 'https://youtu.be/abc123' } });
    
    expect(mockSetUrl).toHaveBeenCalledWith('https://youtu.be/abc123');
  });
  
  test('calls handleSubmit when form is submitted', () => {
    const { useAppContext } = require('../../context/AppContext');
    const mockHandleSubmit = jest.fn(e => e.preventDefault());
    
    useAppContext.mockReturnValue({
      state: {
        url: 'https://www.youtube.com/watch?v=FQlCWrsUpHo',
        loading: false
      },
      setUrl: jest.fn(),
      handleSubmit: mockHandleSubmit
    });
    
    render(
      <AppProvider>
        <SearchBar />
      </AppProvider>
    );
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
  
  test('disables button when loading', () => {
    const { useAppContext } = require('../../context/AppContext');
    
    useAppContext.mockReturnValue({
      state: {
        url: 'https://www.youtube.com/watch?v=FQlCWrsUpHo',
        loading: true
      },
      setUrl: jest.fn(),
      handleSubmit: jest.fn()
    });
    
    render(
      <AppProvider>
        <SearchBar />
      </AppProvider>
    );
    
    const button = screen.getByRole('button', { name: /Analyzing/i });
    expect(button).toBeDisabled();
  });
  
  test('shows loading state when loading', () => {
    const { useAppContext } = require('../../context/AppContext');
    
    useAppContext.mockReturnValue({
      state: {
        url: 'https://www.youtube.com/watch?v=FQlCWrsUpHo',
        loading: true
      },
      setUrl: jest.fn(),
      handleSubmit: jest.fn()
    });
    
    render(
      <AppProvider>
        <SearchBar />
      </AppProvider>
    );
    
    const loadingText = screen.getByText(/Analyzing/i);
    expect(loadingText).toBeInTheDocument();
  });
});
