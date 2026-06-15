import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App.tsx";
import "./style.css";

// Read Convex URL from environment variable or local storage, or default to a standard local dev server port
const DEFAULT_CONVEX_URL = (import.meta.env.VITE_CONVEX_URL) || localStorage.getItem("convex_url") || "http://localhost:5173";

const convexClient = new ConvexReactClient(DEFAULT_CONVEX_URL);

// Save URL to local storage so it persists if provided in environment
if (import.meta.env.VITE_CONVEX_URL) {
  localStorage.setItem("convex_url", import.meta.env.VITE_CONVEX_URL);
}

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <ConvexProvider client={convexClient}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);
