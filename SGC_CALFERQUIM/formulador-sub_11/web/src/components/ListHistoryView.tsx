import React, { useState } from "react";
import { useQuery, useMutation } from "../hooks/useConvex.ts";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import type { UserContext } from "../App.tsx";

interface ListHistoryViewProps {
  user: UserContext;
  onEditList: (listId: string) => void;
  onCloneSnapshot: (snapshotId: string) => void;
  onViewSnapshot: (snapshotId: string) => void;
}

export default function ListHistoryView({
  user,
  onEditList,
  onCloneSnapshot,
  onViewSnapshot,
}: ListHistoryViewProps) {
  const [historyTab, setHistoryTab] = useState<"vivas" | "snapshots">("vivas");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const lists = useQuery(api.lists.getLists, { includeArchived: false }) || [];
  const snapshots = useQuery(api.lists.getSnapshots) || [];

  const archiveList = useMutation(api.lists.archiveList);
  const deleteList = useMutation(api.lists.deleteList);

  const filteredLists = lists.filter(l => {
    const matchText = `${l.displayCode} ${l.name} ${l.targetProductName}`.toLowerCase();
    if (searchTerm && !matchText.includes(searchTerm.toLowerCase())) return false;
    if (statusFilter && l.liveEvaluation.status !== statusFilter) return false;
    return true;
  });

  const filteredSnapshots = snapshots.filter(s => {
    // In snapshots, target details are frozen in components or displayCode
    const matchText = `${s.displayCode || ""} ${s.user}`.toLowerCase();
    if (searchTerm && !matchText.includes(searchTerm.toLowerCase())) return false;
    if (statusFilter && s.evaluation.status !== statusFilter) return false;
    return true;
  });

  const handleArchive = async (id: Id<"productLists">) => {
    if (confirm("¿Está seguro de archivar esta receta viva? Dejará de aparecer en la pantalla activa, pero sus snapshots históricos se conservarán.")) {
      try {
        await archiveList({ id, actor: user.name });
        alert("Receta archivada con éxito.");
      } catch (e: any) {
        alert("Error al archivar: " + e.message);
      }
    }
  };

  const handleDeleteList = async (id: Id<"productLists">) => {
    if (confirm("¿Está seguro de eliminar físicamente esta receta y todos sus snapshots versionados? Esta acción es irreversible.")) {
      try {
        await deleteList({ id, role: user.role });
        alert("Receta eliminada físicamente.");
      } catch (e: any) {
        alert("Error al eliminar: " + e.message);
      }
    }
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-header-left">
          <h2 className="view-title">Historial de Recetas</h2>
          <span className="badge">
            {lists.length} listas vivas / {snapshots.length} snapshots guardados
          </span>
        </div>
      </div>

      {/* Sub-tabs for Vivas vs Snapshots */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border)", marginBottom: "20px", paddingBottom: "8px" }}>
        <button
          className={`btn ${historyTab === "vivas" ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "6px 16px", fontSize: "var(--fs-sm)" }}
          onClick={() => { setHistoryTab("vivas"); setSearchTerm(""); setStatusFilter(""); }}
        >
          ♻️ Listas Vivas (Recalculables)
        </button>
        <button
          className={`btn ${historyTab === "snapshots" ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "6px 16px", fontSize: "var(--fs-sm)" }}
          onClick={() => { setHistoryTab("snapshots"); setSearchTerm(""); setStatusFilter(""); }}
        >
          ❄️ Historial de Snapshots (Congelados)
        </button>
      </div>

      {/* Search and status filters */}
      <div className="filters-bar" style={{ marginBottom: "20px" }}>
        <div className="search-wrapper">
          <input
            type="text"
            className="form-input search-input"
            placeholder={
              historyTab === "vivas"
                ? "Buscar listas vivas por código, nombre o producto destino..."
                : "Buscar snapshots por código de lista o usuario..."
            }
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="CUMPLE">CUMPLE</option>
          <option value="CUMPLE_S">CUMPLE_S</option>
          <option value="NO_CUMPLE">NO_CUMPLE</option>
          <option value="SIN_OBJETIVO">SIN OBJETIVO</option>
        </select>
      </div>

      {historyTab === "vivas" ? (
        /* LISTAS VIVAS VIEW */
        filteredLists.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h3>Sin recetas vivas</h3>
            <p>No se encontraron recetas vivas con los criterios de búsqueda actuales.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Producto Objetivo</th>
                  <th>Total Peso</th>
                  <th>Última Modificación</th>
                  <th>Estado Vivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredLists.map(list => (
                  <tr key={list._id} className="table-row-animate">
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{list.displayCode}</td>
                    <td className="product-name">{list.name}</td>
                    <td>
                      {list.targetProductId ? (
                        <span>[{list.targetProductInternalId}] {list.targetProductName}</span>
                      ) : (
                        <span style={{ color: "var(--text-tertiary)" }}>Sin objetivo</span>
                      )}
                    </td>
                    <td>{list.liveTotalKg} kg</td>
                    <td style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
                      {new Date(list.updatedAt).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge" style={{
                        backgroundColor: list.liveEvaluation.status === "CUMPLE" ? "var(--green-950)"
                          : list.liveEvaluation.status === "CUMPLE_S" ? "var(--green-900)"
                          : list.liveEvaluation.status === "NO_CUMPLE" ? "var(--red-muted)"
                          : "var(--bg-elevated)",
                        color: list.liveEvaluation.status === "CUMPLE" ? "var(--green-400)"
                          : list.liveEvaluation.status === "CUMPLE_S" ? "var(--amber-400)"
                          : list.liveEvaluation.status === "NO_CUMPLE" ? "var(--red-400)"
                          : "var(--text-secondary)"
                      }}>
                        {list.liveEvaluation.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "var(--fs-2xs)" }} onClick={() => onEditList(list._id)}>
                          Editar
                        </button>
                        <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "var(--fs-2xs)", color: "var(--red-400)" }} onClick={() => handleArchive(list._id)}>
                          Archivar
                        </button>
                        {user.role === "admin" && (
                          <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "var(--fs-2xs)", color: "var(--red-500)" }} onClick={() => handleDeleteList(list._id)}>
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* SNAPSHOTS HISTORY VIEW */
        filteredSnapshots.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">❄️</div>
            <h3>Sin snapshots históricos</h3>
            <p>No se encontraron snapshots registrados en la base de datos.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Lista</th>
                  <th>Versión</th>
                  <th>Total Peso</th>
                  <th>Guardado Por</th>
                  <th>Fecha de Guardado</th>
                  <th>Estado Congelado</th>
                  <th>Componentes Congelados</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSnapshots.map(snap => {
                  const matchingList = lists.find(l => l._id === snap.productListId);
                  const displayCode = matchingList?.displayCode || "Fórmula anterior";
                  
                  return (
                    <tr key={snap._id} className="table-row-animate">
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{displayCode}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)" }}>
                          v{snap.snapshotVersion}
                        </span>
                      </td>
                      <td>{snap.totalKg} kg</td>
                      <td>{snap.user}</td>
                      <td style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
                        {new Date(snap.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <span className="badge" style={{
                          backgroundColor: snap.evaluation.status === "CUMPLE" ? "var(--green-950)"
                            : snap.evaluation.status === "CUMPLE_S" ? "var(--green-900)"
                            : snap.evaluation.status === "NO_CUMPLE" ? "var(--red-muted)"
                            : "var(--bg-elevated)",
                          color: snap.evaluation.status === "CUMPLE" ? "var(--green-400)"
                            : snap.evaluation.status === "CUMPLE_S" ? "var(--amber-400)"
                            : snap.evaluation.status === "NO_CUMPLE" ? "var(--red-400)"
                            : "var(--text-secondary)"
                        }}>
                          {snap.evaluation.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "var(--fs-2xs)", color: "var(--text-secondary)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {snap.components.map(c => `${c.producto} (${c.quantity}kg)`).join(", ")}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "var(--fs-2xs)" }} onClick={() => onViewSnapshot(snap._id)}>
                            👁️ Ver
                          </button>
                          <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "var(--fs-2xs)" }} onClick={() => onCloneSnapshot(snap._id)}>
                            Clonar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
