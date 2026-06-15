import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "../hooks/useConvex.ts";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { UserContext } from "../App.tsx";
import { 
  calculateCompositionAndEvaluation, 
  ComponentInput, 
  Nutrients, 
  NUTRIENT_KEYS 
} from "../../convex/calculations.ts";
import { NUTRIENTS_METADATA } from "./CatalogView.tsx";

interface FormulationViewProps {
  user: UserContext;
  editingListId: string | null;
  cloningSnapshotId: string | null;
  viewingSnapshotId: string | null;
  onBackToHistory: () => void;
}

interface FormulationSlot {
  catalogItemId: string; // Id<"catalogItems">
  internalId: string;
  producto: string;
  quantity: number; // in kg (max 2 decimals)
  nutrients: Nutrients;
  lotes?: string;
}

export default function FormulationView({
  user,
  editingListId,
  cloningSnapshotId,
  viewingSnapshotId,
  onBackToHistory,
}: FormulationViewProps) {
  const catalog = useQuery(api.catalog.getItems) || [];
  
  // Queries for existing list or snapshot
  const editingList = useQuery(
    api.lists.getList, 
    editingListId ? { id: editingListId as Id<"productLists"> } : "skip"
  );
  const cloningSnapshot = useQuery(
    api.lists.getSnapshot,
    cloningSnapshotId ? { id: cloningSnapshotId as Id<"productListSnapshots"> } : "skip"
  );
  const viewingSnapshot = useQuery(
    api.lists.getSnapshot,
    viewingSnapshotId ? { id: viewingSnapshotId as Id<"productListSnapshots"> } : "skip"
  );

  const saveList = useMutation(api.lists.saveList);

  // Core formulation state
  const [listName, setListName] = useState("Nueva Fórmula");
  const [targetProduct, setTargetProduct] = useState<any | null>(null);
  const [slots, setSlots] = useState<FormulationSlot[]>([]);
  const [totalProd, setTotalProd] = useState<number>(1000); // output production batch size (total kg is always 1000 in formulation)

  // PT dropdown search states
  const [ptSearchQuery, setPtSearchQuery] = useState("");
  const [ptDropdownOpen, setPtDropdownOpen] = useState(false);

  // Substitution Modal States
  const [substitutionModalOpen, setSubstitutionModalOpen] = useState(false);
  const [subslotIndex, setSubslotIndex] = useState<number | null>(null);
  const [subPrioritizedNutrient, setSubPrioritizedNutrient] = useState<"N" | "P" | "K">("N");

  // Save states
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [displayCode, setDisplayCode] = useState("");
  const [saveVersion, setSaveVersion] = useState<number | null>(null);

  const isViewOnly = viewingSnapshotId !== null;
  const listLoadedRef = useRef(false);

  // Filter items in catalog by class
  const ptOptions = catalog.filter(item => item.class === "PT");
  const componentOptions = catalog; // MP, PT and MZR can all be components

  // Filtered PT options for dropdown
  const filteredPtOptions = ptOptions.filter(pt => 
    `${pt.producto} ${pt.internalId} ${pt.externalCode}`.toLowerCase()
    .includes(ptSearchQuery.toLowerCase())
  );

  // ── LOAD INITIAL STATE ──────────────────────────────────
  useEffect(() => {
    if (editingListId && editingList && !listLoadedRef.current) {
      setListName(editingList.name);
      setDisplayCode(editingList.displayCode);
      if (editingList.targetProductId) {
        const pt = catalog.find(item => item._id === editingList.targetProductId);
        if (pt) {
          setTargetProduct(pt);
          setPtSearchQuery(pt.producto);
        }
      }
      
      const loadedSlots: FormulationSlot[] = editingList.resolvedComponents.map(c => ({
        catalogItemId: c.catalogItemId,
        internalId: c.internalId,
        producto: c.producto,
        quantity: c.quantity,
        nutrients: c.nutrients,
      }));
      setSlots(loadedSlots);
      listLoadedRef.current = true;
    }
  }, [editingList, catalog, editingListId]);

  useEffect(() => {
    if (cloningSnapshotId && cloningSnapshot && !listLoadedRef.current) {
      setListName(`Clon de ${cloningSnapshot.components[0]?.producto || "Snapshot"}`);
      if (cloningSnapshot.targetProductId) {
        const pt = catalog.find(item => item._id === cloningSnapshot.targetProductId);
        if (pt) {
          setTargetProduct(pt);
          setPtSearchQuery(pt.producto);
        }
      }
      
      // Load frozen components
      const loadedSlots: FormulationSlot[] = cloningSnapshot.components.map(c => ({
        catalogItemId: c.catalogItemId,
        internalId: c.internalId,
        producto: c.producto,
        quantity: c.quantity,
        nutrients: c.nutrients,
      }));
      setSlots(loadedSlots);
      listLoadedRef.current = true;
    }
  }, [cloningSnapshot, catalog, cloningSnapshotId]);

  useEffect(() => {
    if (viewingSnapshotId && viewingSnapshot && !listLoadedRef.current) {
      setListName(`Vista Snapshot v${viewingSnapshot.snapshotVersion}`);
      setDisplayCode(`SNAPSHOT-V${viewingSnapshot.snapshotVersion}`);
      if (viewingSnapshot.targetProductId) {
        const pt = catalog.find(item => item._id === viewingSnapshot.targetProductId);
        if (pt) {
          setTargetProduct(pt);
          setPtSearchQuery(pt.producto);
        }
      }
      
      // Load frozen components
      const loadedSlots: FormulationSlot[] = viewingSnapshot.components.map(c => ({
        catalogItemId: c.catalogItemId,
        internalId: c.internalId,
        producto: c.producto,
        quantity: c.quantity,
        nutrients: c.nutrients,
      }));
      setSlots(loadedSlots);
      listLoadedRef.current = true;
    }
  }, [viewingSnapshot, catalog, viewingSnapshotId]);

  // If creating new, initialize with empty slots if not already loaded
  useEffect(() => {
    if (!editingListId && !cloningSnapshotId && !viewingSnapshotId && slots.length === 0) {
      setSlots([
        { catalogItemId: "", internalId: "", producto: "", quantity: 0, nutrients: createEmptyNutrients() }
      ]);
      setListName("Nueva Fórmula");
      setDisplayCode("");
      listLoadedRef.current = true;
    }
  }, [editingListId, cloningSnapshotId, viewingSnapshotId]);

  // ── MATHEMATICAL COMPUTATIONS ─────────────────────────────
  // Convert formulation slots into calculation inputs
  const calculationInputs: ComponentInput[] = slots
    .filter(s => s.catalogItemId !== "")
    .map(s => ({
      internalId: s.internalId,
      producto: s.producto,
      quantity: s.quantity,
      nutrients: s.nutrients,
    }));

  const targetNutrients = targetProduct ? targetProduct.nutrients : null;
  const result = calculateCompositionAndEvaluation(calculationInputs, targetNutrients);

  // ── DEBOUNCED AUTOSAVE EFFECT ─────────────────────────────
  useEffect(() => {
    if (isViewOnly || slots.length === 0 || !listLoadedRef.current) return;
    
    // Skip autosave if we don't have valid components yet
    const validComponents = slots.filter(s => s.catalogItemId !== "");
    if (validComponents.length === 0) return;

    setSaveStatus("saving");
    const debounceSave = setTimeout(async () => {
      try {
        const saveArgs = {
          id: editingListId ? (editingListId as Id<"productLists">) : undefined,
          targetProductId: targetProduct ? (targetProduct._id as Id<"catalogItems">) : null,
          name: listName,
          components: validComponents.map(s => ({
            catalogItemId: s.catalogItemId as Id<"catalogItems">,
            quantity: s.quantity,
          })),
          actor: user.name,
          role: user.role,
        };

        const res = await saveList(saveArgs);
        setSaveStatus("saved");
        setDisplayCode(res.displayCode);
        setSaveVersion(res.version);
      } catch (e: any) {
        setSaveStatus("error");
        setSaveError(e.message);
      }
    }, 2500);

    return () => clearTimeout(debounceSave);
  }, [slots, listName, targetProduct]);

  // ── MANUAL SAVE TRIGGER ─────────────────────────────────
  const handleManualSave = async () => {
    const validComponents = slots.filter(s => s.catalogItemId !== "");
    if (validComponents.length === 0) {
      alert("Por favor agregue al menos un ingrediente válido.");
      return;
    }

    setSaveStatus("saving");
    try {
      const saveArgs = {
        id: editingListId ? (editingListId as Id<"productLists">) : undefined,
        targetProductId: targetProduct ? (targetProduct._id as Id<"catalogItems">) : null,
        name: listName,
        components: validComponents.map(s => ({
          catalogItemId: s.catalogItemId as Id<"catalogItems">,
          quantity: s.quantity,
        })),
        actor: user.name,
        role: user.role,
      };

      const res = await saveList(saveArgs);
      setSaveStatus("saved");
      setDisplayCode(res.displayCode);
      setSaveVersion(res.version);
      alert(`Fórmula guardada con éxito como ${res.displayCode} (v${res.version})`);
    } catch (e: any) {
      setSaveStatus("error");
      setSaveError(e.message);
      alert("Error al guardar: " + e.message);
    }
  };

  // ── ACTIONS ──────────────────────────────────────────────
  const handleAddSlot = () => {
    if (isViewOnly) return;
    setSlots(prev => [
      ...prev,
      { catalogItemId: "", internalId: "", producto: "", quantity: 0, nutrients: createEmptyNutrients() }
    ]);
  };

  const handleRemoveSlot = (index: number) => {
    if (isViewOnly) return;
    setSlots(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSlotChange = (index: number, itemId: string) => {
    if (isViewOnly) return;
    const item = catalog.find(i => i._id === itemId);
    if (!item) return;

    setSlots(prev => {
      const copy = [...prev];
      copy[index] = {
        catalogItemId: item._id,
        internalId: item.internalId,
        producto: item.producto,
        quantity: copy[index].quantity,
        nutrients: item.nutrients,
      };
      return copy;
    });
  };

  const handleQuantityChange = (index: number, quantityStr: string) => {
    if (isViewOnly) return;
    // Limit to 2 decimals
    let val = parseFloat(quantityStr);
    if (isNaN(val)) val = 0;
    
    setSlots(prev => {
      const copy = [...prev];
      copy[index].quantity = Math.round(val * 100) / 100;
      return copy;
    });
  };

  const handleSelectPT = (pt: any) => {
    setTargetProduct(pt);
    setPtSearchQuery(pt.producto);
    setPtDropdownOpen(false);
  };

  const handleClearPT = () => {
    setTargetProduct(null);
    setPtSearchQuery("");
  };

  const handleLimpiar = () => {
    if (isViewOnly) return;
    if (confirm("¿Está seguro de reiniciar el formulador?")) {
      setSlots([
        { catalogItemId: "", internalId: "", producto: "", quantity: 0, nutrients: createEmptyNutrients() }
      ]);
      setTargetProduct(null);
      setPtSearchQuery("");
      setListName("Nueva Fórmula");
      setDisplayCode("");
      setSaveVersion(null);
      setSaveStatus("idle");
    }
  };

  // ── SUBSTITUTION LOGIC ──────────────────────────────────
  const handleOpenSubstitution = (index: number) => {
    setSubslotIndex(index);
    setSubPrioritizedNutrient("N");
    setSubstitutionModalOpen(true);
  };

  // Compute recommendations for substitution
  const getSubSuggestions = () => {
    if (subslotIndex === null || !slots[subslotIndex]) return [];
    const sourceSlot = slots[subslotIndex];

    // Filter candidate substitution items from catalog: e.g. class = MZR (or PT if suitable)
    // The plan: "Sustitucion de MP por MZR con criterio nutricional"
    const candidates = catalog.filter(item => 
      item.class === "MZR" && item._id !== sourceSlot.catalogItemId
    );

    // Calculate Euclidean distance and sort
    const mapped = candidates.map(item => {
      const diffN = item.nutrients.N - sourceSlot.nutrients.N;
      const diffP = item.nutrients.P - sourceSlot.nutrients.P;
      const diffK = item.nutrients.K - sourceSlot.nutrients.K;
      
      const distance = Math.sqrt(diffN * diffN + diffP * diffP + diffK * diffK);
      const prioDiff = Math.abs(item.nutrients[subPrioritizedNutrient] - sourceSlot.nutrients[subPrioritizedNutrient]);

      // Suggestion weights
      // Option 1: 1:1 weight substitution (same kg)
      const wt1 = sourceSlot.quantity;

      // Option 2: Equi-nutrient suggestion: Y = (quantity_original * conc_nut_orig) / conc_nut_mzr
      const origConc = sourceSlot.nutrients[subPrioritizedNutrient];
      const mzrConc = item.nutrients[subPrioritizedNutrient];
      
      let wt2 = 0;
      let wt2Warning = "";
      if (mzrConc > 0) {
        wt2 = (sourceSlot.quantity * origConc) / mzrConc;
        wt2 = Math.round(wt2 * 100) / 100;
        if (wt2 > 1000) {
          wt2Warning = "Excede el límite total de la formulación (1000 kg).";
        }
      }

      return {
        item,
        distance,
        prioDiff,
        wt1,
        wt2,
        wt2Warning,
      };
    });

    // Sort order: prioritize prioritized nutrient difference first, then Euclidean distance
    return mapped.sort((a, b) => {
      if (Math.abs(a.prioDiff - b.prioDiff) > 0.001) {
        return a.prioDiff - b.prioDiff;
      }
      return a.distance - b.distance;
    });
  };

  const handleApplySubstitution = (candidate: any, useNutrientEquivalent: boolean) => {
    if (subslotIndex === null || !slots[subslotIndex]) return;
    const qty = useNutrientEquivalent ? candidate.wt2 : candidate.wt1;

    setSlots(prev => {
      const copy = [...prev];
      copy[subslotIndex] = {
        catalogItemId: candidate.item._id,
        internalId: candidate.item.internalId,
        producto: candidate.item.producto,
        quantity: qty,
        nutrients: candidate.item.nutrients,
      };
      return copy;
    });

    setSubstitutionModalOpen(false);
    setSubslotIndex(null);
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-header-left">
          <h2 className="view-title">
            {isViewOnly ? "Consulta de Snapshot" : editingListId ? "Editar Fórmula" : "Formulador de Mezclas"}
          </h2>
          <span className="badge">
            {isViewOnly ? `HISTÓRICO: ${displayCode}` : displayCode ? `VIVO: ${displayCode} (v${saveVersion || 1})` : "NUEVA"}
          </span>
        </div>
        <div className="view-header-right">
          {isViewOnly && (
            <button className="btn btn-secondary" onClick={onBackToHistory}>
              Volver al Historial
            </button>
          )}
          {!isViewOnly && (
            <>
              <button className="btn btn-secondary" onClick={handleLimpiar}>
                Limpiar
              </button>
              <button className="btn btn-primary" onClick={handleManualSave}>
                Guardar Fórmula
              </button>
            </>
          )}
        </div>
      </div>

      {/* Persistence Save State Indicator */}
      {!isViewOnly && (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 8px 8px 8px", fontSize: "var(--fs-xs)", gap: "8px" }}>
          {saveStatus === "saving" && <span style={{ color: "var(--amber-400)" }}>⚙️ Guardando versión...</span>}
          {saveStatus === "saved" && <span style={{ color: "var(--green-400)" }}>✓ Fórmula autoguardada</span>}
          {saveStatus === "error" && <span style={{ color: "var(--red-400)" }} title={saveError}>✕ Error de autoguardado: {saveError.slice(0, 50)}</span>}
        </div>
      )}

      {/* Weight alert */}
      {result.alerts.map((alert, idx) => (
        <div key={idx} className="card" style={{ borderLeft: "4px solid var(--amber-500)", background: "var(--amber-muted)", padding: "10px 16px", marginBottom: "16px" }}>
          <span style={{ color: "var(--amber-400)", fontWeight: 600 }}>⚠️ Advertencia de formulación:</span> {alert}
        </div>
      ))}

      <div className="formulador-layout" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>
        {/* LEFT COLUMN: Workspace and Slots */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Target details card */}
          <div className="card">
            <div className="card-title">Fórmula y Producto Objetivo</div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label className="form-label">Nombre de la lista/receta</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={listName} 
                  onChange={e => setListName(e.target.value)} 
                  disabled={isViewOnly}
                />
              </div>

              <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
                <label className="form-label">Producto Objetivo (PT)</label>
                {targetProduct ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-elevated)", padding: "6px 12px", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-mono)" }}>{targetProduct.internalId}</span>
                    <span style={{ fontWeight: 600, flex: 1 }}>{targetProduct.producto}</span>
                    {!isViewOnly && (
                      <button className="btn-icon" onClick={handleClearPT} style={{ color: "var(--red-400)" }}>✕</button>
                    )}
                  </div>
                ) : (
                  <>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Buscar PT objetivo para verificar tolerancias..."
                      value={ptSearchQuery}
                      onChange={e => { setPtSearchQuery(e.target.value); setPtDropdownOpen(true); }}
                      onFocus={() => setPtDropdownOpen(true)}
                      disabled={isViewOnly}
                    />
                    {ptDropdownOpen && filteredPtOptions.length > 0 && (
                      <div className="search-dropdown" style={{ display: "block", position: "absolute", zIndex: 100, width: "100%", maxHeight: "200px", overflowY: "auto" }}>
                        {filteredPtOptions.map(pt => (
                          <div key={pt._id} className="search-dropdown__item" onClick={() => handleSelectPT(pt)}>
                            <strong>{pt.internalId}</strong> — {pt.producto}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Slots card */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div className="card-title" style={{ margin: 0 }}>Componentes de la mezcla</div>
              {!isViewOnly && (
                <button className="btn btn-secondary" style={{ padding: "4px 12px", fontSize: "var(--fs-xs)" }} onClick={handleAddSlot}>
                  + Agregar ingrediente
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {slots.map((slot, index) => (
                <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "8px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg-surface)" }}>
                  
                  {/* Selector */}
                  <div style={{ flex: 2, minWidth: "150px" }}>
                    <select
                      className="form-select"
                      value={slot.catalogItemId}
                      onChange={e => handleSlotChange(index, e.target.value)}
                      disabled={isViewOnly}
                      style={{ width: "100%" }}
                    >
                      <option value="">-- Seleccione un insumo/MZR --</option>
                      {componentOptions.map(opt => (
                        <option key={opt._id} value={opt._id}>
                          [{opt.internalId}] {opt.producto} ({opt.class})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity input */}
                  <div style={{ width: "120px" }}>
                    <div style={{ position: "relative" }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1000"
                        className="form-input"
                        style={{ textAlign: "right", paddingRight: "28px" }}
                        value={slot.quantity || ""}
                        placeholder="0.00"
                        onChange={e => handleQuantityChange(index, e.target.value)}
                        disabled={isViewOnly}
                      />
                      <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "var(--fs-2xs)", color: "var(--text-tertiary)" }}>kg</span>
                    </div>
                  </div>

                  {/* Substitution trigger button */}
                  {slot.catalogItemId !== "" && !isViewOnly && (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "4px 8px", fontSize: "var(--fs-2xs)", backgroundColor: "rgba(52, 211, 153, 0.08)", color: "var(--green-400)", border: "1px solid rgba(52, 211, 153, 0.2)" }}
                      title="Sustituir por mezcla física (MZR)"
                      onClick={() => handleOpenSubstitution(index)}
                    >
                      🔄 Sustituir
                    </button>
                  )}

                  {/* Remove button */}
                  {!isViewOnly && slots.length > 1 && (
                    <button 
                      className="btn-icon" 
                      style={{ color: "var(--red-400)", padding: "4px" }} 
                      onClick={() => handleRemoveSlot(index)}
                      title="Eliminar ranura"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Grade summary and check tolerances */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* General status card */}
          <div className="card" style={{ textAlign: "center", padding: "24px" }}>
            <span style={{ fontSize: "var(--fs-2xs)", textTransform: "uppercase", color: "var(--text-secondary)" }}>
              Estado de la mezcla
            </span>
            <div style={{ 
              fontSize: "var(--fs-xl)", 
              fontWeight: 800, 
              margin: "8px 0",
              color: result.evaluation.status === "CUMPLE" ? "var(--green-400)"
                : result.evaluation.status === "CUMPLE_S" ? "var(--amber-400)"
                : result.evaluation.status === "NO_CUMPLE" ? "var(--red-400)"
                : "var(--text-secondary)"
            }}>
              {result.evaluation.status === "CUMPLE" ? "✓ CONFORME (CUMPLE)"
                : result.evaluation.status === "CUMPLE_S" ? "⚠ SUPERA TOLERANCIA"
                : result.evaluation.status === "NO_CUMPLE" ? "✕ NO CONFORME"
                : "SIN OBJETIVO"}
            </div>
            <p style={{ fontSize: "var(--fs-2xs)", color: "var(--text-tertiary)", margin: 0 }}>
              Evaluado contra grado ICA del PT objetivo
            </p>
          </div>

          {/* Grade check card */}
          <div className="card">
            <div className="card-title">Grado Resultante NPK</div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["N", "P", "K", "CaO", "MgO", "S"].map(key => {
                const nutKey = key as any;
                const calcVal = result.calculatedComposition[nutKey] || 0;
                const declVal = targetNutrients ? (targetNutrients[nutKey] || 0) : 0;
                const ev = result.evaluation.evaluations[nutKey];
                
                return (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                    <div>
                      <strong style={{ fontSize: "var(--fs-sm)" }}>{key}</strong>
                      {declVal > 0 && (
                        <div style={{ fontSize: "var(--fs-2xs)", color: "var(--text-tertiary)" }}>
                          Obj: {declVal.toFixed(2)}% | Tol: [{ev.min.toFixed(2)}% - {ev.max.toFixed(2)}%]
                        </div>
                      )}
                    </div>
                    
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 700, marginRight: "8px", fontSize: "var(--fs-sm)" }}>
                        {calcVal.toFixed(2)}%
                      </span>
                      {declVal > 0 && (
                        <span className={`badge ${
                          ev.status === "C" ? "badge-mp"
                            : ev.status === "SUP" ? "badge-pt"
                            : "badge-pt" // custom error
                        }`} style={{ 
                          backgroundColor: ev.status === "C" ? "var(--green-950)"
                            : ev.status === "SUP" ? "var(--green-900)" // or dark amber
                            : "var(--red-muted)",
                          color: ev.status === "C" ? "var(--green-400)"
                            : ev.status === "SUP" ? "var(--amber-400)"
                            : "var(--red-400)",
                          borderColor: "transparent"
                        }}>
                          {ev.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SUBSTITUTION SUGGESTIONS MODAL */}
      {substitutionModalOpen && subslotIndex !== null && slots[subslotIndex] && (
        <div className="modal-overlay visible" style={{ zIndex: 1200 }}>
          <div className="modal-content" style={{ maxWidth: "800px" }}>
            <div className="modal-header">
              <h3>Sustituir {slots[subslotIndex].producto} ({slots[subslotIndex].quantity} kg)</h3>
              <button className="btn-icon modal-close" onClick={() => { setSubstitutionModalOpen(false); setSubslotIndex(null); }}>✕</button>
            </div>
            
            <div className="modal-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span>Seleccione el nutriente a priorizar en la sustitución:</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["N", "P", "K"].map((nut) => (
                    <button
                      key={nut}
                      className={`btn ${subPrioritizedNutrient === nut ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "4px 12px", fontSize: "var(--fs-xs)" }}
                      onClick={() => setSubPrioritizedNutrient(nut as any)}
                    >
                      {nut}
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-wrapper" style={{ maxHeight: "350px", overflowY: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Mezcla Física (MZR)</th>
                      <th>Grado NPK</th>
                      <th>Dist. General</th>
                      <th>Aporte {subPrioritizedNutrient} Equiv</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSubSuggestions().map((sug, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)" }}>{sug.item.internalId}</td>
                        <td className="product-name">{sug.item.producto}</td>
                        <td>
                          N:{sug.item.nutrients.N.toFixed(1)} P:{sug.item.nutrients.P.toFixed(1)} K:{sug.item.nutrients.K.toFixed(1)}
                        </td>
                        <td style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
                          {sug.distance.toFixed(2)}
                        </td>
                        <td>
                          {sug.wt2 > 0 ? (
                            <div>
                              <strong>{sug.wt2.toFixed(1)} kg</strong>
                              {sug.wt2Warning && <div style={{ fontSize: "var(--sp-2)", color: "var(--red-400)" }}>{sug.wt2Warning}</div>}
                            </div>
                          ) : (
                            <span style={{ color: "var(--text-tertiary)" }}>No aporta</span>
                          )}
                        </td>
                        <td style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btn-secondary" style={{ padding: "2px 8px", fontSize: "var(--fs-2xs)" }} onClick={() => handleApplySubstitution(sug, false)}>
                            Usar 1:1 ({sug.wt1} kg)
                          </button>
                          {sug.wt2 > 0 && !sug.wt2Warning && (
                            <button className="btn btn-primary" style={{ padding: "2px 8px", fontSize: "var(--fs-2xs)" }} onClick={() => handleApplySubstitution(sug, true)}>
                              Usar Equiv ({sug.wt2} kg)
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function createEmptyNutrients(): Nutrients {
  const nutrients = {} as Nutrients;
  for (const k of NUTRIENT_KEYS) {
    nutrients[k] = 0;
  }
  return nutrients;
}
