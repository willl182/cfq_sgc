/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { parseCSV, assignInternalIds } from "../lib/csvParser";
import type { Clase } from "../lib/constants";
import { NUTRIENT_KEYS, CLASE_LABELS, TIPO_LABELS } from "../lib/constants";
import { Search, Upload, Database } from "lucide-react";

interface CatalogPageProps {
  isAdmin: boolean;
}

export function CatalogPage({ isAdmin }: CatalogPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClase, setFilterClase] = useState<Clase | "">("");
  const [seedResult, setSeedResult] = useState<{
    inserted: number;
    rejected: number;
    errors: string[];
  } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const catalog: any = useQuery(api.queries.getCatalog, {
    clase: filterClase || undefined,
    search: searchTerm || undefined,
  });

  const isCatalogEmpty: any = useQuery(api.queries.isCatalogEmpty);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seedMutation: any = useMutation(api.mutations.seedCatalog);
  const catalogCounts: any = useQuery(api.queries.getCatalogCounts);

  const handleCSVUpload =
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!isCatalogEmpty) {
        alert("El catálogo ya tiene datos. No se puede cargar CSV.");
        return;
      }

      setIsSeeding(true);
      setSeedResult(null);

      try {
        const text = await file.text();
        const parsed = parseCSV(text);
        const items = assignInternalIds(parsed.filas);

        if (parsed.errores.length > 0) {
          console.warn("Errores de parseo:", parsed.errores);
        }

        const seedItems = items.map((item) => ({
          internalId: item.internalId,
          externalCode: item.externalCode,
          originalCode: item.externalCode,
          nombre: item.nombre,
          clase: item.clase,
          tipo: item.tipo as "G" | "P" | "L" | "C",
          composicion: item.composicion,
        }));

        const result = await seedMutation({
          items: seedItems,
          actor: isAdmin ? "admin-local" : "user",
        });

        setSeedResult(result);
      } catch (err) {
        setSeedResult({
          inserted: 0,
          rejected: 0,
          errors: [String(err)],
        });
      } finally {
        setIsSeeding(false);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Catálogo</h2>
          <p className="text-sm text-slate-500">
            {catalogCounts
              ? `${catalogCounts.total} items (MP: ${catalogCounts.MP}, PT: ${catalogCounts.PT}, MZR: ${catalogCounts.MZR})`
              : "Cargando..."}
          </p>
        </div>

        {isAdmin && isCatalogEmpty && (
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
            <Upload size={16} />
            <span>{isSeeding ? "Cargando..." : "Cargar CSV"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVUpload}
              disabled={isSeeding}
            />
          </label>
        )}
      </div>

      {/* Seed result */}
      {seedResult && (
        <div
          className={`mb-4 p-4 rounded-lg border ${
            seedResult.errors.length > 0
              ? "bg-amber-50 border-amber-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <p className="font-medium text-sm">
            ✅ Insertados: {seedResult.inserted} | Rechazados:{" "}
            {seedResult.rejected}
          </p>
          {seedResult.errors.slice(0, 10).map((err, i) => (
            <p key={i} className="text-xs text-red-600">
              {err}
            </p>
          ))}
          {seedResult.errors.length > 10 && (
            <p className="text-xs text-red-600">
              ... y {seedResult.errors.length - 10} errores más
            </p>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar por nombre, código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(["MP", "PT", "MZR"] as Clase[]).map((clase) => (
          <button
            key={clase}
            onClick={() => setFilterClase(filterClase === clase ? "" : clase)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              filterClase === clase
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {CLASE_LABELS[clase]}
          </button>
        ))}
      </div>

      {/* Table */}
      {catalog === undefined ? (
        <div className="text-center py-12 text-slate-400">
          <Database size={32} className="mx-auto mb-2" />
          Cargando catálogo...
        </div>
      ) : catalog.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Database size={32} className="mx-auto mb-2" />
          {isCatalogEmpty
            ? "Catálogo vacío. Cargue el CSV como admin."
            : "No se encontraron resultados."}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    ID
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    COD
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Nombre
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Clase
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Tipo
                  </th>
                  {NUTRIENT_KEYS.slice(0, 6).map((k) => (
                    <th
                      key={k}
                      className="px-2 py-2 text-right font-medium text-slate-500 text-xs"
                    >
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(catalog as any[]).slice(0, 50).map((item: any) => (
                  <tr
                    key={item._id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 font-mono text-xs text-blue-700 whitespace-nowrap">
                      {item.internalId}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {item.externalCode}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-800">
                      {item.nombre}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          item.clase === "MP"
                            ? "bg-blue-100 text-blue-700"
                            : item.clase === "PT"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.clase}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {TIPO_LABELS[item.tipo as keyof typeof TIPO_LABELS] ?? item.tipo}
                    </td>
                    {NUTRIENT_KEYS.slice(0, 6).map((k) => (
                      <td
                        key={k}
                        className="px-2 py-2 text-right text-xs text-slate-600"
                      >
                        {(item.composicion as Record<string, number>)[k] || 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {catalog.length > 50 && (
            <p className="text-center py-2 text-xs text-slate-400">
              Mostrando 50 de {catalog.length} resultados
            </p>
          )}
        </div>
      )}
    </div>
  );
}