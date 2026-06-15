import { useState } from "react";
import AdminSeed from "./components/AdminSeed";
import CatalogView from "./components/CatalogView";
import FormulatorView from "./components/FormulatorView";
import ListsView from "./components/ListsView";
import SnapshotsView from "./components/SnapshotsView";

type Tab = "catalogo" | "formulador" | "listas" | "snapshots" | "admin";

export default function App() {
  const [tab, setTab] = useState<Tab>("catalogo");
  const isAdmin = true; // localStorage admin toggle

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div style={{padding: 10, background: "red", color: "white"}}>DEBUG: App renderizado</div>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 h-14">
          <div className="font-bold text-emerald-700 mr-4">FormuladorSub</div>
          {(
            [
              { key: "catalogo", label: "Catálogo" },
              { key: "formulador", label: "Formulador" },
              { key: "listas", label: "Recetas" },
              { key: "snapshots", label: "Histórico" },
              ...(isAdmin ? [{ key: "admin", label: "Admin" }] : []),
            ] as { key: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as Tab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                tab === t.key
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === "catalogo" && <CatalogView />}
        {tab === "formulador" && <FormulatorView />}
        {tab === "listas" && <ListsView />}
        {tab === "snapshots" && <SnapshotsView />}
        {tab === "admin" && <AdminSeed />}
      </main>
    </div>
  );
}