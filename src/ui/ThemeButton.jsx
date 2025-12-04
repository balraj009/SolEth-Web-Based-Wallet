import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-3">
      <Sun
        size={18}
        className={`transition ${
          !isDark ? "text-yellow-400" : "text-gray-500"
        }`}
      />

      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`w-12 h-6 flex items-center rounded-full px-1 transition-all cursor-pointer ${
          isDark ? "bg-gray-700" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all ${
            isDark ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>

      <Moon
        size={18}
        className={`transition ${isDark ? "text-blue-300" : "text-gray-500"}`}
      />
    </div>
  );
}
