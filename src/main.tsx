
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

// Add the script tag to the document head
if (typeof document !== 'undefined') {
  const script = document.createElement('script');
  script.textContent = setInitialTheme;
  document.head.appendChild(script);
}

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
