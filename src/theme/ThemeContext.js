import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "dhanpath_theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved !== null) {
        setIsDark(saved === "dark");
      }
    } catch (e) {
      console.log("Error loading theme:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme ? "dark" : "light");
    } catch (e) {
      console.log("Error saving theme:", e);
    }
  };

  const setTheme = async (dark) => {
    setIsDark(dark);
    try {
      await AsyncStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch (e) {
      console.log("Error saving theme:", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
