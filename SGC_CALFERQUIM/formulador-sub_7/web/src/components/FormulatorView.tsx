import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  NUTRIENT_KEYS,
  calcularComposicion,
  evaluarLista,
  round2,
  round4,
  type NutrientRecord,
} from "../lib/nutrients";

export default function FormulatorView() {
  const items = useQuery(api.catalog.list, { archived: false });
  const saveList = useMutation(api.lists.saveList);

  const [targetId, setTargetId] = useState("");
  const [alias, setAlias] = useState("");
  const [components, setComponents] = useState<{ internalId: string; cantidadKg: number }[]>([
    { internalId: "", cantidadKg: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const catalogMap = useMemo(() => {
    const map = new Map<string, { name: string; nutrients: NutrientRecord }>();
    for (const i of items || []) {
      map.set(i.internalId, { name: i.name, nutrients: i.nutrients as NutrientRecord });
    }
    return map;
  }, [items]);

  const targetProduct = targetId ? catalogMap.get(targetId) ?? null : null;

  const enriched = useMemo(() => {
    return components
      .map((c) => {
        const item = catalogMap.get(c.internalId);
        if (!item) return null;
        return { internalId: c.internalId, cantidadKg: c.cantidadKg, nutrients: item.nutrients };
      })
      .filter(Boolean) as { internalId: string; cantidadKg: number; nutrients: NutrientRecord }[];
  }, [components, catalogMap]);

  const composicion = useMemo(() => calcularComposicion(enriched), [enriched]);
  const { evaluation, generalStatus, alerts: evalAlerts } = useMemo(
    () => evaluarLista(composicion, targetProduct?.nutrients ?? null),
    [composicion, targetProduct]
  );

  const totalKg = useMemo(() => components.reduce((s, c) => s + c.cantidadKg, 0), [components]);

  const addComponent = () =>
    setComponents((prev) => [...prev, { internalId: "", cantidadKg: 0 }]);
  const removeComponent = (idx: number) =>
    setComponents((prev) => prev.filter((_, i) => i !== idx));
  const updateComponent = (idx: number, patch: Partial<(typeof components)[0]>) =>
    setComponents((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

  const handleSave = async () => {
    const valid = components.filter((c) => c.internalId && c.cantidadKg > 0);
    if (valid.length === 0) return;
    setSaving(true);
    try {
      const res = await saveList({
        targetProductId: targetId || undefined,
        alias: alias || undefined,
        components: valid,
        user: "usuario-local",
      });
      setLastSaved(`Guardado: ${res.listId} (v${res.version})`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastSaved(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Formulador</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Producto objetivo (PT)</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Sin objetivo (borrador)</option>
              {(items || [])
                .filter((i: { class: string }) => i.class === "PT" || i.class === "MZR")
                .map((i: { internalId: string; name: string }) => (
                  <option key={i.internalId} value={i.internalId}>
                    {i.internalId} — {i.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Alias</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Ej: Fórmula 1"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Componentes</label>
            {components.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={c.internalId}
                  onChange={(e) => updateComponent(idx, { internalId: e.target.value })}
                  className="flex-1 border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {(items || []).map((i: { internalId: string; name: string; class: string }) => (
                    <option key={i.internalId} value={i.internalId}>
                      {i.internalId} — {i.name} ({i.class})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  max={1000}
                  value={c.cantidadKg}
                  onChange={(e) => updateComponent(idx, { cantidadKg: parseFloat(e.target.value) || 0 })}
                  className="w-24 border rounded-md px-3 py-2 text-sm"
                  placeholder="kg"
                />
                <button
                  onClick={() => removeComponent(idx)}
                  className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addComponent}
              className="px-3 py-1.5 border rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              + Agregar componente
            </button>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || enriched.length === 0}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar lista"}
            </button>
            {lastSaved && <span className="text-sm text-gray-600">{lastSaved}</span>}
          </div>
          {(Math.abs(totalKg - 1000) > 0.01 || evalAlerts.length > 0) && (
            <div className="text-sm text-amber-700 bg-amber-50 rounded-md px-3 py-2 space-y-1">
              {Math.abs(totalKg - 1000) > 0.01 && (
                <p>⚠️ Total {round2(totalKg)} kg ≠ 1000 kg</p>
              )}
              {evalAlerts.map((a, i) => (
                <p key={i}>⚠️ {a}</p>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">Composición calculada</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {NUTRIENT_KEYS.map((k) => {
              const val = round4(composicion[k]);
              const ev = evaluation[k];
              const targetVal = targetProduct?.nutrients[k];
              return (
                <div key={k} className="flex items-center justify-between px-2 py-1 rounded bg-gray-50">
                  <span className="font-medium text-gray-600">{k}</span>
                  <span className="font-mono">
                    {round2(val)}
                    {targetVal && targetVal > 0 && ev && (
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
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm font-medium">Estado:</span>
            <span
              className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                generalStatus === "CUMPLE"
                  ? "bg-green-100 text-green-800"
                  : generalStatus === "CUMPLE_S"
                  ? "bg-amber-100 text-amber-800"
                  : generalStatus === "NO_CUMPLE"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {generalStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}