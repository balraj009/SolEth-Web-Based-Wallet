import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/Footer";

function ThemedToastContainer() {
  const { theme } = useTheme();
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme === "dark" ? "light" : "dark"}
    />
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
      <Footer />
      <ThemedToastContainer />
    </ThemeProvider>
  </React.StrictMode>
);
