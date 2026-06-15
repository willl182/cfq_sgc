import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface CatalogItem {
  _id: Id<"catalogItems">;
  internalId: string;
  externalCode: string;
  originalCode: string;
  name: string;
  class: "MP" | "PT" | "MZR";
  type: "G" | "P" | "L" | "C";
  nutrients: Record<string, number>;
  archivedAt: number;
  createdAt: number;
  updatedAt: number;
}

const NUTRIENT_KEYS = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur",
  "P", "K", "CaO", "MgO", "S", "B",
  "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
] as const;

const NUTRIENT_LABELS: Record<string, string> = {
  C: "C", N: "N", N_NH4: "N-NH4", N_NO3: "N-NO3", N_org: "N-org", N_ur: "N-ur",
  P: "P", K: "K", CaO: "CaO", MgO: "MgO", S: "S", B: "B",
  Co: "Co", Cu: "Cu", Fe: "Fe", Mn: "Mn", Mo: "Mo", SiO2: "SiO2", Zn: "Zn", Na: "Na"
};

export function CatalogView() {
  const items = useQuery(api.catalog.list, { includeArchived: false });
  const isEmpty = useQuery(api.catalog.isEmpty, {});
  const seedFromCsv = useMutation(api.catalog.seedFromCsv);
  const updateNutrients = useMutation(api.catalog.updateNutrients);

  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState<"MP" | "PT" | "MZR" | "">("");
  const [editingId, setEditingId] = useState<Id<"catalogItems"> | null>(null);
  const [editForm, setEditForm] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showSeedDialog, setShowSeedDialog] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const isAdmin = localStorage.getItem("cfq_admin") === "true";

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item: CatalogItem) => {
      if (filterClass && item.class !== filterClass) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchLower) ||
          item.internalId.toLowerCase().includes(searchLower) ||
          item.externalCode.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [items, search, filterClass]);

  const startEditing = useCallback((item: CatalogItem) => {
    if (!isAdmin && item.class !== "MP") return;
    setEditingId(item._id);
    setEditForm({ ...item.nutrients });
  }, [isAdmin]);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditForm({});
  }, []);

  const handleSave = useCallback(async () => {
    if (!editingId) return;
    setSaving(true);
    setSaveStatus("saving");
    try {
      await updateNutrients({
        id: editingId,
        nutrients: editForm,
        actor: localStorage.getItem("cfq_user") || "anonymous",
        reason: "Edición manual",
      });
      setSaveStatus("saved");
      setEditingId(null);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }, [editingId, editForm, updateNutrients]);

  const handleSeed = useCallback(async () => {
    if (!csvFile) return;
    setSaving(true);
    setSaveStatus("saving");
    try {
      const content = await csvFile.text();
      await seedFromCsv({ csvContent: content, actor: localStorage.getItem("cfq_user") || "admin" });
      setSaveStatus("saved");
      setShowSeedDialog(false);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      setSaveStatus("error");
      alert(`Error: ${err}`);
    } finally {
      setSaving(false);
    }
  }, [csvFile, seedFromCsv]);

  const getBadgeClass = (cls: string) => {
    switch (cls) {
      case "MP": return "badge-mp";
      case "PT": return "badge-pt";
      case "MZR": return "badge-mzr";
      default: return "";
    }
  };

  if (items === undefined) {
    return <div className="flex items-center justify-center" style={{ padding: "3rem" }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Catálogo de Insumos</h1>
        <p>Gestiona materias primas (MP), productos terminados (PT) y mezclas de zona de riesgo (MZR)</p>
      </div>

      {saveStatus !== "idle" && (
        <div className={`saving-indicator ${saveStatus}`}>
          {saveStatus === "saving" && <><div className="spinner" /> Guardando...</>}
          {saveStatus === "saved" && <>✓ Guardado</>}
          {saveStatus === "error" && <>✗ Error al guardar</>}
        </div>
      )}

      {isEmpty && (
        <div className="card mb-4">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3>Catálogo vacío</h3>
            <p>Carga el archivo CSV de referencia para inicializar el catálogo.</p>
            <button className="btn btn-primary mt-4" onClick={() => setShowSeedDialog(true)}>
              Cargar CSV
            </button>
          </div>
        </div>
      )}

      {showSeedDialog && (
        <div className="card mb-4">
          <h3 className="card-title mb-4">Carga Inicial del Catálogo</h3>
          <p className="text-sm text-muted mb-4">
            Selecciona el archivo <code>mp-pt_mzr.csv</code> para cargar el catálogo inicial.
            Esta acción solo está disponible cuando el catálogo está vacío.
          </p>
          <div className="input-group">
            <label>Archivo CSV</label>
            <input
              type="file"
              accept=".csv"
              className="input"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={handleSeed} disabled={!csvFile || saving}>
              {saving ? "Cargando..." : "Cargar Catálogo"}
            </button>
            <button className="btn btn-secondary" onClick={() => setShowSeedDialog(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!isEmpty && (
        <>
          <div className="card mb-4">
            <div className="flex gap-4 items-center">
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Buscar por nombre, código interno o código externo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="input"
                style={{ width: "auto" }}
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value as any)}
              >
                <option value="">Todos</option>
                <option value="MP">MP</option>
                <option value="PT">PT</option>
                <option value="MZR">MZR</option>
              </select>
              {isAdmin && (
                <button className="btn btn-secondary" onClick={() => setShowSeedDialog(true)}>
                  Recargar CSV
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Clase</th>
                    <th>Tipo</th>
                    {NUTRIENT_KEYS.slice(0, 8).map((k) => (
                      <th key={k}>{NUTRIENT_LABELS[k]}</th>
                    ))}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item: CatalogItem) => (
                    <tr key={item._id}>
                      <td className="font-mono">{item.internalId}</td>
                      <td>{item.name}</td>
                      <td>
                        <span className={`badge ${getBadgeClass(item.class)}`}>{item.class}</span>
                      </td>
                      <td>{item.type}</td>
                      {NUTRIENT_KEYS.slice(0, 8).map((k) => (
                        <td key={k}>
                          {editingId === item._id ? (
                            <input
                              type="number"
                              step="0.01"
                              className="input"
                              style={{ width: "70px", padding: "0.25rem" }}
                              value={editForm[k] ?? item.nutrients[k]}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  [k]: parseFloat(e.target.value) || 0,
                                }))
                              }
                            />
                          ) : (
                            <span className="font-mono">
                              {item.nutrients[k]?.toFixed(2) || "0.00"}
                            </span>
                          )}
                        </td>
                      ))}
                      <td>
                        {editingId === item._id ? (
                          <div className="flex gap-2">
                            <button className="btn btn-sm btn-success" onClick={handleSave} disabled={saving}>
                              ✓
                            </button>
                            <button className="btn btn-sm btn-secondary" onClick={cancelEditing}>
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => startEditing(item)}
                            disabled={!isAdmin && item.class !== "MP"}
                          >
                            Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-sm text-muted mt-4">
              {filteredItems.length} elementos
              {search && ` (filtrados de ${items.length})`}
            </div>
          </div>
        </>
      )}
    </div>
  );
}