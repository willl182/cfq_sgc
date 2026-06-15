import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  NUTRIENT_KEYS,
  NUTRIENT_LABELS,
  fmtGrade,
  fmtNum,
  calcularComposicion,
  evaluarTodos,
  type NutrientKey,
  type GeneralStatus,
  type TolDetail,
  BASE_KG,
} from "../lib";

interface ComponentRow {
  catalogItemId: string;
  internalId: string;
  nombre: string;
  cantidadKg: number;
  nutrientSnapshot: Record<NutrientKey, number>;
}

const emptyComponent = (): ComponentRow => ({
  catalogItemId: "",
  internalId: "",
  nombre: "",
  cantidadKg: 0,
  nutrientSnapshot: Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0])) as any,
});

const STATUS_LABELS: Record<string, string> = {
  CUMPLE: "\u2705 Conforme",
  CUMPLE_S: "\u26a0\ufe0f Conforme con exceso",
  NO_CUMPLE: "\u274c No conforme",
  SIN_OBJETIVO: "\u2014 Sin objetivo",
};

const STATUS_CLASSES: Record<string, string> = {
  CUMPLE: "status-c",
  CUMPLE_S: "status-sup",
  NO_CUMPLE: "status-nc",
  SIN_OBJETIVO: "status-neutral",
};

