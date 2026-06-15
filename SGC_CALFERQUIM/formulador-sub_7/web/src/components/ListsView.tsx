import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ListsView() {
  const lists = useQuery(api.lists.listAll, { archived: false });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Recetas guardadas</h1>
      <div className="bg-white border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Código</th>
              <th className="text-left px-3 py-2 font-medium">Alias</th>
              <th className="text-left px-3 py-2 font-medium">Objetivo</th>
              <th className="text-left px-3 py-2 font-medium">Componentes</th>
              <th className="text-right px-3 py-2 font-medium">Total kg</th>
            </tr>
          </thead>
          <tbody>
            {(lists || []).map((l: { _id: string; displayCode: string; alias?: string; targetProductId?: string; components: unknown[]; totalKg: number }) => (
              <tr key={l._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs">{l.displayCode}</td>
                <td className="px-3 py-2">{l.alias || "—"}</td>
                <td className="px-3 py-2">{l.targetProductId || "Sin objetivo"}</td>
                <td className="px-3 py-2">{l.components.length}</td>
                <td className="px-3 py-2 text-right font-mono">{l.totalKg.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}