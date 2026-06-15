import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { NUTRIENT_KEYS } from "../lib/nutrients";
import type { Id } from "../../convex/_generated/dataModel";

export default function SnapshotsView() {
  const snapshots = useQuery(api.lists.listSnapshots, {});
  const [selectedId, setSelectedId] = useState<Id<"productListSnapshots"> | null>(null);
  const selected = useQuery(api.lists.getSnapshot, selectedId ? { id: selectedId } : "skip");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Histórico de snapshots</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg overflow-auto max-h-[70vh]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 sticky top-0">
              <tr>
                <th className="text-left px-3 py-2 font-medium">v</th>
                <th className="text-left px-3 py-2 font-medium">Estado</th>
                <th className="text-left px-3 py-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(snapshots || []).map((s: { _id: Id<"productListSnapshots">; snapshotVersion: number; generalStatus: string; createdAt: number }) => (
                <tr
                  key={s._id}
                  onClick={() => setSelectedId(s._id)}
                  className={`border-t cursor-pointer hover:bg-gray-50 ${selectedId === s._id ? "bg-emerald-50" : ""}`}
                >
                  <td className="px-3 py-2 font-mono">{s.snapshotVersion}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${
                        s.generalStatus === "CUMPLE"
                          ? "bg-green-100 text-green-800"
                          : s.generalStatus === "CUMPLE_S"
                          ? "bg-amber-100 text-amber-800"
                          : s.generalStatus === "NO_CUMPLE"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {s.generalStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {new Date(s.createdAt).toLocaleString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:col-span-2 bg-white border rounded-lg p-4 space-y-3">
          {selected ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Snapshot v{selected.snapshotVersion}</h2>
                <span className="text-xs text-gray-500">{selected.user}</span>
              </div>
              <div className="text-sm">
                <p>Objetivo: {selected.targetProductId || "Sin objetivo"}</p>
                <p>Total kg: {selected.totalKg.toFixed(2)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {NUTRIENT_KEYS.map((k) => {
                  const ev = selected.evaluation[k];
                  return (
                    <div key={k} className="flex items-center justify-between px-2 py-1 rounded bg-gray-50">
                      <span className="font-medium text-gray-600">{k}</span>
                      <span className="font-mono">
                        {ev?.valor.toFixed(2) ?? "—"}
                        {ev && selected.targetSnapshot && selected.targetSnapshot[k] > 0 && (
                          <span
                            className={`ml-2 text-xs font-bold ${
                              ev.estado === "C"
                                ? "text-green-600"
                                : ev.estado === "SUP"
                                ? "text-amber-600"
                                : "text-red-600"
                            }`}
                          >
                            {ev.estado}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
              {selected.alerts.length > 0 && (
                <div className="text-sm text-amber-700 bg-amber-50 rounded-md px-3 py-2">
                  {selected.alerts.map((a: string, i: number) => (
                    <p key={i}>{a}</p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">Selecciona un snapshot para ver detalles.</p>
          )}
        </div>
      </div>
    </div>
  );
}