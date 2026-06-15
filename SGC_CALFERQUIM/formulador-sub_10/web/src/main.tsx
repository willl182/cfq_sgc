import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Convex URL - se obtiene de variables de entorno o se configura manualmente
// Para desarrollo: correr `pnpm dlx convex dev` y copiar la URL
const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://your-deployment.convex.cloud";

const convex = new ConvexReactClient(convexUrl);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexProvider>
  </React.StrictMode>
);
