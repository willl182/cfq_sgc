import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import "./style.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

// Si no hay URL de Convex, renderizar sin el provider para poder probar la UI
const Root = convexUrl ? (
  <ConvexProvider client={new ConvexReactClient(convexUrl)}>
    <App />
  </ConvexProvider>
) : (
  <App />
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {Root}
  </StrictMode>
);