export default function FormuladorView() {
  const catalogItems = useQuery(api.catalogItems.getAll, { includeArchived: false }) ?? [];
  const lists = useQuery(api.productLists.listAll, { includeArchived: false }) ?? [];

  const [components, setComponents] = useState<ComponentRow[]>([emptyComponent()]);
  const [targetProductId, setTargetProductId] = useState<string>("");
  const [displayCode, setDisplayCode] = useState<string>("");
  const [existingListId, setExistingListId] = useState<string | null>(null);
  const [mpSearch, setMpSearch] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const saveMutation = useMutation(api.productLists.save);

  const mpItems = useMemo(
    () => catalogItems.filter((i: any) => i.clase === "MP"),
    [catalogItems]
  );
  const ptItems = useMemo(
    () => catalogItems.filter((i: any) => i.clase === "PT" || i.clase === "MZR"),
    [catalogItems]
  );

  const targetProduct = useMemo(() => {
    if (!targetProductId) return null;
    return catalogItems.find((i: any) => i._id === targetProductId) ?? null;
  }, [targetProductId, catalogItems]);

  const computed = useMemo(() => {
    const activeComps = components.filter((c) => c.catalogItemId && c.cantidadKg > 0);
    return calcularComposicion(
      activeComps.map((c) => ({
        cantidadKg: c.cantidadKg,
        nutrientSnapshot: c.nutrientSnapshot,
      }))
    );
  }, [components]);

  const declarados = useMemo(() => {
    if (!targetProduct) {
      const empty: Record<string, number> = {};
      for (const k of NUTRIENT_KEYS) empty[k] = 0;
      return empty as Record<NutrientKey, number>;
    }
    const d: Record<string, number> = {};
    for (const k of NUTRIENT_KEYS) d[k] = targetProduct[k] ?? 0;
    return d as Record<NutrientKey, number>;
  }, [targetProduct]);

  const evalResult = useMemo(() => {
    return evaluarTodos(computed, declarados);
  }, [computed, declarados]);

  const totalKg = useMemo(
    () => components.reduce((sum, c) => sum + c.cantidadKg, 0),
    [components]
  );

  const addComponent = () => {
    setComponents([...components, emptyComponent()]);
  };

  const removeComponent = (idx: number) => {
    setComponents(components.filter((_, i) => i !== idx));
  };

  const updateComponent = (idx: number, field: keyof ComponentRow, value: any) => {
    const updated = [...components];
    updated[idx] = { ...updated[idx], [field]: value };
    setComponents(updated);
  };

  const selectItem = (idx: number, item: any) => {
    const snap: Record<string, number> = {};
    for (const k of NUTRIENT_KEYS) snap[k] = item[k] ?? 0;
    const updated = [...components];
    updated[idx] = {
      ...updated[idx],
      catalogItemId: item._id,
      internalId: item.internalId,
      nombre: item.nombre,
      nutrientSnapshot: snap as Record<NutrientKey, number>,
    };
    setComponents(updated);
    setShowDropdown(null);
  };

  const pickTargetProduct = (item: any) => {
    setTargetProductId(item._id);
    setMpSearch("");
  };

  const handleSave = async () => {
    const activeComps = components.filter((c) => c.catalogItemId && c.cantidadKg > 0);
    if (activeComps.length === 0) {
      setSaveMsg("Agregue al menos un componente con cantidad");
      return;
    }

    setSaving(true);
    try {
      const targetSnap = targetProduct
        ? (() => {
            const s: Record<string, any> = { internalId: targetProduct.internalId, nombre: targetProduct.nombre };
            for (const k of NUTRIENT_KEYS) s[k] = targetProduct[k] ?? 0;
            return s;
          })()
        : undefined;

      const code = displayCode || "BORRADOR-001";
      const result = await saveMutation({
        displayCode: code,
        targetProductId: targetProductId ? targetProductId as any : undefined,
        targetProductSnapshot: targetSnap as any,
        components: activeComps.map((c) => ({
          catalogItemId: c.catalogItemId as any,
          internalId: c.internalId,
          nombre: c.nombre,
          cantidadKg: Math.round(c.cantidadKg * 100) / 100,
          nutrientSnapshot: c.nutrientSnapshot,
        })),
        totalKg: Math.round(totalKg * 100) / 100,
        createdBy: "local_user",
        existingListId: existingListId as any,
      });

      setSaveMsg(
        `Guardado: ${result.generalStatus} (v${result.snapshotVersion})${result.alertas.length ? " - " + result.alertas.join(", ") : ""}`
      );
      setExistingListId(result.listId);
    } catch (e: any) {
      setSaveMsg("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setComponents([emptyComponent()]);
    setTargetProductId("");
    setDisplayCode("");
    setExistingListId(null);
    setSaveMsg(null);
  };

  const loadList = (list: any) => {
    setExistingListId(list._id);
    setDisplayCode(list.displayCode);
    setTargetProductId(list.targetProductId ?? "");
    setComponents(
      list.components.map((c: any) => ({
        catalogItemId: c.catalogItemId,
        internalId: c.internalId,
        nombre: c.nombre,
        cantidadKg: c.cantidadKg,
        nutrientSnapshot: c.nutrientSnapshot,
      }))
    );
  };

  return (
    <div className="view">
      <div className="view-header">
        <div className="view-header-left">
          <h2 className="view-title">Formulador</h2>
          <span className="badge">
            {existingListId ? "Editando" : "Nueva f\u00f3rmula"}
          </span>
        </div>
        <div className="view-header-right">
          <button className="btn btn-secondary" onClick={handleNew}>
            Nueva
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {saveMsg && (
        <div className={`alert ${saveMsg.startsWith("Error") ? "alert-error" : "alert-success"}`}>
          {saveMsg}
          <button className="btn-icon" onClick={() => setSaveMsg(null)}>
            &times;
          </button>
        </div>
      )}

      {Math.abs(totalKg - BASE_KG) > 0.01 && totalKg > 0 && (
        <div className="alert alert-warning">
          Total: {fmtNum(totalKg)} kg (base {BASE_KG} kg)
        </div>
      )}

      <div className="formulador-layout">
        <div className="form-column">
          <div className="card">
            <div className="card-title">Producto Destino</div>
            <div className="form-row">
              <div className="form-group flex-2" style={{ position: "relative" }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Buscar PT/MZR objetivo..."
                  value={targetProduct ? targetProduct.internalId + " - " + targetProduct.nombre : mpSearch}
                  onChange={(e) => { setMpSearch(e.target.value); setTargetProductId(""); }}
                  onFocus={() => setShowDropdown(-1)}
                />
                {showDropdown === -1 && !targetProduct && (
                  <div className="search-dropdown visible">
                    {ptItems
                      .filter((p: any) => !mpSearch || `${p.internalId} ${p.nombre}`.toLowerCase().includes(mpSearch.toLowerCase()))
                      .slice(0, 10)
                      .map((p: any) => (
                        <div key={p._id} className="dropdown-item" onClick={() => pickTargetProduct(p)}>
                          <span className="dropdown-cod">{p.internalId}</span>
                          <span className="dropdown-name">{p.nombre}</span>
                        </div>
                      ))}
                  </div>
                )}
                {targetProduct && (
                  <button
                    className="btn-icon"
                    onClick={() => { setTargetProductId(""); setMpSearch(""); }}
                    title="Quitar"
                  >
                    &times;
                  </button>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">C\u00f3digo Lista</label>
                <input
                  type="text"
                  className="form-input"
                  value={displayCode}
                  onChange={(e) => setDisplayCode(e.target.value)}
                  placeholder="PT0001-L001"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              Componentes de la Mezcla
              <span className="badge">{totalKg.toFixed(2)} / {BASE_KG} kg</span>
            </div>
            <div className="progress-section">
              <div className="progress-bar">
                <div
                  className={`progress-fill ${totalKg > BASE_KG ? "over" : totalKg === BASE_KG ? "complete" : ""}`}
                  style={{ width: `${Math.min((totalKg / BASE_KG) * 100, 100)}%` }}
                />
              </div>
            </div>

            {components.map((comp, idx) => (
              <div key={idx} className="mp-slot">
                <div className="slot-header">
                  <span className="slot-number">{idx + 1}</span>
                  {comp.catalogItemId && (
                    <button className="btn-icon" onClick={() => removeComponent(idx)} title="Quitar">
                      &times;
                    </button>
                  )}
                </div>
                <div className="slot-body">
                  <div className="form-group flex-2" style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Buscar MP/PT/MZR..."
                      value={comp.nombre || ""}
                      onChange={(e) => {
                        updateComponent(idx, "nombre", e.target.value);
                        setShowDropdown(idx);
                      }}
                      onFocus={() => setShowDropdown(idx)}
                    />
                    {showDropdown === idx && (
                      <div className="search-dropdown visible">
                        {catalogItems
                          .filter((p: any) => {
                            const term = comp.nombre.toLowerCase();
                            return !term || `${p.internalId} ${p.nombre}`.toLowerCase().includes(term);
                          })
                          .slice(0, 10)
                          .map((p: any) => (
                            <div key={p._id} className="dropdown-item" onClick={() => selectItem(idx, p)}>
                              <span className="dropdown-cod">{p.internalId}</span>
                              <span className="dropdown-name">{p.nombre}</span>
                              <span className="badge badge-sm">{p.clase}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  <div className="form-group form-group-sm">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="kg"
                      min="0"
                      max="1000"
                      step="0.01"
                      value={comp.cantidadKg || ""}
                      onChange={(e) => updateComponent(idx, "cantidadKg", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-secondary btn-full" onClick={addComponent}>
              + Agregar componente
            </button>
          </div>
        </div>

        <div className="results-column">
          <div className="card">
            <div className="card-title">Grado Final Calculado</div>

            <div className="npk-cards">
              {(["N", "P", "K"] as NutrientKey[]).map((key) => {
                const val = computed[key];
                const decl = declarados[key];
                const detail = evalResult.details.find((d) => d.nutrient === key);
                const statusClass = detail ? STATUS_CLASSES[detail.status === "C" ? "CUMPLE" : detail.status === "SUP" ? "CUMPLE_S" : detail.status === "NC" ? "NO_CUMPLE" : "SIN_OBJETIVO"] ?? "" : "";
                return (
                  <div key={key} className={`npk-card ${statusClass}`} style={{ "--accent": key === "N" ? "#34d399" : key === "P" ? "#f59e0b" : "#3b82f6" } as any}>
                    <div className="npk-label">{NUTRIENT_LABELS[key]}</div>
                    <div className="npk-value">{fmtGrade(val)}</div>
                    {decl > 0 && detail && (
                      <div className="npk-target">
                        Obj: {fmtGrade(decl)} &middot; {detail.status === "C" ? "\u2705" : detail.status === "SUP" ? "\u26a0\ufe0f" : "\u274c"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={`general-status ${STATUS_CLASSES[evalResult.generalStatus]}`}>
              <span className="general-label">Estado General</span>
              <span className="general-value">{STATUS_LABELS[evalResult.generalStatus] ?? evalResult.generalStatus}</span>
            </div>

            <h4 className="section-title">Composici\u00f3n Completa</h4>
            <div className="table-wrapper">
              <table className="data-table results-table">
                <thead>
                  <tr>
                    <th>Nutriente</th>
                    <th className="num-col">Calculado</th>
                    {targetProduct && (
                      <>
                        <th className="num-col">Declarado</th>
                        <th className="num-col">Tolerancia</th>
                        <th>Estado</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {evalResult.details
                    .filter((d) => d.calculado > 0 || d.declarado > 0)
                    .map((d) => (
                      <tr key={d.nutrient} className={d.informativo ? "informativo" : ""}>
                        <td className="nutrient-name">
                          {NUTRIENT_LABELS[d.nutrient]}
                          {d.informativo && <span className="badge-info">info</span>}
                        </td>
                        <td className="num-col">{fmtGrade(d.calculado)}</td>
                        {targetProduct && (
                          <>
                            <td className="num-col">{fmtGrade(d.declarado)}</td>
                            <td className="num-col">&plusmn;{fmtGrade(d.tolerancia)}</td>
                            <td>
                              <span className={`status-badge ${d.status === "C" ? "status-c" : d.status === "NC" ? "status-nc" : "status-sup"}`}>
                                {d.status === "C" ? "\u2705 C" : d.status === "NC" ? "\u274c NC" : "\u26a0\ufe0f SUP"}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {lists.length > 0 && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <div className="card-title">Listas Existentes</div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>C\u00f3digo</th>
                  <th>Producto</th>
                  <th>Componentes</th>
                  <th>Total kg</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lists.slice(0, 20).map((list: any) => (
                  <tr key={list._id}>
                    <td className="code-cell">{list.displayCode}</td>
                    <td>{list.targetProductSnapshot?.nombre ?? "\u2014"}</td>
                    <td>{list.components.length}</td>
                    <td className="num-col">{list.totalKg}</td>
                    <td>
                      <span className={`status-badge ${STATUS_CLASSES[list.generalStatus] ?? ""}`}>
                        {list.generalStatus}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => loadList(list)}>
                        Cargar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div
        style={{ position: "fixed", inset: 0, display: showDropdown !== null && showDropdown >= 0 ? "block" : "none", zIndex: 0 }}
        onClick={() => setShowDropdown(null)}
      />
    </div>
  );
}