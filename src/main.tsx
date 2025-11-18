import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'
import './styles/tokens.css'
import './styles/animations.css'
import './styles/onboarding-global.css'
// import './styles/mobile-fixes.css' // DISABLED - conflicts with emergency-scroll
// import './styles/cross-browser-scroll.css' // DISABLED - conflicts with emergency-scroll
// import './styles/scroll-fix-aggressive.css'; // DISABLED - conflicts with emergency-scroll
import './styles/emergency-scroll.css'; // EMERGENCY scroll fix - PRIMARY and ONLY scroll solution
import './styles/button-fix.css';
import './styles/input-fix.css';
import './styles/viewport-fix.css';
import './styles/globals.css';

// Removed dark class - using light theme for onboarding
// document.documentElement.classList.add('dark');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
