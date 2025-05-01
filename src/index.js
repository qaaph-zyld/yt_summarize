import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppProvider } from './context/AppContext';
import { initDebugTools, DebugLevel, isDevelopment } from './utils/debugUtils';

// Initialize debug tools
initDebugTools({
  debugLevel: isDevelopment() ? DebugLevel.DEBUG : DebugLevel.ERROR,
  registerErrorHandlers: true,
  checkCompatibility: true
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
