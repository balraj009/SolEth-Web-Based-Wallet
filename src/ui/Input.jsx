import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-toastify";

const baseStyles =
  "w-full rounded-md font-medium transition-all outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2";

const sizes = {
  sm: "text-sm py-1.5",
  md: "text-base py-2",
  lg: "text-lg py-2.5",
};

export default function Input({ size = "md", className = "", ...props }) {
  let theme = "light";

  try {
    const ctx = useTheme();
    if (ctx && ctx.theme) theme = ctx.theme;
  } catch (e) {
    toast.error(`Input: Failed to get theme from context: ${e.message}`);
  }

  const isDark = theme === "dark";

  const themeClasses = isDark
    ? "text-white placeholder:text-gray-500 border border-gray-300"
    : "text-black placeholder:text-gray-500 border border-gray-700";

  return (
    <input
      className={`
        ${baseStyles}
        ${sizes[size]}
        ${themeClasses}
        ${className}
      `}
      {...props}
    />
  );
}
