
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

// Script to remove Lovable badge
const removeLovableBadgeScript = `
  (function() {
    function removeBadge() {
      const badge = document.getElementById('lovable-badge');
      if (badge) {
        badge.remove();
        return true;
      }
      return false;
    }

    // First attempt to remove the badge
    if (!removeBadge()) {
      // If badge is not found, wait for it using MutationObserver
      const observer = new MutationObserver((mutations, obs) => {
        if (removeBadge()) {
          obs.disconnect(); // Stop observing once badge is removed
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  })();
`;

// Add the scripts to the document head
if (typeof document !== 'undefined') {
  // Add theme script
  const themeScript = document.createElement('script');
  themeScript.textContent = setInitialTheme;
  document.head.appendChild(themeScript);

  // Add badge removal script
  const badgeScript = document.createElement('script');
  badgeScript.textContent = removeLovableBadgeScript;
  document.head.appendChild(badgeScript);
}

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
