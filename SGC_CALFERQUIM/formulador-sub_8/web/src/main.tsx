import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { App } from "./App";
import "./style.css";

declare global {
  interface ImportMetaEnv {
    readonly VITE_CONVEX_URL: string;
  }
}

const convexUrl = import.meta.env.VITE_CONVEX_URL ?? "http://localhost:3210";
const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </StrictMode>
);