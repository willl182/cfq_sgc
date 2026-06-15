import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { NUTRIENT_KEYS } from "../lib/nutrients";

export default function CatalogView() {
  const items = useQuery(api.catalog.list, { archived: false });
  const updateItem = useMutation(api.catalog.updateItem);
  const [search, setSearch] = useState("");
  const [cls, setCls] = useState<"MP" | "PT" | "MZR" | undefined>(undefined);
  const [editing, setEditing] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<Set<string>>(new Set());

  const filtered = (items || []).filter((i: { class: string; name: string; internalId: string; externalCode: string }) => {
    if (cls && i.class !== cls) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      i.name.toLowerCase().includes(s) ||
      i.internalId.toLowerCase().includes(s) ||
      i.externalCode.toLowerCase().includes(s)
    );
  });

  const handleChange = (internalId: string, key: string, value: string) => {
    setEditing((prev) => ({
      ...prev,
      [internalId]: { ...prev[internalId], [key]: value },
    }));
  };

  const handleSave = async (internalId: string) => {
    const changes = editing[internalId];
    if (!changes) return;
    const updates: Record<string, number> = {};
    for (const [k, v] of Object.entries(changes)) {
      const num = parseFloat(v.replace(",", "."));
      if (!Number.isNaN(num)) updates[k] = num;
    }
    if (Object.keys(updates).length === 0) return;
    setSaving((prev) => new Set(prev).add(internalId));
    try {
      await updateItem({ internalId, updates, actor: "usuario-local" });
      setEditing((prev) => {
        const next = { ...prev };
        delete next[internalId];
        return next;
      });
    } finally {
      setSaving((prev) => {
        const next = new Set(prev);
        next.delete(internalId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Catálogo</h1>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm w-64"
        />
        <select
          value={cls ?? ""}
          onChange={(e) => setCls((e.target.value || undefined) as typeof cls)}
          className="border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="">Todas las clases</option>
          <option value="MP">MP</option>
          <option value="PT">PT</option>
          <option value="MZR">MZR</option>
        </select>
      </div>
      <div className="bg-white border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2 font-medium">ID</th>
              <th className="text-left px-3 py-2 font-medium">Nombre</th>
              <th className="text-left px-3 py-2 font-medium">Clase</th>
              <th className="text-left px-3 py-2 font-medium">Tipo</th>
              {NUTRIENT_KEYS.map((k) => (
                <th key={k} className="text-right px-2 py-2 font-medium text-xs">
                  {k}
                </th>
              ))}
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item: { _id: string; internalId: string; name: string; class: string; type: string; nutrients: Record<string, number> }) => (
              <tr key={item._id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs">{item.internalId}</td>
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-gray-100">
                    {item.class}
                  </span>
                </td>
                <td className="px-3 py-2">{item.type}</td>
                {NUTRIENT_KEYS.map((k) => {
                  const val =
                    editing[item.internalId]?.[k] ??
                    (item.nutrients[k] !== undefined ? String(item.nutrients[k]) : "0");
                  return (
                    <td key={k} className="px-2 py-2">
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleChange(item.internalId, k, e.target.value)}
                        className="w-16 text-right text-xs border rounded px-1 py-0.5"
                      />
                    </td>
                  );
                })}
                <td className="px-3 py-2">
                  <button
                    onClick={() => handleSave(item.internalId)}
                    disabled={saving.has(item.internalId) || !editing[item.internalId]}
                    className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving.has(item.internalId) ? "Guardando..." : "Guardar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}