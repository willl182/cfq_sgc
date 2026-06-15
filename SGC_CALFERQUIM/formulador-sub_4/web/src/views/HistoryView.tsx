import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface Snapshot {
  _id: Id<"productListSnapshots">;
  productListId: Id<"productLists">;
  displayCode: string;
  targetProductId: Id<"catalogItems"> | null;
  targetProductSnapshot: Record<string, number> | null;
  componentsSnapshot: Array<{
    catalogItemId: Id<"catalogItems">;
    internalId: string;
    name: string;
    cantidadKg: number;
    nutrientsSnapshot: Record<string, number>;
  }>;
  composicionCalculada: Record<string, number>;
  estadoGeneral: "CUMPLE" | "CUMPLE_S" | "NO_CUMPLE" | "SIN_OBJETIVO";
  detalleTolerancia: Record<string, { valor: number; tolerancia: number; estado: "C" | "NC" | "SUP" }>;
  totalKg: number;
  alertas: string[];
  snapshotVersion: number;
  createdAt: number;
  createdBy: string;
  notas: string | null;
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

export function HistoryView() {
  const navigate = useNavigate();
  const snapshots = useQuery(api.lists.listSnapshots, { limit: 100 });
  const catalogItems = useQuery(api.catalog.list, { includeArchived: false });
  const cloneSnapshot = useMutation(api.lists.cloneSnapshotToList);

  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [filterProduct, setFilterProduct] = useState<Id<"catalogItems"> | "">("");
  const [filterStatus, setFilterStatus] = useState<"CUMPLE" | "CUMPLE_S" | "NO_CUMPLE" | "SIN_OBJETIVO" | "">("");

  const ptItems = useMemo(() =>
    (catalogItems || []).filter((item: any) => item.class === "PT" || item.class === "MZR"),
    [catalogItems]
  );

  const filteredSnapshots = useMemo(() => {
    if (!snapshots) return [];
    return (snapshots as Snapshot[]).filter((s) => {
      if (filterProduct && s.targetProductId !== filterProduct) return false;
      if (filterStatus && s.estadoGeneral !== filterStatus) return false;
      return true;
    });
  }, [snapshots, filterProduct, filterStatus]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "CUMPLE": return "status-cumple";
      case "CUMPLE_S": return "status-cumple-s";
      case "NO_CUMPLE": return "status-no-cumple";
      default: return "status-sin-objetivo";
    }
  };

  const handleClone = async (snapshotId: Id<"productListSnapshots">) => {
    try {
      const result = await cloneSnapshot({ snapshotId, createdBy: localStorage.getItem("cfq_user") || "anonymous" });
      navigate(`/formulator/${result.listId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (snapshots === undefined || catalogItems === undefined) {
    return <div className="flex items-center justify-center" style={{ padding: "3rem" }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Histórico de Snapshots</h1>
        <p>Versiones congeladas de fórmulas guardadas</p>
      </div>

      <div className="card mb-4">
        <div className="flex gap-4 items-center">
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Filtrar por producto</label>
            <select
              className="input"
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value as Id<"catalogItems"> || "")}
            >
              <option value="">Todos los productos</option>
              {ptItems.map((item: any) => (
                <option key={item._id} value={item._id}>
                  {item.internalId} - {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Filtrar por estado</label>
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="">Todos</option>
              <option value="CUMPLE">CUMPLE</option>
              <option value="CUMPLE_S">CUMPLE_S</option>
              <option value="NO_CUMPLE">NO_CUMPLE</option>
              <option value="SIN_OBJETIVO">SIN_OBJETIVO</option>
            </select>
          </div>
        </div>
      </div>

      {filteredSnapshots.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>Sin snapshots</h3>
            <p>Los snapshots se crean automáticamente al guardar una fórmula.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Versión</th>
                  <th>Fecha</th>
                  <th>Total kg</th>
                  <th>Estado</th>
                  <th>Usuario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSnapshots.map((snapshot: Snapshot) => (
                  <tr key={snapshot._id}>
                    <td className="font-mono">{snapshot.displayCode}</td>
                    <td>v{snapshot.snapshotVersion}</td>
                    <td>{formatDate(snapshot.createdAt)}</td>
                    <td className="font-mono">{snapshot.totalKg.toFixed(2)}</td>
                    <td>
                      <span className={getStatusClass(snapshot.estadoGeneral)}>
                        {snapshot.estadoGeneral}
                      </span>
                    </td>
                    <td>{snapshot.createdBy}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setSelectedSnapshot(snapshot)}
                        >
                          Ver
                        </button>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleClone(snapshot._id)}
                        >
                          Clonar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedSnapshot && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedSnapshot(null)}
        >
          <div
            className="card"
            style={{ width: "90%", maxWidth: "800px", maxHeight: "90vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <h3 className="card-title">
                {selectedSnapshot.displayCode} v{selectedSnapshot.snapshotVersion}
              </h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setSelectedSnapshot(null)}>
                ×
              </button>
            </div>

            <div className="grid grid-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm text-muted mb-2">Fecha</h4>
                <p>{formatDate(selectedSnapshot.createdAt)}</p>
              </div>
              <div>
                <h4 className="text-sm text-muted mb-2">Estado</h4>
                <p className={getStatusClass(selectedSnapshot.estadoGeneral)}>
                  {selectedSnapshot.estadoGeneral}
                </p>
              </div>
            </div>

            {selectedSnapshot.alertas.length > 0 && (
              <div className="alert alert-warning mb-4">
                {selectedSnapshot.alertas.map((msg, i) => <div key={i}>{msg}</div>)}
              </div>
            )}

            <h4 className="text-sm text-muted mb-2">Componentes</h4>
            <div className="table-container mb-4">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Cantidad (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSnapshot.componentsSnapshot.map((comp, i) => (
                    <tr key={i}>
                      <td className="font-mono">{comp.internalId}</td>
                      <td>{comp.name}</td>
                      <td className="font-mono">{comp.cantidadKg.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="text-sm text-muted mb-2">Composición Calculada</h4>
            <div className="table-container">
              <table className="composition-table">
                <thead>
                  <tr>
                    <th>Nutriente</th>
                    <th>Valor</th>
                    {selectedSnapshot.targetProductSnapshot && <th>Objetivo</th>}
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {NUTRIENT_KEYS.filter((k) =>
                    selectedSnapshot.composicionCalculada[k] > 0 ||
                    (selectedSnapshot.targetProductSnapshot && selectedSnapshot.targetProductSnapshot[k] > 0)
                  ).map((k) => {
                    const valor = selectedSnapshot.composicionCalculada[k];
                    const objetivo = selectedSnapshot.targetProductSnapshot?.[k] || 0;
                    const detalle = selectedSnapshot.detalleTolerancia[k];
                    return (
                      <tr key={k}>
                        <td>{NUTRIENT_LABELS[k]}</td>
                        <td className="font-mono">{valor.toFixed(4)}</td>
                        {selectedSnapshot.targetProductSnapshot && (
                          <td className="font-mono">{objetivo.toFixed(2)}</td>
                        )}
                        <td>
                          {detalle && (
                            <span className={`tolerance-indicator ${detalle.estado.toLowerCase()}`}>
                              {detalle.estado === "C" ? "✓" : detalle.estado === "NC" ? "✗" : "⚠"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="btn btn-primary" onClick={() => handleClone(selectedSnapshot._id)}>
                Clonar a nueva fórmula
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedSnapshot(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}