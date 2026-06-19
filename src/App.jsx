import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import useTheme from "./hooks/useTheme";

function App() {
  const { theme } = useTheme();

  // Apply theme class on mount
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return <AppRoutes />;
}

export default App;
