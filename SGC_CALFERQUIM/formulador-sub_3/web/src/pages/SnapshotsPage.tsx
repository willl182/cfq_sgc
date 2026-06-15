import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import { NUTRIENTES } from "../../lib/calculation";

export default function SnapshotsPage() {
  const { user, isAdmin } = useAuth();
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);

  const snapshots = useQuery(api.lists.listSnapshots, {
    includeArchived: false,
  });

  const selected = useQuery(
    api.lists.getSnapshot,
    selectedSnapshotId ? { id: selectedSnapshotId as any } : "skip"
  );

  const archive = useMutation(api.lists.archiveSnapshot);
  const clone = useMutation(api.lists.cloneSnapshotToList);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Histórico de Snapshots</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow overflow-auto max-h-[70vh]">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left">Lista</th>
                <th className="px-3 py-2 text-left">Versión</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Total kg</th>
                <th className="px-3 py-2 text-left">Usuario</th>
                <th className="px-3 py-2 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {snapshots?.map((snap) => (
                <tr
                  key={snap._id}
                  className={`border-t cursor-pointer hover:bg-gray-50 ${
                    selectedSnapshotId === snap._id ? "bg-emerald-50" : ""
                  }`}
                  onClick={() => setSelectedSnapshotId(snap._id)}
                >
                  <td className="px-3 py-2">{snap.productListId}</td>
                  <td className="px-3 py-2">v{snap.snapshotVersion}</td>
                  <td className="px-3 py-2">{snap.generalStatus}</td>
                  <td className="px-3 py-2">{snap.totalKg.toFixed(2)}</td>
                  <td className="px-3 py-2">{snap.user}</td>
                  <td className="px-3 py-2">
                    {new Date(snap.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded shadow p-4">
          {selected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">
                  Snapshot v{selected.snapshotVersion}
                </h2>
                <div className="flex gap-2">
                  {isAdmin && (
                    <button
                      onClick={async () => {
                        if (confirm("¿Archivar este snapshot?")) {
                          await archive({
                            snapshotId: selected._id,
                            actor: user.name,
                          });
                          setSelectedSnapshotId(null);
                        }
                      }}
                      className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Archivar
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      if (!user) return;
                      await clone({
                        snapshotId: selected._id,
                        user: user.name,
                      });
                      alert("Snapshot clonado a nueva lista.");
                    }}
                    className="text-sm bg-emerald-700 text-white px-3 py-1 rounded hover:bg-emerald-800"
                  >
                    Clonar
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Lista: {selected.productListId}</p>
                <p>Total: {selected.totalKg.toFixed(2)} kg</p>
                <p>Estado: {selected.evaluation.generalStatus}</p>
              </div>
              {selected.alerts.length > 0 && (
                <div className="bg-yellow-50 text-yellow-800 text-sm rounded p-2">
                  {selected.alerts.map((a, i) => (
                    <p key={i}>⚠ {a}</p>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Componentes</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 text-left">Item</th>
                      <th className="px-2 py-1 text-right">kg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.components.map((c, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-1">
                          {c.name} ({c.internalId})
                        </td>
                        <td className="px-2 py-1 text-right">
                          {c.quantityKg.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Composición calculada</h3>
                <div className="grid grid-cols-4 gap-1 text-xs">
                  {NUTRIENTES.map((n) => {
                    const val = selected.calculatedComposition[n];
                    const ev = selected.evaluation.byNutrient[n];
                    const badge =
                      ev === "C"
                        ? "text-green-700"
                        : ev === "SUP"
                        ? "text-blue-700"
                        : ev === "NC"
                        ? "text-red-700"
                        : "text-gray-500";
                    return (
                      <div key={n} className={`bg-gray-50 rounded px-2 py-1 ${badge}`}>
                        <span className="font-medium">{n}:</span>{" "}
                        {typeof val === "number" ? val.toFixed(2) : "—"}
                        {ev && ev !== "NA" && (
                          <span className="ml-1 text-[10px] uppercase">[{ev}]</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Selecciona un snapshot del listado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
