import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import { NUTRIENTES } from "../../lib/calculation";

export default function CatalogPage() {
  const { user, isAdmin, token } = useAuth();
  const [cls, setCls] = useState<"MP" | "PT" | "MZR" | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editNutrients, setEditNutrients] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const items = useQuery(api.catalog.listCatalogItems, {
    class: cls,
    search: search || undefined,
    includeArchived: false,
  });

  const selected = useQuery(
    api.catalog.getCatalogItem,
    selectedId ? { internalId: selectedId } : "skip"
  );

  const updateItem = useMutation(api.catalog.updateCatalogItem);
  const archiveItem = useMutation(api.catalog.archiveCatalogItem);
  const createItem = useMutation(api.catalog.createCatalogItem);

  const [showCreate, setShowCreate] = useState(false);
  const [newItem, setNewItem] = useState<{
    class: "PT" | "MZR";
    name: string;
    externalCode: string;
    tipo: string;
    nutrients: Record<string, number>;
  }>({
    class: "PT",
    name: "",
    externalCode: "",
    tipo: "",
    nutrients: {},
  });

  const canEdit = (itemClass: string) => {
    if (!user) return false;
    if (itemClass === "MP") return true;
    return isAdmin;
  };

  const startEdit = (item: any) => {
    const nutrients: Record<string, number> = {};
    for (const n of NUTRIENTES) {
      const v = item.nutrients?.[n];
      if (typeof v === "number") nutrients[n] = v;
    }
    setEditNutrients(nutrients);
  };

  const saveEdit = async () => {
    if (!selectedId || !user) return;
    setSaving(true);
    await updateItem({
      internalId: selectedId,
      updates: editNutrients,
      actor: user.name,
      token: token ?? undefined,
    });
    setSaving(false);
    setSelectedId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catálogo</h1>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="text-sm bg-emerald-700 text-white px-3 py-1 rounded hover:bg-emerald-800"
          >
            + Crear PT/MZR
          </button>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        <select
          className="border rounded px-3 py-2"
          value={cls ?? ""}
          onChange={(e) =>
            setCls((e.target.value as any) || undefined)
          }
        >
          <option value="">Todas las clases</option>
          <option value="MP">MP</option>
          <option value="PT">PT</option>
          <option value="MZR">MZR</option>
        </select>
        <input
          className="border rounded px-3 py-2 flex-1 min-w-[200px]"
          placeholder="Buscar por nombre, código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow overflow-auto max-h-[70vh]">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Clase</th>
                <th className="px-3 py-2 text-left">Nombre</th>
                <th className="px-3 py-2 text-left">COD</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item) => (
                <tr
                  key={item.internalId}
                  className={`border-t cursor-pointer hover:bg-gray-50 ${
                    selectedId === item.internalId ? "bg-emerald-50" : ""
                  }`}
                  onClick={() => {
                    setSelectedId(item.internalId);
                    if (selected && selected.internalId === item.internalId) {
                      startEdit(selected);
                    }
                  }}
                >
                  <td className="px-3 py-2 font-mono">{item.internalId}</td>
                  <td className="px-3 py-2">{item.class}</td>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">{item.externalCode}</td>
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
                  {selected.name} ({selected.internalId})
                </h2>
                {canEdit(selected.class) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(selected)}
                      className="text-sm bg-emerald-700 text-white px-3 py-1 rounded hover:bg-emerald-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={async () => {
                        if (!user) return;
                        if (confirm("¿Archivar este item?")) {
                          await archiveItem({
                            internalId: selected.internalId,
                            actor: user.name,
                            token: token ?? undefined,
                          });
                          setSelectedId(null);
                        }
                      }}
                      className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Archivar
                    </button>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <p>COD: {selected.externalCode}</p>
                <p>Clase: {selected.class}</p>
                <p>Tipo: {selected.tipo}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {NUTRIENTES.map((n) => {
                  const val = selected.nutrients?.[n];
                  const isEditing = editNutrients.hasOwnProperty(n);
                  return (
                    <div key={n} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                      <span className="font-medium">{n}</span>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          className="w-20 border rounded px-1 text-right"
                          value={editNutrients[n] ?? ""}
                          onChange={(e) =>
                            setEditNutrients((prev) => ({
                              ...prev,
                              [n]: parseFloat(e.target.value),
                            }))
                          }
                        />
                      ) : (
                        <span className="tabular-nums">
                          {typeof val === "number" ? val.toFixed(2) : "—"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {Object.keys(editNutrients).length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => setEditNutrients({})}
                    className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Selecciona un item del catálogo.</p>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-auto">
            <h2 className="text-lg font-semibold">Crear nuevo producto</h2>
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  className="border rounded px-3 py-2"
                  value={newItem.class}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      class: e.target.value as "PT" | "MZR",
                    }))
                  }
                >
                  <option value="PT">PT</option>
                  <option value="MZR">MZR</option>
                </select>
                <input
                  className="border rounded px-3 py-2 flex-1"
                  placeholder="Nombre del producto"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Código externo (opcional)"
                value={newItem.externalCode}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    externalCode: e.target.value,
                  }))
                }
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Tipo (opcional)"
                value={newItem.tipo}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, tipo: e.target.value }))
                }
              />
              <div className="grid grid-cols-3 gap-2 text-sm">
                {NUTRIENTES.map((n) => (
                  <div key={n} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                    <span className="font-medium">{n}</span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-20 border rounded px-1 text-right"
                      value={newItem.nutrients[n] ?? ""}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          nutrients: {
                            ...prev.nutrients,
                            [n]: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!user) return;
                  setSaving(true);
                  await createItem({
                    class: newItem.class,
                    name: newItem.name,
                    externalCode: newItem.externalCode || undefined,
                    tipo: newItem.tipo || undefined,
                    nutrients: newItem.nutrients,
                    actor: user.name,
                    token: token ?? undefined,
                  });
                  setSaving(false);
                  setShowCreate(false);
                  setNewItem({
                    class: "PT",
                    name: "",
                    externalCode: "",
                    tipo: "",
                    nutrients: {},
                  });
                }}
                disabled={saving || !newItem.name}
                className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 disabled:opacity-50"
              >
                {saving ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
