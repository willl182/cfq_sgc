import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface CatalogItem {
  _id: Id<"catalogItems">;
  internalId: string;
  name: string;
  class: "MP" | "PT" | "MZR";
  nutrients: Record<string, number>;
}

interface Component {
  catalogItemId: Id<"catalogItems">;
  cantidadKg: number;
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

function calcularAporte(cantidadKg: number, concentracion: number): number {
  return (cantidadKg * concentracion) / 1000;
}

function calcularComposicion(componentes: Array<{ cantidadKg: number; nutrients: Record<string, number> }>): Record<string, number> {
  const composicion: Record<string, number> = {};
  for (const key of NUTRIENT_KEYS) {
    composicion[key] = 0;
  }
  for (const componente of componentes) {
    for (const key of NUTRIENT_KEYS) {
      composicion[key] += calcularAporte(componente.cantidadKg, componente.nutrients[key] || 0);
    }
  }
  for (const key of NUTRIENT_KEYS) {
    composicion[key] = Math.round(composicion[key] * 10000) / 10000;
  }
  return composicion;
}

export function FormulatorView() {
  const { listId } = useParams<{ listId?: string }>();
  const navigate = useNavigate();

  const catalogItems = useQuery(api.catalog.list, { includeArchived: false });
  const existingList = listId ? useQuery(api.catalog.list, {}) : null;
  const listQuery = listId
    ? useQuery(api.lists.getLiveListWithCalculation, { id: listId as Id<"productLists"> })
    : null;
  const createList = useMutation(api.lists.create);
  const updateList = useMutation(api.lists.update);

  const [targetProductId, setTargetProductId] = useState<Id<"catalogItems"> | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const mpItems = useMemo(() =>
    (catalogItems || []).filter((item: CatalogItem) => item.class === "MP"),
    [catalogItems]
  );

  const ptItems = useMemo(() =>
    (catalogItems || []).filter((item: CatalogItem) => item.class === "PT" || item.class === "MZR"),
    [catalogItems]
  );

  const targetProduct = useMemo(() => {
    if (!targetProductId || !catalogItems) return null;
    return (catalogItems as CatalogItem[]).find((item: CatalogItem) => item._id === targetProductId);
  }, [targetProductId, catalogItems]);

  const componentesConDatos = useMemo(() => {
    if (!catalogItems || !components.length) return [];
    return components.map((comp) => {
      const item = (catalogItems as CatalogItem[]).find((i: CatalogItem) => i._id === comp.catalogItemId);
      return {
        ...comp,
        item,
        nutrients: item?.nutrients || {},
      };
    }).filter((c) => c.item);
  }, [components, catalogItems]);

  const composicionCalculada = useMemo(() => {
    return calcularComposicion(componentesConDatos.map((c) => ({
      cantidadKg: c.cantidadKg,
      nutrients: c.nutrients,
    })));
  }, [componentesConDatos]);

  const totalKg = useMemo(() => {
    return components.reduce((sum, c) => sum + c.cantidadKg, 0);
  }, [components]);

  const alertas = useMemo(() => {
    const msgs: string[] = [];
    if (Math.abs(totalKg - 1000) > 0.01) {
      msgs.push(`Total ${totalKg.toFixed(2)} kg no suma 1000 kg`);
    }
    return msgs;
  }, [totalKg]);

  useEffect(() => {
    if (listQuery) {
      setTargetProductId(listQuery.targetProductId || null);
      setComponents(listQuery.components || []);
    }
  }, [listQuery]);

  const addComponent = useCallback((itemId: Id<"catalogItems">) => {
    setComponents((prev) => [...prev, { catalogItemId: itemId, cantidadKg: 0 }]);
    setShowAddDialog(false);
  }, []);

  const updateComponentCantidad = useCallback((index: number, cantidad: number) => {
    setComponents((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], cantidadKg: Math.round(cantidad * 100) / 100 };
      return next;
    });
  }, []);

  const removeComponent = useCallback((index: number) => {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveStatus("saving");
    try {
      const user = localStorage.getItem("cfq_user") || "anonymous";
      if (listId) {
        await updateList({
          id: listId as Id<"productLists">,
          components,
          createdBy: user,
        });
      } else {
        const result = await createList({
          targetProductId: targetProductId || undefined,
          components,
          createdBy: user,
        });
        navigate(`/formulator/${result.listId}`);
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      setSaveStatus("error");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [listId, targetProductId, components, createList, updateList, navigate]);

  if (catalogItems === undefined) {
    return <div className="flex items-center justify-center" style={{ padding: "3rem" }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>{listId ? "Editar Fórmula" : "Nueva Fórmula"}</h1>
        <p>Crea y gestiona fórmulas de mezclas con componentes MP, PT y MZR</p>
      </div>

      {saveStatus !== "idle" && (
        <div className={`saving-indicator ${saveStatus}`}>
          {saveStatus === "saving" && <><div className="spinner" /> Guardando...</>}
          {saveStatus === "saved" && <>✓ Guardado</>}
          {saveStatus === "error" && <>✗ Error al guardar</>}
        </div>
      )}

      <div className="grid grid-2 gap-4 mb-4">
        <div className="card">
          <h3 className="card-title mb-4">Producto Objetivo (opcional)</h3>
          <div className="input-group">
            <label>Seleccionar PT objetivo</label>
            <select
              className="input"
              value={targetProductId || ""}
              onChange={(e) => setTargetProductId(e.target.value as Id<"catalogItems"> || null)}
            >
              <option value="">Sin objetivo (borrador)</option>
              {ptItems.map((item: CatalogItem) => (
                <option key={item._id} value={item._id}>
                  {item.internalId} - {item.name}
                </option>
              ))}
            </select>
          </div>
          {targetProduct && (
            <div className="mt-4">
              <h4 className="text-sm font-mono mb-2">Valores objetivo:</h4>
              <div className="nutrient-grid">
                {NUTRIENT_KEYS.filter((k) => targetProduct.nutrients[k] > 0).map((k) => (
                  <div key={k} className="nutrient-item">
                    <span className="label">{NUTRIENT_LABELS[k]}</span>
                    <span className="value">{targetProduct.nutrients[k].toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="card-title mb-4">Resumen</h3>
          <div className="flex justify-between mb-2">
            <span className="text-muted">Total:</span>
            <span className="font-mono" style={{ color: Math.abs(totalKg - 1000) < 0.01 ? "var(--color-success)" : "var(--color-error)" }}>
              {totalKg.toFixed(2)} kg
            </span>
          </div>
          {alertas.length > 0 && (
            <div className="alert alert-warning">
              {alertas.map((msg, i) => <div key={i}>{msg}</div>)}
            </div>
          )}
          <button
            className="btn btn-primary mt-4"
            onClick={handleSave}
            disabled={saving || components.length === 0}
            style={{ width: "100%" }}
          >
            {saving ? "Guardando..." : listId ? "Actualizar Fórmula" : "Guardar Fórmula"}
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Componentes</h3>
          <button className="btn btn-secondary" onClick={() => setShowAddDialog(true)}>
            + Agregar componente
          </button>
        </div>

        {components.length === 0 ? (
          <div className="empty-state">
            <p>No hay componentes. Agrega materias primas para comenzar.</p>
          </div>
        ) : (
          <div>
            {componentesConDatos.map((comp, index) => (
              <div key={comp.catalogItemId} className="component-row">
                <div>
                  <div className="item-id">{comp.item.internalId}</div>
                  <div className="item-name">{comp.item.name}</div>
                </div>
                <div className="text-sm text-muted">
                  {comp.item.class}
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1000"
                  value={comp.cantidadKg}
                  onChange={(e) => updateComponentCantidad(index, parseFloat(e.target.value) || 0)}
                />
                <span className="font-mono text-sm">kg</span>
                <button className="btn btn-sm btn-danger" onClick={() => removeComponent(index)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="card-title mb-4">Composición Calculada</h3>
        <div className="table-container">
          <table className="composition-table">
            <thead>
              <tr>
                <th>Nutriente</th>
                <th>Valor</th>
                {targetProduct && <th>Objetivo</th>}
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {NUTRIENT_KEYS.filter((k) => composicionCalculada[k] > 0 || (targetProduct && targetProduct.nutrients[k] > 0)).map((k) => {
                const valor = composicionCalculada[k];
                const objetivo = targetProduct?.nutrients[k] || 0;
                return (
                  <tr key={k}>
                    <td>{NUTRIENT_LABELS[k]}</td>
                    <td className="font-mono">{valor.toFixed(4)}</td>
                    {targetProduct && <td className="font-mono">{objetivo.toFixed(2)}</td>}
                    <td>
                      {targetProduct && objetivo > 0 ? (
                        <span className="tolerance-indicator c">✓</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddDialog && (
        <div className="card" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "90%", maxWidth: "500px", zIndex: 100, maxHeight: "80vh", overflow: "auto" }}>
          <h3 className="card-title mb-4">Agregar Componente</h3>
          <div className="input-group">
            <label>Buscar</label>
            <input type="text" className="input" placeholder="Buscar por nombre..." />
          </div>
          <div style={{ maxHeight: "300px", overflow: "auto" }}>
            {(mpItems as CatalogItem[]).map((item: CatalogItem) => (
              <div
                key={item._id}
                style={{
                  padding: "0.75rem",
                  borderBottom: "1px solid var(--color-border)",
                  cursor: "pointer",
                }}
                onClick={() => addComponent(item._id)}
              >
                <div className="font-mono text-sm">{item.internalId}</div>
                <div>{item.name}</div>
                <div className="text-sm text-muted">{item.class}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary mt-4" onClick={() => setShowAddDialog(false)}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}