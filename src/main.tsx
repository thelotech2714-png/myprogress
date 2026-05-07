import {StrictMode, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Safety: Catch early runtime errors and log them to console (viewable via logcat)
window.onerror = (message, source, lineno, colno, error) => {
  console.error('CRITICAL RUNTIME ERROR:', { message, source, lineno, colno, error });
};

window.onunhandledrejection = (event) => {
  console.error('UNHANDLED PROMISE REJECTION:', event.reason);
};

// Shim for libraries that might expect 'process'
if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = { env: {} };
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-medium tracking-tight">Carregando portal...</p>
          </div>
        </div>
      }>
        <App />
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
