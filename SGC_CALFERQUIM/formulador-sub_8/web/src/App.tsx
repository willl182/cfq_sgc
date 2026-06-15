import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState } from "react";
import { CatalogPage } from "./pages/CatalogPage";
import { FormuladorPage } from "./pages/FormuladorPage";
import { HistoricoPage } from "./pages/HistoricoPage";
import { DashboardPage } from "./pages/DashboardPage";
import {
  LayoutDashboard,
  Database,
  FlaskConical,
  Clock,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Inicio", icon: LayoutDashboard },
  { to: "/catalogo", label: "Catálogo", icon: Database },
  { to: "/formulador", label: "Formulador", icon: FlaskConical },
  { to: "/historico", label: "Histórico", icon: Clock },
];

export function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("cfq_admin") === "true";
  });

  const toggleAdmin = () => {
    const next = !isAdmin;
    setIsAdmin(next);
    localStorage.setItem("cfq_admin", String(next));
  };

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h1 className="text-lg font-bold text-blue-800">Formulador CFQ</h1>
            <p className="text-xs text-slate-500">v2 — Convex</p>
          </div>
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="p-3 border-t border-slate-200">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={toggleAdmin}
                className="rounded border-slate-300"
              />
              <span className="text-slate-600">Modo Admin</span>
            </label>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/catalogo" element={<CatalogPage isAdmin={isAdmin} />} />
            <Route path="/formulador" element={<FormuladorPage isAdmin={isAdmin} />} />
            <Route path="/historico" element={<HistoricoPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}