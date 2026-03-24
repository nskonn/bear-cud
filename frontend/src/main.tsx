import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { AuthProvider } from './app/providers/AuthProvider';
import { QueryProvider } from './app/providers/QueryProvider';
import { Toaster } from 'sonner';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <App />
          <Toaster position="bottom-right" richColors />
      </AuthProvider>
    </QueryProvider>
  </StrictMode>,
);
