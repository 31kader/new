import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SocketProvider } from './context/SocketContext.tsx';
import { LanguageProvider } from './translations.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Handle OAuth Popup Callback automatically
if (window.opener && (window.location.hash.includes('access_token=') || window.location.search.includes('code='))) {
  // Let Supabase sync its auth state via localStorage, then close the popup.
  setTimeout(() => window.close(), 1500);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <SocketProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </SocketProvider>
    </ErrorBoundary>
  </StrictMode>,
);
