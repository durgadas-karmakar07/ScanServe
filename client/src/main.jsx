import '@fontsource/dm-serif-display/400.css';
import '@fontsource/hind/400.css';
import '@fontsource/hind/500.css';
import '@fontsource/hind/600.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.jsx';
import AuthProvider from './context/AuthProvider.jsx';
import ToastProvider from './context/ToastProvider.jsx';
import './index.css';
import { installKeyRepeatGuard } from './lib/keyRepeatGuard.js';

installKeyRepeatGuard();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
