import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  NUTRIENT_KEYS,
  NUTRIENT_LABELS,
  NUTRIENT_GROUPS,
  fmtGrade,
  parseNum,
  type NutrientKey,
  type Clase,
} from "../lib";

function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ";" || char === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function detectSeparator(text: string): ";" | "," {
  const firstLine = text.split("\n")[0];
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semicolons > commas ? ";" : ",";
}

const CSV_NUTRIENT_CSV_KEYS: Record<string, string> = {
  N_NH4: "N-NH4",
  N_NO3: "N-NO3",
  N_org: "N-org",
  N_ur: "N-ur",
};

export default function CatalogView() {
  const [search, setSearch] = useState("");
  const [filterClase, setFilterClase] = useState<string>("");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const isAdmin = typeof window !== "undefined" && (() => { try { return localStorage.getItem("cfq_admin") === "true"; } catch { return false; } })();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const catalogItems = useQuery(api.catalogItems.getAll, {
    clase: filterClase as Clase | undefined,
    search: search || undefined,
    includeArchived: false,
  });
  const countInfo = useQuery(api.catalogItems.getCount, {});
  const isEmpty = useQuery(api.catalogItems.isEmpty, {});

  const seedMutation = useMutation(api.catalogMutations.seedFromCsv);
  const updateMutation = useMutation(api.catalogMutations.updateCatalogItem);
  const archiveMutation = useMutation(api.catalogMutations.archiveCatalogItem);
  const clearMutation = useMutation(api.catalogMutations.clearCatalog);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);

  const handleSeed = async () => {
    if (!fileInputRef.current?.files?.length) return;
    const file = fileInputRef.current.files[0];
    const text = await file.text();
    const sep = detectSeparator(text);
    const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    if (lines.length < 2) return;

    const headers = parseCsvRow(lines[0]);
    const nutrientIdx: Record<string, number> = {};
    for (const nk of NUTRIENT_KEYS) {
      const csvKey = CSV_NUTRIENT_CSV_KEYS[nk] ?? nk;
      const idx = headers.findIndex((h) => h.trim() === csvKey);
      if (idx >= 0) nutrientIdx[nk] = idx;
    }

    const codIdx = headers.findIndex((h) => h.trim() === "COD");
    const prodIdx = headers.findIndex((h) => h.trim() === "PRODUCTO");
    const claseIdx = headers.findIndex((h) => h.trim() === "CLASE");
    const tipoIdx = headers.findIndex((h) => h.trim() === "TIPO");

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.includes(sep) || line.includes('"') ? parseCsvRow(line) : line.split(sep);
      const nutrientes: Record<string, string> = {};
      for (const [nk, idx] of Object.entries(nutrientIdx)) {
        nutrientes[nk] = values[idx] ?? "0";
      }
      rows.push({
        COD: values[codIdx] ?? "",
        PRODUCTO: values[prodIdx] ?? "",
        CLASE: values[claseIdx] ?? "MP",
        TIPO: values[tipoIdx] ?? "G",
        nutrientes,
      });
    }

    setLoading(true);
    try {
      const result = await seedMutation({ csvData: rows });
      alert(`Importados: ${result.inserted}, Rechazados: ${result.rejected}${result.errors.length ? "\nErrores: " + result.errors.slice(0, 5).join("; ") : ""}`);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClear = async () => {
    if (!confirm("Se eliminar\u00e1n todos los elementos del cat\u00e1logo. \u00bfContinuar?")) return;
    setLoading(true);
    try {
      await clearMutation({});
      alert("Cat\u00e1logo limpiado");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item._id);
    const vals: Record<string, number> = {};
    for (const k of NUTRIENT_KEYS) {
      vals[k] = item[k] ?? 0;
    }
    setEditValues(vals);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateMutation({ id: editingId as any, updates: editValues, reason: "Edici\u00f3n manual" });
    setEditingId(null);
    setEditValues({});
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Archivar este elemento?")) return;
    await archiveMutation({ id: id as any });
  };

  const items = catalogItems ?? [];

  return (
    <div className="view">
      <div className="view-header">
        <div className="view-header-left">
          <h2 className="view-title">Cat\u00e1logo de Insumos</h2>
          <span className="badge">
            {countInfo ? `${countInfo.active} productos (MP:${countInfo.mp} PT:${countInfo.pt} MZR:${countInfo.mzr})` : "..."}
          </span>
        </div>
        <div className="view-header-right">
          {isEmpty === true && (
            <label className="btn btn-primary">
              Importar CSV
              <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleSeed} />
            </label>
          )}
          {isAdmin && (
            <button className="btn btn-danger" onClick={handleClear}>
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-wrapper">
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por nombre o c\u00f3digo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" value={filterClase} onChange={(e) => setFilterClase(e.target.value)}>
          <option value="">Todas las clases</option>
          <option value="MP">MP</option>
          <option value="PT">PT</option>
          <option value="MZR">MZR</option>
        </select>
        <select className="form-select" value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="G">G</option>
          <option value="P">P</option>
          <option value="L">L</option>
          <option value="C">C</option>
        </select>
      </div>

      {loading && <div className="loading-overlay">Cargando...</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Clase</th>
              <th>Tipo</th>
              <th className="num-col">N</th>
              <th className="num-col">P</th>
              <th className="num-col">K</th>
              {editingId && NUTRIENT_KEYS.filter((k) => !["N", "P", "K"].includes(k)).map((k) => (
                <th key={k} className="num-col">{NUTRIENT_LABELS[k]}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr key={item._id} className={editingId === item._id ? "editing-row" : ""}>
                <td className="code-cell">{item.internalId}</td>
                <td className="product-name">{item.nombre}</td>
                <td>
                  <span className={`badge badge-${item.clase === "PT" ? "pt" : item.clase === "MZR" ? "mzr" : "mp"}`}>
                    {item.clase}
                  </span>
                </td>
                <td>{item.tipo}</td>
                {editingId === item._id ? (
                  <>
                    {["N", "P", "K", ...NUTRIENT_KEYS.filter((k) => !["N", "P", "K"].includes(k))].map((k) => (
                      <td key={k} className="num-col">
                        <input
                          type="number"
                          className="form-input form-input-sm"
                          value={editValues[k] ?? 0}
                          step="0.01"
                          onChange={(e) => setEditValues({ ...editValues, [k]: parseFloat(e.target.value) || 0 })}
                        />
                      </td>
                    ))}
                  </>
                ) : (
                  <>
                    <td className="num-col">{fmtGrade(item.N)}</td>
                    <td className="num-col">{fmtGrade(item.P)}</td>
                    <td className="num-col">{fmtGrade(item.K)}</td>
                  </>
                )}
                <td>
                  <div className="row-actions">
                    {editingId === item._id ? (
                      <>
                        <button className="btn btn-sm btn-primary" onClick={saveEdit}>Guardar</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button className="btn-icon" onClick={() => setDetailItem(item)} title="Ver detalle">&#x1f441;</button>
                        <button className="btn-icon" onClick={() => startEdit(item)} title="Editar">&#9998;</button>
                        {isAdmin && <button className="btn-icon" onClick={() => handleArchive(item._id)} title="Archivar">&#128465;</button>}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && !loading && (
        <div className="empty-state">
          <h3>Sin productos</h3>
          <p>Importe el archivo CSV para comenzar</p>
        </div>
      )}

      {detailItem && (
        <div className="modal-overlay visible" onClick={() => setDetailItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{detailItem.nombre}</h3>
              <button className="btn-icon" onClick={() => setDetailItem(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-meta">
                <div className="detail-item"><span className="detail-label">ID Interno</span> {detailItem.internalId}</div>
                <div className="detail-item"><span className="detail-label">C\u00f3digo</span> {detailItem.externalCode ?? "\u2014"}</div>
                <div className="detail-item"><span className="detail-label">Clase</span> {detailItem.clase}</div>
                <div className="detail-item"><span className="detail-label">Tipo</span> {detailItem.tipo}</div>
              </div>
              <h4>Composici\u00f3n Qu\u00edmica (%)</h4>
              <div className="nutrient-grid">
                {NUTRIENT_KEYS.map((k) => {
                  const val = detailItem[k] ?? 0;
                  return (
                    <div key={k} className={`nutrient-item ${val > 0 ? "has-value" : ""}`}>
                      <span className="nutrient-label">{NUTRIENT_LABELS[k]}</span>
                      <span className="nutrient-value">{fmtGrade(val)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}