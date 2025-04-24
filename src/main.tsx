// Inlined theme script - runs before anything else
const setInitialTheme = `
  (function() {
    try {
      const isDark = localStorage.getItem('condamind-theme');
      if (isDark === 'dark' || (!isDark && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.add('light');
      }
    } catch (e) {
      console.error(e);
      document.documentElement.classList.add('dark');
    }
  })();
`;

// Loading screen and badge removal script
const initScript = `
  (function() {
    // Create and inject loading screen
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.style.cssText = 'position: fixed; inset: 0; background: #000; display: flex; align-items: center; justify-content: center; z-index: 9999; transition: opacity 0.5s ease-out;';
    
    const logo = document.createElement('img');
    logo.src = 'https://chat.condamind.com/static/media/condamind-logo.4d154e0e61b38e2b84fb.png';
    logo.style.cssText = 'width: 120px; height: 120px; transition: transform 1s ease-out;';
    
    loadingScreen.appendChild(logo);
    document.body.appendChild(loadingScreen);
    
    // Start logo animation
    setTimeout(() => {
      logo.style.transform = 'scale(1.1)';
    }, 100);

    function removeBadge() {
      const badge = document.getElementById('lovable-badge');
      if (badge) {
        badge.remove();
        return true;
      }
      return false;
    }

    function hideLoadingScreen() {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.remove();
      }, 500);
    }

    // First attempt to remove the badge
    if (removeBadge()) {
      setTimeout(hideLoadingScreen, 1000); // Minimum 1s loading screen
    } else {
      // If badge is not found, wait for it using MutationObserver
      const observer = new MutationObserver((mutations, obs) => {
        if (removeBadge()) {
          obs.disconnect();
          setTimeout(hideLoadingScreen, 1000);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Failsafe: if after 2s we haven't found the badge, hide loading screen anyway
      setTimeout(() => {
        observer.disconnect();
        hideLoadingScreen();
      }, 2000);
    }
  })();
`;

// Add the scripts to the document head
if (typeof document !== 'undefined') {
  // Add theme script
  const themeScript = document.createElement('script');
  themeScript.textContent = setInitialTheme;
  document.head.appendChild(themeScript);

  // Add initialization script
  const initScriptElement = document.createElement('script');
  initScriptElement.textContent = initScript;
  document.head.appendChild(initScriptElement);
}

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
