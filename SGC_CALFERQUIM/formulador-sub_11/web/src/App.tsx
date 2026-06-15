import React, { useState, useEffect } from "react";
import CatalogView from "./components/CatalogView.tsx";
import FormulationView from "./components/FormulationView.tsx";
import ListHistoryView from "./components/ListHistoryView.tsx";
import ImportView from "./components/ImportView.tsx";

export type Tab = "catalogo" | "formulacion" | "recetas" | "importacion";

export interface UserContext {
  name: string;
  role: "admin" | "user";
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("catalogo");
  const [user, setUser] = useState<UserContext>({
    name: "Administrador Local",
    role: "admin",
  });
  
  // Navigation / loading cross-tab states
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [cloningSnapshotId, setCloningSnapshotId] = useState<string | null>(null);
  const [viewingSnapshotId, setViewingSnapshotId] = useState<string | null>(null);

  // Load user role from localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem("user_role") as "admin" | "user" | null;
    const savedName = localStorage.getItem("user_name");
    if (savedRole && savedName) {
      setUser({ role: savedRole, name: savedName });
    }
  }, []);

  const handleRoleToggle = () => {
    const nextRole: "admin" | "user" = user.role === "admin" ? "user" : "admin";
    const nextName = nextRole === "admin" ? "Administrador Local" : "Usuario Normal";
    setUser({ role: nextRole, name: nextName });
    localStorage.setItem("user_role", nextRole);
    localStorage.setItem("user_name", nextName);
  };

  const handleSelectTab = (tab: Tab) => {
    // Reset transitional states unless switching to formulation
    if (tab !== "formulacion") {
      setEditingListId(null);
      setCloningSnapshotId(null);
      setViewingSnapshotId(null);
    }
    setActiveTab(tab);
  };

  const handleEditList = (listId: string) => {
    setEditingListId(listId);
    setCloningSnapshotId(null);
    setViewingSnapshotId(null);
    setActiveTab("formulacion");
  };

  const handleCloneSnapshot = (snapshotId: string) => {
    setCloningSnapshotId(snapshotId);
    setEditingListId(null);
    setViewingSnapshotId(null);
    setActiveTab("formulacion");
  };

  const handleViewSnapshot = (snapshotId: string) => {
    setViewingSnapshotId(snapshotId);
    setEditingListId(null);
    setCloningSnapshotId(null);
    setActiveTab("formulacion");
  };

  return (
    <div className="app-container">
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className="navbar" id="main-navbar" role="navigation" aria-label="Navegación principal">
        <div className="navbar__inner">
          <div className="navbar__brand">
            <div className="navbar__logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="7" fill="url(#logo-grad)" />
                <text x="14" y="19.5" fontSize="14" fontWeight="800" textAnchor="middle" fill="white" fontFamily="Inter, sans-serif">C</text>
                <defs>
                  <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28">
                    <stop stopColor="#34d399" />
                    <stop offset="1" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="navbar__brand-text">
              <span className="navbar__title">Formulador<span className="navbar__title-accent">Sub</span></span>
            </div>
          </div>

          <div className="navbar__tabs" role="tablist">
            <button 
              className={`navbar__tab ${activeTab === "catalogo" ? "navbar__tab--active" : ""}`}
              onClick={() => handleSelectTab("catalogo")}
              role="tab" 
              aria-selected={activeTab === "catalogo"}
            >
              <svg className="navbar__tab-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="16" height="14" rx="2" />
                <line x1="2" y1="7" x2="18" y2="7" />
                <line x1="7" y1="7" x2="7" y2="17" />
              </svg>
              <span>Catálogo</span>
            </button>
            
            <button 
              className={`navbar__tab ${activeTab === "formulacion" ? "navbar__tab--active" : ""}`}
              onClick={() => handleSelectTab("formulacion")}
              role="tab" 
              aria-selected={activeTab === "formulacion"}
            >
              <svg className="navbar__tab-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 2v4a1 1 0 01-1 1H3" />
                <path d="M13 2v4a1 1 0 001 1h3" />
                <path d="M7 7v9a2 2 0 002 2h2a2 2 0 002-2V7" />
                <line x1="5" y1="12" x2="15" y2="12" />
              </svg>
              <span>Formulación</span>
            </button>

            <button 
              className={`navbar__tab ${activeTab === "recetas" ? "navbar__tab--active" : ""}`}
              onClick={() => handleSelectTab("recetas")}
              role="tab" 
              aria-selected={activeTab === "recetas"}
            >
              <svg className="navbar__tab-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
                <path d="M7 8h6M7 11h4" />
              </svg>
              <span>Historial e Insumos</span>
            </button>

            <button 
              className={`navbar__tab ${activeTab === "importacion" ? "navbar__tab--active" : ""}`}
              onClick={() => handleSelectTab("importacion")}
              role="tab" 
              aria-selected={activeTab === "importacion"}
            >
              <svg className="navbar__tab-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 16v-6a2 2 0 012-2h8a2 2 0 012 2v6" />
                <path d="M12 2v6" />
                <path d="M8 6l4-4 4 4" />
              </svg>
              <span>Importar CSV</span>
            </button>
          </div>

          <div className="navbar__actions">
            {/* Simulation Auth Badge */}
            <div className="navbar__status" onClick={handleRoleToggle} style={{ cursor: "pointer", userSelect: "none" }} title="Click para alternar Rol">
              <span className={`navbar__status-dot ${user.role === "admin" ? "navbar__status--online" : ""}`} style={{ backgroundColor: user.role === "admin" ? "#34d399" : "#fbbf24" }}></span>
              <span className="navbar__status-text" style={{ fontSize: "var(--fs-xs)", fontWeight: 600 }}>
                {user.role === "admin" ? "🛡️ Admin local" : "👤 Usuario normal"}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main className="main-content">
        <section id="app-view" className="view view--entering">
          {activeTab === "catalogo" && (
            <CatalogView user={user} />
          )}
          {activeTab === "formulacion" && (
            <FormulationView 
              user={user}
              editingListId={editingListId}
              cloningSnapshotId={cloningSnapshotId}
              viewingSnapshotId={viewingSnapshotId}
              onBackToHistory={() => handleSelectTab("recetas")}
            />
          )}
          {activeTab === "recetas" && (
            <ListHistoryView 
              user={user} 
              onEditList={handleEditList}
              onCloneSnapshot={handleCloneSnapshot}
              onViewSnapshot={handleViewSnapshot}
            />
          )}
          {activeTab === "importacion" && (
            <ImportView user={user} onImportSuccess={() => handleSelectTab("catalogo")} />
          )}
        </section>
      </main>
    </div>
  );
}
