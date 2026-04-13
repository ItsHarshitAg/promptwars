import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

// Remove the inline app-shell once React takes over
const shell = document.getElementById('app-shell');
if (shell) shell.remove();

// Apply saved theme before first paint (avoids flash)
const _storedTheme = localStorage.getItem('ss-theme');
if (_storedTheme === 'dark' || _storedTheme === 'light') {
  document.documentElement.setAttribute('data-theme', _storedTheme);
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.setAttribute('data-theme', 'dark');
} else {
  document.documentElement.setAttribute('data-theme', 'light');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
