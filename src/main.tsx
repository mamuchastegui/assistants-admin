// Inlined badge removal script - runs before anything else
const removeBadgeScript = `
  (function() {
    // Immediately hide any potential badge via CSS injection
    const style = document.createElement('style');
    style.textContent = '#lovable-badge, [id*="lovable"], [class*="lovable"] { display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }';
    document.head.appendChild(style);
    
    // Function to remove the badge
    function removeBadge() {
      const badge = document.getElementById('lovable-badge');
      if (badge) {
        badge.remove();
        return true;
      }
      
      // Look for anything with lovable in the id or class
      document.querySelectorAll('[id*="lovable"], [class*="lovable"]').forEach(el => {
        el.remove();
      });
      
      return false;
    }

    // Try to remove immediately
    removeBadge();
    
    // Also watch for DOM changes to catch any badges that appear later
    const observer = new MutationObserver(() => {
      removeBadge();
    });
    
    // Start observing before DOM is even fully loaded
    observer.observe(document, {
      childList: true,
      subtree: true
    });
    
    // Make sure we execute this as early as possible
    document.addEventListener('DOMContentLoaded', removeBadge, { once: true });
    window.addEventListener('load', removeBadge, { once: true });
  })();
`;

// Add the script to the document head as the very first thing
if (typeof document !== 'undefined') {
  try {
    // Create and execute script in the most immediate way possible
    const badgeScript = document.createElement('script');
    badgeScript.textContent = removeBadgeScript;
    
    // If document.head exists, insert at the very top
    if (document.head) {
      if (document.head.firstChild) {
        document.head.insertBefore(badgeScript, document.head.firstChild);
      } else {
        document.head.appendChild(badgeScript);
      }
    } 
    // If head doesn't exist yet, create an inline script tag in the document
    else {
      document.write('<script>' + removeBadgeScript + '</script>');
    }
    
    // Also execute directly for immediate effect
    eval(removeBadgeScript);
  } catch (e) {
    console.error('Error removing badge:', e);
  }
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

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
