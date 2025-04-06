
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DarkModeToggleProps {
  className?: string;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();

  // Toggle between light and dark mode
  const toggleTheme = () => {
    // Apply theme-transition class temporarily for smooth toggle
    document.documentElement.classList.add('theme-transition');
    
    // Toggle theme
    setTheme(theme === "dark" ? "light" : "dark");
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 150);
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "inline-flex items-center justify-center rounded-full w-8 h-8 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      aria-label="Toggle dark mode"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="moon"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};
