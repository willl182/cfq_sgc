import { useState, useCallback, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface ParsedRow {
  productoObjetivoId: string;
  listaAlias: string;
  componenteId: string;
  cantidad: number;
}

interface ImportError {
  row: number;
  message: string;
}

interface ImportPreview {
  productoObjetivoId: string;
  listaAlias: string;
  componentes: Array<{
    componenteId: string;
    cantidad: number;
    existe: boolean;
  }>;
}

const REQUIRED_HEADERS = ["productoObjetivoId", "listaAlias", "componenteId", "cantidad"];

export function ImportView() {
  const catalogItems = useQuery(api.catalog.list, { includeArchived: false });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview[] | null>(null);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [parsing, setParsing] = useState(false);

  const catalogByCode = useMemo(() => {
    const map = new Map<string, string>();
    (catalogItems || []).forEach((item: any) => {
      map.set(item.internalId, item._id);
    });
    return map;
  }, [catalogItems]);

  const parseFile = useCallback(async () => {
    if (!file) return;
    setParsing(true);
    setErrors([]);
    setPreview(null);

    try {
      const content = await file.text();
      const lines = content.trim().split("\n");

      if (lines.length < 2) {
        setErrors([{ row: 0, message: "El archivo está vacío o no tiene datos" }]);
        return;
      }

      const headerLine = lines[0].toLowerCase().trim();
      const headers = headerLine.split(/[,;]/).map((h) => h.trim());

      const headerMap: Record<string, number> = {};
      REQUIRED_HEADERS.forEach((required) => {
        const idx = headers.indexOf(required);
        if (idx === -1) {
          setErrors((prev) => [...prev, { row: 0, message: `Encabezado faltante: ${required}` }]);
        } else {
          headerMap[required] = idx;
        }
      });

      if (errors.length > 0) return;

      const parsedRows: ParsedRow[] = [];
      const parseErrors: ImportError[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(/[,;]/).map((v) => v.trim());

        const productoObjetivoId = values[headerMap.productoObjetivoId];
        const listaAlias = values[headerMap.listaAlias];
        const componenteId = values[headerMap.componenteId];
        const cantidadStr = values[headerMap.cantidad];

        if (!productoObjetivoId) {
          parseErrors.push({ row: i + 1, message: "productoObjetivoId vacío" });
          continue;
        }
        if (!listaAlias) {
          parseErrors.push({ row: i + 1, message: "listaAlias vacío" });
          continue;
        }
        if (!componenteId) {
          parseErrors.push({ row: i + 1, message: "componenteId vacío" });
          continue;
        }

        const cantidad = parseFloat(cantidadStr);
        if (isNaN(cantidad)) {
          parseErrors.push({ row: i + 1, message: `cantidad inválida: ${cantidadStr}` });
          continue;
        }

        if (cantidad < 0 || cantidad > 1000) {
          parseErrors.push({ row: i + 1, message: `cantidad fuera de rango: ${cantidad}` });
          continue;
        }

        parsedRows.push({ productoObjetivoId, listaAlias, componenteId, cantidad });
      }

      setErrors(parseErrors);

      const groupedByProductAndList = new Map<string, ImportPreview>();
      for (const row of parsedRows) {
        const key = `${row.productoObjetivoId}|${row.listaAlias}`;
        if (!groupedByProductAndList.has(key)) {
          groupedByProductAndList.set(key, {
            productoObjetivoId: row.productoObjetivoId,
            listaAlias: row.listaAlias,
            componentes: [],
          });
        }
        const group = groupedByProductAndList.get(key)!;
        group.componentes.push({
          componenteId: row.componenteId,
          cantidad: row.cantidad,
          existe: catalogByCode.has(row.componenteId),
        });
      }

      setPreview(Array.from(groupedByProductAndList.values()));
    } catch (err) {
      setErrors([{ row: 0, message: `Error al leer archivo: ${err}` }]);
    } finally {
      setParsing(false);
    }
  }, [file, catalogByCode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(null);
      setErrors([]);
    }
  };

  const inexistentComponents = useMemo(() => {
    if (!preview) return [];
    const allComps = new Set<string>();
    preview.forEach((p) => {
      p.componentes.forEach((c) => {
        if (!c.existe) allComps.add(c.componenteId);
      });
    });
    return Array.from(allComps);
  }, [preview]);

  if (catalogItems === undefined) {
    return <div className="flex items-center justify-center" style={{ padding: "3rem" }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Importar Listas</h1>
        <p>Importa fórmulas desde archivos CSV (funcionalidad en desarrollo)</p>
      </div>

      <div className="card mb-4">
        <h3 className="card-title mb-4">Carga de Archivo</h3>
        <p className="text-sm text-muted mb-4">
          Formato esperado: <code>productoObjetivoId,listaAlias,componenteId,cantidad</code>
        </p>
        <div className="input-group">
          <label>Seleccionar archivo CSV</label>
          <input
            type="file"
            accept=".csv"
            className="input"
            onChange={handleFileChange}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={parseFile}
          disabled={!file || parsing}
        >
          {parsing ? "Analizando..." : "Analizar archivo"}
        </button>
      </div>

      {errors.length > 0 && (
        <div className="card mb-4">
          <h3 className="card-title mb-2" style={{ color: "var(--color-error)" }}>
            Errores encontrados ({errors.length})
          </h3>
          <div className="alert alert-error">
            {errors.slice(0, 10).map((err, i) => (
              <div key={i}>
                {err.row > 0 ? `Fila ${err.row}: ` : ""}{err.message}
              </div>
            ))}
            {errors.length > 10 && (
              <div className="mt-2">...y {errors.length - 10} errores más</div>
            )}
          </div>
        </div>
      )}

      {inexistentComponents.length > 0 && preview && (
        <div className="card mb-4">
          <h3 className="card-title mb-2" style={{ color: "var(--color-warning)" }}>
            Componentes no encontrados ({inexistentComponents.length})
          </h3>
          <div className="alert alert-warning">
            Los siguientes códigos no existen en el catálogo:
            <div className="font-mono mt-2">
              {inexistentComponents.join(", ")}
            </div>
          </div>
        </div>
      )}

      {preview && errors.length === 0 && (
        <div className="card">
          <h3 className="card-title mb-4">
            Vista Previa ({preview.length} {preview.length === 1 ? "lista" : "listas"})
          </h3>
          {preview.map((p, i) => (
            <div key={i} className="mb-4" style={{ padding: "1rem", background: "var(--color-background)", borderRadius: "0.5rem" }}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-mono">{p.productoObjetivoId || "(sin objetivo)"}</span>
                  <span className="text-muted"> — {p.listaAlias}</span>
                </div>
                <span className="badge badge-mp">{p.componentes.length} componentes</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Componente</th>
                    <th>Cantidad (kg)</th>
                    <th>Existe</th>
                  </tr>
                </thead>
                <tbody>
                  {p.componentes.map((c, j) => (
                    <tr key={j}>
                      <td className="font-mono">{c.componenteId}</td>
                      <td className="font-mono">{c.cantidad.toFixed(2)}</td>
                      <td>
                        {c.existe ? (
                          <span className="badge badge-success">✓</span>
                        ) : (
                          <span className="badge badge-error">✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <div className="alert alert-warning mt-4">
            Esta es una vista previa. La persistencia de datos aún no está implementada.
          </div>
        </div>
      )}
    </div>
  );
}