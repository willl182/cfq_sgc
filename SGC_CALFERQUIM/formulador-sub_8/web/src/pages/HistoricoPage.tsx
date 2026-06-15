import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Clock } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function HistoricoPage() {
  const lists: any = useQuery(api.queries.getProductLists, {});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        <Clock size={24} className="inline mr-2" />
        Histórico de Snapshots
      </h2>

      {lists === undefined ? (
        <div className="text-center py-12 text-slate-400">
          Cargando...
        </div>
      ) : (lists as any[]).length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Clock size={32} className="mx-auto mb-2" />
          No hay listas guardadas aún.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Código
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Nombre
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Total
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Estado
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Versión
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Actualizado
                </th>
              </tr>
            </thead>
            <tbody>
              {(lists as any[]).map((list: any) => (
                <tr
                  key={list._id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 font-mono text-xs text-blue-700">
                    {list.displayCode}
                  </td>
                  <td className="px-3 py-2 text-slate-800">
                    {list.nombre || "—"}
                  </td>
                  <td className="px-3 py-2 text-sm">{list.totalKg} kg</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        list.estadoGeneral === "CUMPLE"
                          ? "bg-green-100 text-green-700"
                          : list.estadoGeneral === "CUMPLE_S"
                          ? "bg-amber-100 text-amber-700"
                          : list.estadoGeneral === "NO_CUMPLE"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {list.estadoGeneral ?? "SIN_OBJETIVO"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm">
                    v{list.snapshotVersion ?? 0}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-400">
                    {new Date(list.updatedAt).toLocaleString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}