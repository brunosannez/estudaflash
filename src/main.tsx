import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for enhanced performance and offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Initialize Google Analytics if available
declare global {
  function gtag(...args: any[]): void;
}

if (typeof window !== 'undefined' && (window as any).gtag) {
  (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
    page_title: 'EstudaFlash',
    page_location: window.location.href
  });
}

createRoot(document.getElementById("root")!).render(<App />);
