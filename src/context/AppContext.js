import React, { createContext, useContext, useReducer, useEffect } from 'react';
import config from '../config';

// Initial state
const initialState = {
  url: config.defaultTestUrl || '',
  videoId: null,
  result: null,
  loading: false,
  error: null,
  activeTab: 'summary',
  summaryType: 'detailed',
  recentVideos: [],
  darkMode: config.ui.enableDarkMode || false,
  processingHistory: [],
};

// Action types
export const ActionTypes = {
  SET_URL: 'SET_URL',
  SET_LOADING: 'SET_LOADING',
  SET_RESULT: 'SET_RESULT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_SUMMARY_TYPE: 'SET_SUMMARY_TYPE',
  SET_RECENT_VIDEOS: 'SET_RECENT_VIDEOS',
  TOGGLE_DARK_MODE: 'TOGGLE_DARK_MODE',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  RESET_STATE: 'RESET_STATE',
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_URL:
      return { ...state, url: action.payload };
    
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_RESULT:
      return { 
        ...state, 
        result: action.payload,
        videoId: action.payload?.videoId || state.videoId,
        loading: false,
      };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ActionTypes.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    
    case ActionTypes.SET_SUMMARY_TYPE:
      return { ...state, summaryType: action.payload };
    
    case ActionTypes.SET_RECENT_VIDEOS:
      return { ...state, recentVideos: action.payload };
    
    case ActionTypes.TOGGLE_DARK_MODE:
      return { ...state, darkMode: !state.darkMode };
    
    case ActionTypes.ADD_TO_HISTORY:
      return { 
        ...state, 
        processingHistory: [
          action.payload,
          ...state.processingHistory
        ].slice(0, 20) // Keep only the 20 most recent items
      };
    
    case ActionTypes.RESET_STATE:
      return { 
        ...initialState,
        darkMode: state.darkMode, // Preserve dark mode setting
        recentVideos: state.recentVideos, // Preserve recent videos
        processingHistory: state.processingHistory, // Preserve history
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Load recent videos from localStorage on initial render
  useEffect(() => {
    if (config.features.enableRecentVideos) {
      try {
        const storedVideos = localStorage.getItem('recentVideos');
        if (storedVideos) {
          dispatch({ 
            type: ActionTypes.SET_RECENT_VIDEOS, 
            payload: JSON.parse(storedVideos)
          });
        }
      } catch (error) {
        console.error('Error loading recent videos from localStorage:', error);
      }
    }
    
    // Apply dark mode if enabled
    if (state.darkMode) {
      document.body.classList.add('dark-mode');
    }
  }, []);
  
  // Update body class when dark mode changes
  useEffect(() => {
    if (state.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [state.darkMode]);
  
  // Save recent videos to localStorage when they change
  useEffect(() => {
    if (config.features.enableRecentVideos && state.recentVideos.length > 0) {
      localStorage.setItem('recentVideos', JSON.stringify(state.recentVideos));
    }
  }, [state.recentVideos]);
  
  // Provide context value
  const contextValue = {
    state,
    dispatch,
    
    // Action creators
    setUrl: (url) => dispatch({ type: ActionTypes.SET_URL, payload: url }),
    
    setLoading: (isLoading) => dispatch({ 
      type: ActionTypes.SET_LOADING, 
      payload: isLoading 
    }),
    
    setResult: (result) => {
      dispatch({ type: ActionTypes.SET_RESULT, payload: result });
      
      // Add to processing history if successful
      if (result && !result.error) {
        dispatch({
          type: ActionTypes.ADD_TO_HISTORY,
          payload: {
            videoId: result.videoId,
            title: result.metadata.title,
            timestamp: new Date().toISOString(),
            url: state.url,
          }
        });
        
        // Add to recent videos
        if (config.features.enableRecentVideos) {
          const newVideo = {
            url: state.url,
            title: result.metadata.title,
            date: new Date().toISOString(),
          };
          
          const updatedVideos = [
            newVideo,
            ...state.recentVideos.filter(v => v.url !== state.url)
          ].slice(0, 10);
          
          dispatch({ 
            type: ActionTypes.SET_RECENT_VIDEOS, 
            payload: updatedVideos
          });
        }
      }
    },
    
    setError: (error) => dispatch({ 
      type: ActionTypes.SET_ERROR, 
      payload: error 
    }),
    
    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR }),
    
    setActiveTab: (tab) => dispatch({ 
      type: ActionTypes.SET_ACTIVE_TAB, 
      payload: tab 
    }),
    
    setSummaryType: (type) => dispatch({ 
      type: ActionTypes.SET_SUMMARY_TYPE, 
      payload: type 
    }),
    
    toggleDarkMode: () => dispatch({ type: ActionTypes.TOGGLE_DARK_MODE }),
    
    resetState: () => dispatch({ type: ActionTypes.RESET_STATE }),
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
