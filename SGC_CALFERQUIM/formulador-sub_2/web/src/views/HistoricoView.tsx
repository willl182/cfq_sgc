import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { NUTRIENT_KEYS, NUTRIENT_LABELS, fmtGrade, type NutrientKey } from "../lib";

const STATUS_LABELS: Record<string, string> = {
  CUMPLE: "Conforme",
  CUMPLE_S: "Conforme (exceso)",
  NO_CUMPLE: "No conforme",
  SIN_OBJETIVO: "Sin objetivo",
};

export default function HistoricoView() {
  const [filterProduct, setFilterProduct] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const snapshots = useQuery(api.productListSnapshots.listAll, { includeArchived: false }) ?? [];
  const catalogItems = useQuery(api.catalogItems.getAll, { includeArchived: false }) ?? [];

  const archiveMutation = useMutation(api.productListSnapshots.archiveSnapshot);
  const cloneMutation = useMutation(api.productListSnapshots.cloneSnapshotToList);

  const [selectedSnapshot, setSelectedSnapshot] = useState<any>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filtered = snapshots.filter((s: any) => {
    if (filterStatus && s.generalStatus !== filterStatus) return false;
    if (filterProduct && !s.displayCode.toLowerCase().includes(filterProduct.toLowerCase())) return false;
    return true;
  });

  const handleArchive = async (id: string) => {
    if (!confirm("Archivar este snapshot?")) return;
    await archiveMutation({ id: id as any });
  };

  const handleClone = async (id: string) => {
    const code = prompt("C\u00f3digo para la nueva lista:", "");
    if (!code) return;
    await cloneMutation({ snapshotId: id as any, newDisplayCode: code ?? undefined });
  };

  const fmtDate = (ts: number) => new Date(ts).toLocaleString("es-CO");

  return (
    <div className="view">
      <div className="view-header">
        <div className="view-header-left">
          <h2 className="view-title">Hist\u00f3rico de Snapshots</h2>
          <span className="badge">{filtered.length} snapshots</span>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-wrapper">
          <input
            type="text"
            className="form-input"
            placeholder="Filtrar por c\u00f3digo..."
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
          />
        </div>
        <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="CUMPLE">Conforme</option>
          <option value="CUMPLE_S">Conforme (exceso)</option>
          <option value="NO_CUMPLE">No conforme</option>
          <option value="SIN_OBJETIVO">Sin objetivo</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>C\u00f3digo</th>
              <th>Producto</th>
              <th>Componentes</th>
              <th>Total kg</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>v</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s: any) => (
              <>
                <tr key={s._id} className="clickable-row" onClick={() => {
                  if (expandedRows.has(s._id)) {
                    const next = new Set(expandedRows);
                    next.delete(s._id);
                    setExpandedRows(next);
                  } else {
                    setExpandedRows(new Set([...expandedRows, s._id]));
                  }
                }}>
                  <td className="code-cell">{s.displayCode}</td>
                  <td>{s.targetProductSnapshot?.nombre ?? "\u2014"}</td>
                  <td>{s.components.length}</td>
                  <td className="num-col">{s.totalKg}</td>
                  <td>
                    <span className={`status-badge ${s.generalStatus === "CUMPLE" ? "status-c" : s.generalStatus === "NO_CUMPLE" ? "status-nc" : "status-sup"}`}>
                      {s.generalStatus}
                    </span>
                  </td>
                  <td>{fmtDate(s.createdAt)}</td>
                  <td>v{s.snapshotVersion}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleClone(s._id); }} title="Clonar">&#128203;</button>
                      <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleArchive(s._id); }} title="Archivar">&#128465;</button>
                    </div>
                  </td>
                </tr>
                {expandedRows.has(s._id) && (
                  <tr key={`${s._id}-detail`}>
                    <td colSpan={8}>
                      <div className="snapshot-detail">
                        {s.alertas.length > 0 && (
                          <div className="alert alert-warning">
                            {s.alertas.map((a: string, i: number) => <div key={i}>{a}</div>)}
                          </div>
                        )}
                        <h4>Componentes</h4>
                        <table className="data-table data-table-sm">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Nombre</th>
                              <th>kg</th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.components.map((c: any, i: number) => (
                              <tr key={i}>
                                <td>{c.internalId}</td>
                                <td>{c.nombre}</td>
                                <td className="num-col">{c.cantidadKg}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <h4>Composici\u00f3n Calculada</h4>
                        <div className="nutrient-grid">
                          {s.toleranceDetail
                            .filter((d: any) => d.calculado > 0 || d.declarado > 0)
                            .map((d: any) => (
                              <div key={d.nutrient} className={`nutrient-item ${d.informativo ? "informativo" : ""} ${d.status === "C" ? "has-value" : ""}`}>
                                <span className="nutrient-label">{NUTRIENT_LABELS[d.nutrient as NutrientKey]}</span>
                                <span className="nutrient-value">{fmtGrade(d.calculado)}</span>
                                {d.declarado > 0 && (
                                  <span className="nutrient-decl">
                                    obj: {fmtGrade(d.declarado)} &plusmn;{fmtGrade(d.tolerancia)} = [{fmtGrade(d.min)}\u2013{fmtGrade(d.max)}]
                                  </span>
                                )}
                                <span className={`status-badge ${d.status === "C" ? "status-c" : d.status === "NC" ? "status-nc" : "status-sup"}`}>
                                  {d.status}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <h3>Sin snapshots</h3>
          <p>Guarde una f\u00f3rmula desde el formulador para crear snapshots</p>
        </div>
      )}
    </div>
  );
}