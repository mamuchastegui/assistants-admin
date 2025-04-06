
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: "dark", // Default to dark
  setTheme: () => null,
};

const ThemeContext = createContext<ThemeProviderState>(initialState);

// Script to prevent flash of incorrect theme
const themeScript = `
  (function() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('condamind-theme');
    const theme = storedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
  })()
`;

export function ThemeProvider({
  children,
  defaultTheme = "dark", // Default to dark
  storageKey = "condamind-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  // Apply theme immediately using an effect with no dependencies
  useEffect(() => {
    // Get the stored theme or use default
    const root = window.document.documentElement;
    const initialTheme = localStorage.getItem(storageKey) as Theme || defaultTheme;
    
    // Remove the old theme class
    root.classList.remove("light", "dark");
    
    // Add the new theme class
    root.classList.add(initialTheme);
    
    // Ensure state matches initial theme
    if (initialTheme !== theme) {
      setTheme(initialTheme);
    }
  }, []);
  
  // Handle theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove the old theme class
    root.classList.remove("light", "dark");
    
    // Add the new theme class
    root.classList.add(theme);
    
    // Store the current preference
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme: (theme: Theme) => setTheme(theme),
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {/* Add script in head to apply theme before React hydrates */}
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
