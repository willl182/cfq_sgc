import { ConvexProvider, ConvexReactClient } from "convex/react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { CatalogView } from "./views/CatalogView";
import { FormulatorView } from "./views/FormulatorView";
import { HistoryView } from "./views/HistoryView";
import { ImportView } from "./views/ImportView";
import "./styles.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export function App() {
  return (
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <div className="app-layout">
          <nav className="sidebar">
            <div className="sidebar__brand">
              <div className="sidebar__logo">C</div>
              <span>Formulador CFQ</span>
            </div>
            <div className="sidebar__nav">
              <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Catálogo
              </NavLink>
              <NavLink to="/formulator" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Formulación
              </NavLink>
              <NavLink to="/history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Histórico
              </NavLink>
              <NavLink to="/import" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Importar
              </NavLink>
            </div>
          </nav>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<CatalogView />} />
              <Route path="/formulator" element={<FormulatorView />} />
              <Route path="/formulator/:listId" element={<FormulatorView />} />
              <Route path="/history" element={<HistoryView />} />
              <Route path="/import" element={<ImportView />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ConvexProvider>
  );
}