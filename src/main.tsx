
// Inlined badge removal script - runs before anything else
const removeBadgeScript = `
  (function() {
    // Immediately hide any potential badge via CSS injection
    const style = document.createElement('style');
    style.textContent = '#lovable-badge { display: none !important; opacity: 0 !important; visibility: hidden !important; }';
    document.head.appendChild(style);
    
    // Function to remove the badge
    function removeBadge() {
      const badge = document.getElementById('lovable-badge');
      if (badge) {
        badge.remove();
        return true;
      }
      return false;
    }

    // Try to remove immediately
    if (!removeBadge()) {
      // If not found, watch for DOM changes
      const observer = new MutationObserver((mutations, obs) => {
        if (removeBadge()) {
          obs.disconnect();
        }
      });
      
      observer.observe(document, {
        childList: true,
        subtree: true
      });
    }
  })();
`;

// Add the script to the document head
if (typeof document !== 'undefined') {
  // Add badge removal script
  const badgeScript = document.createElement('script');
  badgeScript.textContent = removeBadgeScript;
  document.head.appendChild(badgeScript);
}

// Inlined theme script
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

// Add the theme script to the document head
if (typeof document !== 'undefined') {
  // Add theme script
  const themeScript = document.createElement('script');
  themeScript.textContent = setInitialTheme;
  document.head.appendChild(themeScript);
}

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
