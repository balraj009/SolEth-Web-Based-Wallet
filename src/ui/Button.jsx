import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-toastify";

const baseStyles =
  "inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap";

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-8 py-1.5 text-lg",
};

export default function Button({
  size = "md",
  onClick,
  className = "",
  children,
  ...props
}) {
  let theme = "light";
  try {
    const ctx = useTheme();
    if (ctx && ctx.theme) theme = ctx.theme;
  } catch (e) {
    toast.error(`Button: Failed to get theme from context: ${e.message}`);
  }
  const isDark = theme === "dark";

  const themeClasses = isDark
    ? "bg-white text-black hover:bg-gray-200"
    : "bg-black text-white hover:bg-gray-800";

  return (
    <button
      className={`
        ${baseStyles}
        ${sizes[size]}
        ${themeClasses}
        cursor-pointer
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
