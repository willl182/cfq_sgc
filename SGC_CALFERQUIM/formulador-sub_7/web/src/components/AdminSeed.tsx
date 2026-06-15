import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AdminSeed() {
  const seed = useMutation(api.seed.seedFromCsv);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    rowsRead: number;
    inserted: number;
    rejected: number;
    errors: string[];
  } | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    const text = await file.text();
    try {
      const res = await seed({ csvText: text, actor: "admin-local" });
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setResult({ success: false, message: msg, rowsRead: 0, inserted: 0, rejected: 0, errors: [msg] });
    } finally {
      setLoading(false);
    }
  }, [file, seed]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Carga inicial de catálogo</h1>
      <div className="bg-white border rounded-lg p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archivo CSV (mp-pt_mzr.csv)
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Cargando..." : "Ejecutar carga inicial"}
        </button>
        {result && (
          <div className={`rounded-md p-3 text-sm ${result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            <p className="font-medium">{result.message}</p>
            <p>Filas leídas: {result.rowsRead} | Insertados: {result.inserted} | Rechazados: {result.rejected}</p>
            {result.errors.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-xs">
                {result.errors.slice(0, 20).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
                {result.errors.length > 20 && <li>...y {result.errors.length - 20} errores más</li>}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}