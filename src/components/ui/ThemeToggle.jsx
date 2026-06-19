import { Sun, Moon, Monitor } from "lucide-react";
import useTheme from "@/hooks/useTheme";

// Simple icon toggle button — for Header
export const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark"
        ? <Sun size={16} />
        : <Moon size={16} />
      }
    </button>
  );
};

// Full dropdown with Light / Dark / System options — for Settings
export const ThemeSelector = () => {
  const { theme, setLight, setDark, setSystem } = useTheme();

  const options = [
    { label: "Light",  icon: Sun,     action: setLight,  value: "light"  },
    { label: "Dark",   icon: Moon,    action: setDark,   value: "dark"   },
    { label: "System", icon: Monitor, action: setSystem, value: "system" },
  ];

  return (
    <div className="flex gap-2">
      {options.map(({ label, icon: Icon, action, value }) => {
        const isActive = theme === value || (value === "system" && !["light","dark"].includes(theme));
        return (
          <button
            key={value}
            onClick={action}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all flex-1 justify-center
              ${isActive
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
          >
            <Icon size={15} />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggleButton;
