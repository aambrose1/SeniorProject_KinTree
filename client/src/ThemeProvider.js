import { React, useState, createContext, useContext, useEffect } from "react";

export const themeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkModeState] = useState(() => {
    // Initialize from localStorage or default to false
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark mode class on mount and whenever darkMode changes
  useEffect(() => {
    // Apply dark mode class to document body
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
      document.body.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Save to localStorage whenever darkMode changes
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkModeState(prev => !prev);
  };

  const setDarkMode = (value) => {
    setDarkModeState(value);
  };

  return (
    <themeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode,
      setDarkMode
    }}>
      {children}
    </themeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(themeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

