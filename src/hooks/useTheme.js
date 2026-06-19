import { useState, useEffect } from "react";

const THEME_KEY = "nexus_theme";

const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    // Fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");
  const setLight    = () => setTheme("light");
  const setDark     = () => setTheme("dark");
  const setSystem   = () => {
    const sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(sys);
    localStorage.removeItem(THEME_KEY);
  };

  return { theme, toggleTheme, setLight, setDark, setSystem };
};

export default useTheme;
