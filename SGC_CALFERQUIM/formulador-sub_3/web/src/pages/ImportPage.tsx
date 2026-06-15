import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const catalogItems = useQuery(api.catalog.listCatalogItems, {
    includeArchived: false,
  });

  const itemsById = catalogItems
    ? Object.fromEntries(catalogItems.map((i) => [i.internalId, i]))
    : {};

  const handleFile = async () => {
    if (!file) return;
    const text = await file.text();
    const lines = text.replace(/^\uFEFF/, "").trimEnd().split("\n");
    if (lines.length < 2) {
      setErrors(["CSV vacío"]); return;
    }
    const header = lines[0].split(";").map((h) => h.trim());
    const expected = ["productoObjetivoId", "listaAlias", "componenteId", "cantidad"];
    const missing = expected.filter((h) => !header.includes(h));
    if (missing.length > 0) {
      setErrors([`Cabeceras faltantes: ${missing.join(", ")}`]); return;
    }

    const idxProducto = header.indexOf("productoObjetivoId");
    const idxAlias = header.indexOf("listaAlias");
    const idxComponente = header.indexOf("componenteId");
    const idxCantidad = header.indexOf("cantidad");

    const groups: Record<string, any[]> = {};
    const rowErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(";");
      const producto = cols[idxProducto]?.trim() ?? "";
      const alias = cols[idxAlias]?.trim() ?? "";
      const componente = cols[idxComponente]?.trim() ?? "";
      const cantidadRaw = cols[idxCantidad]?.trim() ?? "";
      const cantidad = parseFloat(cantidadRaw.replace(",", "."));

      if (!producto) { rowErrors.push(`Fila ${i + 1}: productoObjetivoId vacío`); continue; }
      if (!componente) { rowErrors.push(`Fila ${i + 1}: componenteId vacío`); continue; }
      if (isNaN(cantidad)) { rowErrors.push(`Fila ${i + 1}: cantidad no numérica: ${cantidadRaw}`); continue; }
      if (!itemsById[componente]) { rowErrors.push(`Fila ${i + 1}: componente inexistente: ${componente}`); continue; }

      const key = `${producto}::${alias}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push({ componente, cantidad });
    }

    const previews = Object.entries(groups).map(([key, comps]) => {
      const [producto, alias] = key.split("::");
      const total = comps.reduce((s, c) => s + c.cantidad, 0);
      return { producto, alias, components: comps, total };
    });

    setPreview(previews);
    setErrors(rowErrors);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Importación de listas (preview)</h1>
      <div className="bg-white rounded shadow p-4 space-y-3">
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button
          onClick={handleFile}
          disabled={!file}
          className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 disabled:opacity-50"
        >
          Previsualizar
        </button>
        {errors.length > 0 && (
          <div className="bg-red-50 text-red-800 text-sm rounded p-2 max-h-40 overflow-auto">
            <p className="font-semibold">Errores:</p>
            <ul className="list-disc pl-5">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}
        {preview && (
          <div className="space-y-3">
            {preview.map((p, idx) => (
              <div key={idx} className="bg-gray-50 rounded p-3">
                <p className="font-semibold">{p.producto} — {p.alias || "Sin alias"}</p>
                <p className="text-sm text-gray-600">Total: {p.total.toFixed(2)} kg</p>
                <ul className="text-sm list-disc pl-5">
                  {p.components.map((c: any, i: number) => (
                    <li key={i}>{c.componente}: {c.cantidad} kg</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
