import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Déclarer le type pour window.ENV
declare global {
  interface Window {
    ENV: {
      BACKEND_URL: string;
    };
  }
}

// Définir l'URL du backend
window.ENV = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
