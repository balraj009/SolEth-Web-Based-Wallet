import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-toastify";

const DialogContext = React.createContext(null);

export function AlertDialog({ open, setOpen, children }) {
  return open ? (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  ) : null;
}

export function AlertDialogTrigger({ children }) {
  const ctx = React.useContext(DialogContext);
  if (!children) return null;
  return React.cloneElement(children, {
    onClick: () => ctx.setOpen(true),
  });
}

export function AlertDialogPortal({ children }) {
  if (typeof window === "undefined") return null;
  return createPortal(children, document.body);
}

export function AlertDialogOverlay() {
  const ctx = React.useContext(DialogContext);

  let theme = "light";
  try {
    const tctx = useTheme();
    if (tctx && tctx.theme) theme = tctx.theme;
  } catch (e) {
    toast.error(`Input: Failed to get theme from context: ${e.message}`);
  }
  const isDark = theme === "dark";

  const overlayClasses = isDark
    ? "fixed inset-0 bg-black/60 z-40"
    : "fixed inset-0 bg-black/40 z-40";

  return <div onClick={() => ctx.setOpen(false)} className={overlayClasses} />;
}

export function AlertDialogContent({ children }) {
  const ctx = React.useContext(DialogContext);
  const contentRef = useRef(null);

  let theme = "light";
  try {
    const tctx = useTheme();
    if (tctx?.theme) theme = tctx.theme;
  } catch (e) {
    toast.error(`Input: Failed to get theme from context: ${e.message}`);
  }

  const isDark = theme === "dark";
  const invertedDark = !isDark;

  const containerClasses = `
    fixed inset-0 flex items-center justify-center p-4 z-50
  `;

  const contentClasses = invertedDark
    ? `w-full max-w-lg bg-black text-white
       p-6 rounded-xl shadow-lg border border-gray-700`
    : `w-full max-w-lg bg-white text-black
       p-6 rounded-xl shadow-lg border border-gray-300`;

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div className={containerClasses} data-theme={theme}>
        <div
          ref={contentRef}
          className={contentClasses}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    </AlertDialogPortal>
  );
}

export function AlertDialogHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}

export function AlertDialogFooter({ children }) {
  return (
    <div className="flex justify-end gap-2 mt-6 flex-col sm:flex-row">
      {children}
    </div>
  );
}

export function AlertDialogTitle({ children }) {
  return <h2 className="text-xl font-bold">{children}</h2>;
}

export function AlertDialogDescription({ children }) {
  let theme = "light";
  try {
    const tctx = useTheme();
    if (tctx && tctx.theme) theme = tctx.theme;
  } catch (e) {
    toast.error(`Input: Failed to get theme from context: ${e.message}`);
  }

  const isDark = theme === "dark";

  const descClasses = isDark
    ? "text-gray-600 mt-2 text-sm"
    : "text-gray-600 mt-2 text-sm";

  return <p className={descClasses}>{children}</p>;
}

export function AlertDialogCancel({ onClick }) {
  const ctx = React.useContext(DialogContext);

  let theme = "light";
  try {
    const tctx = useTheme();
    if (tctx && tctx.theme) theme = tctx.theme;
  } catch (e) {
    toast.error(`Input: Failed to get theme from context: ${e.message}`);
  }
  const isDark = theme === "dark";

  const btnClasses = isDark
    ? "px-4 py-2 rounded-md border border-gray-600 text-white bg-black hover:bg-gray-800"
    : "px-4 py-2 rounded-md border border-gray-400 text-black bg-white hover:bg-gray-200";

  return (
    <button
      onClick={() => {
        onClick?.();
        ctx.setOpen(false);
      }}
      className={`${btnClasses} cursor-pointer`}
    >
      Cancel
    </button>
  );
}

export function AlertDialogAction({ onClick, children = "Delete" }) {
  const ctx = React.useContext(DialogContext);

  const btnClasses = `px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700/90 cursor-pointer`;

  return (
    <button
      onClick={() => {
        onClick?.();
        ctx.setOpen(false);
      }}
      className={btnClasses}
    >
      {children}
    </button>
  );
}
