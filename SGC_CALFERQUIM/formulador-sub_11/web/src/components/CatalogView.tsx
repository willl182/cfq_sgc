import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "../hooks/useConvex.ts";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { UserContext } from "../App.tsx";

// Define 20 nutrients names & labels
export const NUTRIENTS_METADATA = [
  { key: "C", label: "C orgánico" },
  { key: "N", label: "Nitrógeno Total (N)" },
  { key: "N_NH4", label: "N Amoniacal (N-NH4)" },
  { key: "N_NO3", label: "N Nítrico (N-NO3)" },
  { key: "N_org", label: "N Orgánico (N-org)" },
  { key: "N_ur", label: "N Ureico (N-ur)" },
  { key: "P", label: "Fósforo (P2O5)" },
  { key: "K", label: "Potasio (K2O)" },
  { key: "CaO", label: "Calcio (CaO)" },
  { key: "MgO", label: "Magnesio (MgO)" },
  { key: "S", label: "Azufre (S)" },
  { key: "B", label: "Boro (B)" },
  { key: "Co", label: "Cobalto (Co)" },
  { key: "Cu", label: "Cobre (Cu)" },
  { key: "Fe", label: "Hierro (Fe)" },
  { key: "Mn", label: "Manganeso (Mn)" },
  { key: "Mo", label: "Molibdeno (Mo)" },
  { key: "SiO2", label: "Silicio (SiO2)" },
  { key: "Zn", label: "Zinc (Zn)" },
  { key: "Na", label: "Sodio (Na)" },
] as const;

interface CatalogViewProps {
  user: UserContext;
}

export default function CatalogView({ user }: CatalogViewProps) {
  const catalog = useQuery(api.catalog.getItems, { includeArchived: true });
  const changeLogs = useQuery(api.catalog.getHistory, { limit: 15 });

  const seed = useMutation(api.catalog.seedCatalog);
  const updateItem = useMutation(api.catalog.updateItem);
  const archiveItem = useMutation(api.catalog.archiveItem);
  const deleteItem = useMutation(api.catalog.deleteItem);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // Seeding states
  const [seeding, setSeeding] = useState(false);
  const [seedReport, setSeedReport] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Edit / Save states
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState<any | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveErrorMsg, setSaveErrorMsg] = useState("");
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Archive warning states
  const [archiveWarning, setArchiveWarning] = useState<string | null>(null);
  const [itemToArchive, setItemToArchive] = useState<any | null>(null);

  const activeCatalog = catalog?.filter(item => item.archivedAt === null) || [];
  const archivedCatalog = catalog?.filter(item => item.archivedAt !== null) || [];

  const filteredItems = activeCatalog.filter(item => {
    if (filterClass && item.class !== filterClass) return false;
    if (filterTipo && item.tipo !== filterTipo) return false;
    if (searchTerm) {
      const match = `${item.producto} ${item.internalId} ${item.externalCode} ${item.provider || ""}`.toLowerCase();
      if (!match.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  const handleSeed = async () => {
    setSeeding(true);
    setErrorMsg("");
    setSeedReport(null);
    try {
      const response = await fetch("/mp-pt_mzr.csv");
      if (!response.ok) {
        throw new Error("No se pudo descargar el archivo mp-pt_mzr.csv de la carpeta pública.");
      }
      const csvText = await response.text();
      const report = await seed({ csvText });
      setSeedReport(report);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleSelectRow = (item: any) => {
    setSelectedItem(item);
    setIsEditing(false);
    setSaveStatus("idle");
    setSaveErrorMsg("");
  };

  const handleStartEdit = () => {
    setEditFields({
      producto: selectedItem.producto,
      tipo: selectedItem.tipo,
      provider: selectedItem.provider || "",
      nutrients: { ...selectedItem.nutrients },
    });
    setIsEditing(true);
    setSaveStatus("idle");
  };

  // Debounced Autosave Effect
  useEffect(() => {
    if (!isEditing || !editFields || !selectedItem) return;

    setSaveStatus("saving");
    const delayDebounceFn = setTimeout(async () => {
      try {
        const result = await updateItem({
          id: selectedItem._id,
          producto: editFields.producto,
          tipo: editFields.tipo,
          provider: editFields.provider,
          nutrients: editFields.nutrients,
          actor: user.name,
          role: user.role,
          reason: "Modificación de nutrientes desde catálogo",
        });
        if (result) {
          setSelectedItem(result);
          setSaveStatus("saved");
        }
      } catch (e: any) {
        setSaveStatus("error");
        setSaveErrorMsg(e.message);
      }
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [editFields]);

  const handleNutrientChange = (nutKey: string, valueStr: string) => {
    let num = parseFloat(valueStr);
    if (isNaN(num)) num = 0;
    
    setEditFields((prev: any) => ({
      ...prev,
      nutrients: {
        ...prev.nutrients,
        [nutKey]: num,
      }
    }));
  };

  const handleMetaChange = (field: string, val: string) => {
    setEditFields((prev: any) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleConfirmArchive = async (item: any) => {
    setItemToArchive(item);
    setArchiveWarning(null);
    try {
      const res = await archiveItem({
        id: item._id,
        actor: user.name,
        role: user.role,
        reason: "Desactivación del producto",
      });
      if (res.warning) {
        setArchiveWarning(res.warning);
      } else {
        setSelectedItem(null);
        setItemToArchive(null);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleForceArchive = async () => {
    if (itemToArchive) {
      setSelectedItem(null);
      setArchiveWarning(null);
      setItemToArchive(null);
    }
  };

  const handleDelete = async (id: Id<"catalogItems">) => {
    if (confirm("¿Está seguro de eliminar físicamente este producto? Esta acción no se puede deshacer y eliminará toda su trazabilidad.")) {
      try {
        await deleteItem({ id, role: user.role });
        setSelectedItem(null);
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  if (catalog === undefined) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px", color: "var(--text-secondary)" }}>
        Cargando catálogo...
      </div>
    );
  }

  return (
    <div>
      <div className="view-header">
        <div className="view-header-left">
          <h2 className="view-title">Catálogo de Insumos</h2>
          <span className="badge">{activeCatalog.length} activos / {archivedCatalog.length} archivados</span>
        </div>
        <div className="view-header-right">
          <button className="btn btn-secondary" onClick={() => setHistoryModalOpen(true)}>
            Historial de cambios
          </button>
          {user.role === "admin" && catalog.length === 0 && (
            <button className="btn btn-primary" onClick={handleSeed} disabled={seeding}>
              {seeding ? "Importando base..." : "Inicializar Catálogo (CSV)"}
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="card" style={{ borderLeft: "4px solid var(--red-500)", marginBottom: "16px", background: "var(--red-muted)" }}>
          <h4 style={{ color: "var(--red-400)", margin: 0 }}>Error de importación</h4>
          <p style={{ margin: "4px 0 0 0", fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>{errorMsg}</p>
        </div>
      )}

      {seedReport && (
        <div className="card" style={{ borderLeft: "4px solid var(--green-400)", marginBottom: "16px", background: "var(--green-muted)" }}>
          <h4 style={{ color: "var(--green-400)", margin: 0 }}>Importación completada</h4>
          <p style={{ margin: "4px 0", fontSize: "var(--fs-sm)" }}>
            Leídos: <strong>{seedReport.readCount}</strong> | Insertados: <strong>{seedReport.insertedCount}</strong> | Rechazados: <strong>{seedReport.rejectedCount}</strong>
          </p>
          {seedReport.rejectedCount > 0 && (
            <details style={{ marginTop: "8px", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
              <summary style={{ cursor: "pointer", color: "var(--amber-400)" }}>Ver filas rechazadas</summary>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "16px" }}>
                {seedReport.rejectedRows.map((r: any, idx: number) => (
                  <li key={idx}>Fila {r.row} {r.name ? `(${r.name})` : ""}: {r.reason}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {catalog.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>Catálogo vacío</h3>
          {user.role === "admin" ? (
            <p>Use el botón "Inicializar Catálogo" para precargar los insumos desde el archivo CSV de referencia.</p>
          ) : (
            <p>Pídale al Administrador Local que inicialice el catálogo para comenzar.</p>
          )}
        </div>
      ) : (
        <>
          <div className="filters-bar">
            <div className="search-wrapper">
              <input 
                type="text" 
                className="form-input search-input" 
                placeholder="Buscar por nombre, código o proveedor..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="form-select" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
              <option value="">Todas las clases</option>
              <option value="MP">MP — Materia Prima</option>
              <option value="PT">PT — Producto Terminado</option>
              <option value="MZR">MZR — Mezcla de Referencia</option>
            </select>
            <select className="form-select" value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              <option value="G">Granulado (G)</option>
              <option value="P">Polvo (P)</option>
              <option value="L">Líquido (L)</option>
              <option value="C">Cristalino (C)</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Interno</th>
                  <th>COD (CSV)</th>
                  <th>Producto</th>
                  <th>Proveedor</th>
                  <th>Clase</th>
                  <th>Tipo</th>
                  <th className="num-col">N</th>
                  <th className="num-col">P</th>
                  <th className="num-col">K</th>
                  <th className="num-col">CaO</th>
                  <th className="num-col">MgO</th>
                  <th className="num-col">S</th>
                  <th className="num-col">Zn</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item._id} className="table-row-animate" style={{ cursor: "pointer" }} onClick={() => handleSelectRow(item)}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)" }}>{item.internalId}</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{item.externalCode}</td>
                    <td className="product-name">{item.producto}</td>
                    <td>{item.provider || "—"}</td>
                    <td>
                      <span className={`badge badge-${item.class.toLowerCase()}`}>{item.class}</span>
                    </td>
                    <td>{item.tipo}</td>
                    <td className="num-col">{item.nutrients.N > 0 ? item.nutrients.N.toFixed(2) : "—"}</td>
                    <td className="num-col">{item.nutrients.P > 0 ? item.nutrients.P.toFixed(2) : "—"}</td>
                    <td className="num-col">{item.nutrients.K > 0 ? item.nutrients.K.toFixed(2) : "—"}</td>
                    <td className="num-col">{item.nutrients.CaO > 0 ? item.nutrients.CaO.toFixed(2) : "—"}</td>
                    <td className="num-col">{item.nutrients.MgO > 0 ? item.nutrients.MgO.toFixed(2) : "—"}</td>
                    <td className="num-col">{item.nutrients.S > 0 ? item.nutrients.S.toFixed(2) : "—"}</td>
                    <td className="num-col">{item.nutrients.Zn > 0 ? item.nutrients.Zn.toFixed(2) : "—"}</td>
                    <td>
                      <button className="btn-icon" title="Ver detalle" onClick={(e) => { e.stopPropagation(); handleSelectRow(item); }}>👁️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* DETAIL MODAL WITH EDIT OR AUDIT OPTIONS */}
      {selectedItem && (
        <div className="modal-overlay visible">
          <div className="modal-content modal-detail" style={{ maxWidth: "800px" }}>
            <div className="modal-header">
              <div>
                <span className="badge" style={{ verticalAlign: "middle", marginRight: "8px" }}>{selectedItem.internalId}</span>
                <h3 style={{ display: "inline-block", margin: 0 }}>{selectedItem.producto}</h3>
              </div>
              <button className="btn-icon modal-close" onClick={() => setSelectedItem(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              {/* Meta information */}
              <div className="detail-meta" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <span className="detail-label">Nombre</span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ fontSize: "var(--fs-sm)", padding: "4px 8px" }}
                      value={editFields.producto} 
                      onChange={e => handleMetaChange("producto", e.target.value)} 
                    />
                  ) : (
                    <strong>{selectedItem.producto}</strong>
                  )}
                </div>
                <div>
                  <span className="detail-label">Proveedor</span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ fontSize: "var(--fs-sm)", padding: "4px 8px" }}
                      value={editFields.provider} 
                      onChange={e => handleMetaChange("provider", e.target.value)} 
                    />
                  ) : (
                    <strong>{selectedItem.provider || "—"}</strong>
                  )}
                </div>
                <div>
                  <span className="detail-label">Tipo Físico</span>
                  {isEditing ? (
                    <select 
                      className="form-select" 
                      style={{ fontSize: "var(--fs-sm)", padding: "4px 8px" }}
                      value={editFields.tipo} 
                      onChange={e => handleMetaChange("tipo", e.target.value)}
                    >
                      <option value="G">G — Granulado</option>
                      <option value="P">P — Polvo</option>
                      <option value="L">L — Líquido</option>
                      <option value="C">C — Cristalino</option>
                    </select>
                  ) : (
                    <strong>{selectedItem.tipo}</strong>
                  )}
                </div>
                <div>
                  <span className="detail-label">Código CSV</span>
                  <strong>{selectedItem.externalCode}</strong>
                </div>
              </div>

              {/* Status and Actions Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0 }}>Composición Química (%)</h4>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {saveStatus === "saving" && <span style={{ fontSize: "var(--fs-xs)", color: "var(--amber-400)" }}>⚙️ Guardando...</span>}
                  {saveStatus === "saved" && <span style={{ fontSize: "var(--fs-xs)", color: "var(--green-400)" }}>✓ Autoguardado</span>}
                  {saveStatus === "error" && <span style={{ fontSize: "var(--fs-xs)", color: "var(--red-400)" }} title={saveErrorMsg}>✕ Error al guardar</span>}

                  {isEditing ? (
                    <button className="btn btn-secondary" style={{ padding: "4px 12px", fontSize: "var(--fs-xs)" }} onClick={() => setIsEditing(false)}>
                      Cerrar edición
                    </button>
                  ) : (
                    (user.role === "admin" || selectedItem.class === "MP") && (
                      <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: "var(--fs-xs)" }} onClick={handleStartEdit}>
                        Editar nutrientes
                      </button>
                    )
                  )}

                  {user.role === "admin" && (
                    <>
                      <button className="btn btn-secondary" style={{ padding: "4px 12px", fontSize: "var(--fs-xs)", color: "var(--red-400)" }} onClick={() => handleConfirmArchive(selectedItem)}>
                        Archivar
                      </button>
                      <button className="btn btn-secondary" style={{ padding: "4px 12px", fontSize: "var(--fs-xs)", color: "var(--red-500)" }} onClick={() => handleDelete(selectedItem._id)}>
                        Eliminar Físico
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Nutrient Inputs/Display */}
              <div className="nutrient-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
                {NUTRIENTS_METADATA.map(n => {
                  const val = isEditing ? editFields.nutrients[n.key] : selectedItem.nutrients[n.key] || 0;
                  return (
                    <div key={n.key} className={`nutrient-item ${val > 0 ? "has-value" : ""}`} style={{ padding: "8px" }}>
                      <span className="nutrient-label" style={{ fontSize: "var(--fs-2xs)" }}>{n.label}</span>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          className="form-input"
                          style={{ fontSize: "var(--fs-sm)", padding: "2px 4px", textAlign: "right", marginTop: "4px" }}
                          value={val === 0 ? "" : val}
                          placeholder="0"
                          onChange={e => handleNutrientChange(n.key, e.target.value)}
                        />
                      ) : (
                        <span className="nutrient-value" style={{ fontSize: "var(--fs-md)" }}>
                          {val > 0 ? val.toFixed(2) + "%" : "0.00%"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ARCHIVE WARNING MODAL */}
      {archiveWarning && (
        <div className="modal-overlay visible" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3 style={{ color: "var(--amber-400)", margin: 0 }}>Advertencia de archivado</h3>
            </div>
            <div className="modal-body">
              <p>{archiveWarning}</p>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>
                Archivar un ingrediente no afectará los snapshots históricos congelados, pero impedirá que se agregue a nuevas formulaciones.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button className="btn btn-secondary" onClick={() => setArchiveWarning(null)}>
                  Cancelar
                </button>
                <button className="btn btn-primary" style={{ backgroundColor: "var(--amber-500)", color: "var(--text-inverse)" }} onClick={handleForceArchive}>
                  Proceder con el Archivado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL AUDIT LOGS MODAL */}
      {historyModalOpen && (
        <div className="modal-overlay visible">
          <div className="modal-content" style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h3>Historial de auditoría del catálogo</h3>
              <button className="btn-icon modal-close" onClick={() => setHistoryModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: "450px", overflowY: "auto" }}>
              {changeLogs && changeLogs.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {changeLogs.map(log => (
                    <div key={log._id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
                        <span>
                          <strong>{log.actor}</strong> ({log.internalId})
                        </span>
                        <span>{new Date(log.changedAt).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: "var(--fs-sm)", marginTop: "4px" }}>
                        Campos cambiados: <code>{log.fields.join(", ")}</code>
                        {log.reason && <div style={{ fontSize: "var(--fs-xs)", fontStyle: "italic", marginTop: "2px" }}>Motivo: {log.reason}</div>}
                      </div>
                      <div style={{ fontSize: "var(--fs-2xs)", marginTop: "4px", color: "var(--text-tertiary)" }}>
                        Antes: {JSON.stringify(log.before)} | Después: {JSON.stringify(log.after)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>No hay registros de cambios en el catálogo aún.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
