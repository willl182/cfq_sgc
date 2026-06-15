import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import { calcularComposicion, NUTRIENTES, MINIMOS_NPK, suggestAlternatives } from "../../lib/calculation";
import { evaluarTolerancia } from "../../lib/tolerancia";
import type { CatalogItem } from "../../lib/calculation";
import type { Id } from "../../convex/_generated/dataModel";

const DRAFT_KEY = "cfq_formulate_draft";

export default function FormulatePage() {
  const { user, isAdmin } = useAuth();
  const [targetId, setTargetId] = useState<string>("");
  const [components, setComponents] = useState<
    { internalId: string; quantityKg: number }[]
  >([]);
  const [alias, setAlias] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [suggestions, setSuggestions] = useState<Record<number, { item: CatalogItem; similarity: number }[]>>({});

  const catalogItems = useQuery(api.catalog.listCatalogItems, {
    includeArchived: false,
  });

  const target = useMemo(() => {
    if (!catalogItems || !targetId) return null;
    return catalogItems.find((i) => i.internalId === targetId) ?? null;
  }, [catalogItems, targetId]);

  const itemsById = useMemo(() => {
    if (!catalogItems) return {};
    const map: Record<string, any> = {};
    for (const i of catalogItems) {
      map[i.internalId] = i;
    }
    return map;
  }, [catalogItems]);

  const { composition, totalKg, evaluation } = useMemo(() => {
    const comps = components.map((c) => ({
      catalogItemId: c.internalId,
      internalId: c.internalId,
      quantityKg: c.quantityKg,
      item: itemsById[c.internalId] as CatalogItem | undefined,
    }));
    const { composition, totalKg } = calcularComposicion(comps, itemsById as any);
    const evaluation = evaluarTolerancia(composition, totalKg, target as any);
    return { composition, totalKg, evaluation };
  }, [components, itemsById, target]);

  const addComponent = () => {
    setComponents((prev) => [...prev, { internalId: "", quantityKg: 0 }]);
  };

  const removeComponent = (idx: number) => {
    setComponents((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateComponent = (idx: number, patch: Partial<(typeof components)[0]>) => {
    setComponents((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, ...patch } : c))
    );
  };

  // Cargar borrador al montar
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        if (draft.components) setComponents(draft.components);
        if (draft.targetId) setTargetId(draft.targetId);
        if (draft.alias) setAlias(draft.alias);
      } catch {
        // ignore
      }
    }
  }, []);

  // Autosave borrador con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ components, targetId, alias })
      );
      setLastSaved(new Date());
    }, 1500);
    return () => clearTimeout(timer);
  }, [components, targetId, alias]);

  const saveMutation = useMutation(api.lists.saveProductList);

  const saveList = async () => {
    if (!user) return;
    setSaving(true);
    const catalogItemsArray = catalogItems ?? [];
    const enrichedComponents = components
      .map((c) => {
        const item = catalogItemsArray.find((i) => i.internalId === c.internalId);
        if (!item) return null;
        return {
          catalogItemId: item._id,
          internalId: c.internalId,
          quantityKg: c.quantityKg,
        };
      })
      .filter(Boolean) as { catalogItemId: Id<"catalogItems">; internalId: string; quantityKg: number }[];

    const targetItem = catalogItemsArray.find((i) => i.internalId === targetId);

    await saveMutation({
      displayCode: targetId
        ? `${targetId}-L001`
        : `BORRADOR-L${String(components.length + 1).padStart(3, "0")}`,
      targetProductId: targetItem?._id,
      alias: alias || undefined,
      components: enrichedComponents,
      user: user.name,
    });
    setSaving(false);
    alert("Lista guardada y snapshot creado.");
  };

  const alertas: string[] = [];
  const diffKg = Math.abs(totalKg - 1000);
  if (diffKg > 0.01) {
    alertas.push(`Total ${totalKg.toFixed(2)} kg ≠ 1000 kg (dif. ${diffKg.toFixed(2)} kg)`);
  }
  if (evaluation.generalStatus === "NO_CUMPLE") {
    alertas.push("No cumple tolerancia");
  }
  // Validación mínimos NPK
  if (totalKg > 0) {
    const npk = (composition["N"] ?? 0) + (composition["P"] ?? 0) + (composition["K"] ?? 0);
    if (npk < MINIMOS_NPK.SOLIDO_EDAFICO) {
      alertas.push(`N+P+K = ${npk.toFixed(2)}% < ${MINIMOS_NPK.SOLIDO_EDAFICO}% (mínimo sólido edáfico)`);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Formulación</h1>

      <div className="bg-white rounded shadow p-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Producto objetivo (PT)</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            >
              <option value="">— Sin objetivo —</option>
              {catalogItems
                ?.filter((i) => i.class === "PT" || i.class === "MZR")
                .map((i) => (
                  <option key={i.internalId} value={i.internalId}>
                    {i.internalId} — {i.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Alias de lista</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Ej: Fórmula de prueba"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Componentes</h2>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-gray-500">
                  Borrador guardado {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={addComponent}
                className="text-sm bg-emerald-700 text-white px-3 py-1 rounded hover:bg-emerald-800"
              >
                + Agregar
              </button>
            </div>
          </div>
          {!catalogItems && (
            <p className="text-sm text-gray-500">Cargando catálogo...</p>
          )}
          {components.map((comp, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex gap-2 items-center">
                <select
                  className="flex-1 border rounded px-3 py-2"
                  value={comp.internalId}
                  onChange={(e) =>
                    updateComponent(idx, { internalId: e.target.value })
                  }
                >
                  <option value="">— Seleccionar MP —</option>
                  {catalogItems
                    ?.filter((i) => i.class === "MP")
                    .map((i) => (
                      <option key={i.internalId} value={i.internalId}>
                        {i.internalId} — {i.name}
                      </option>
                    ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  className="w-32 border rounded px-3 py-2"
                  placeholder="kg"
                  value={comp.quantityKg || ""}
                  onChange={(e) =>
                    updateComponent(idx, {
                      quantityKg: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <button
                  onClick={() => {
                    const item = itemsById[comp.internalId];
                    if (!item || !catalogItems) return;
                    const alts = suggestAlternatives(
                      item,
                      catalogItems.filter((i) => i.class === "MP"),
                      3
                    );
                    setSuggestions((prev) => ({ ...prev, [idx]: alts }));
                  }}
                  disabled={!comp.internalId}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                >
                  Sugerir
                </button>
                <button
                  onClick={() => removeComponent(idx)}
                  className="text-red-600 px-2 py-1 hover:bg-red-50 rounded"
                >
                  ✕
                </button>
              </div>
              {suggestions[idx] && suggestions[idx].length > 0 && (
                <div className="bg-blue-50 text-blue-800 text-xs rounded p-2 space-y-1">
                  <p className="font-semibold">Alternativas similares:</p>
                  {suggestions[idx].map((alt, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span>
                        {alt.item.internalId} — {alt.item.name} (sim. {alt.similarity})
                      </span>
                      <button
                        onClick={() => {
                          updateComponent(idx, {
                            internalId: alt.item.internalId,
                          });
                          setSuggestions((prev) => {
                            const next = { ...prev };
                            delete next[idx];
                            return next;
                          });
                        }}
                        className="text-blue-700 underline"
                      >
                        Usar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total: {totalKg.toFixed(2)} kg</span>
            <span className="font-semibold">
              Estado: {evaluation.generalStatus}
            </span>
          </div>
          {/* Barra de progreso de kg */}
          <div className="w-full bg-gray-200 rounded h-2">
            <div
              className={`h-2 rounded transition-all ${
                diffKg < 0.1 ? "bg-emerald-500" : diffKg < 50 ? "bg-yellow-400" : "bg-red-500"
              }`}
              style={{ width: `${Math.min((totalKg / 1000) * 100, 100)}%` }}
            />
          </div>
          {alertas.length > 0 && (
            <div className="bg-yellow-50 text-yellow-800 text-sm rounded p-2">
              {alertas.map((a, i) => (
                <p key={i}>⚠ {a}</p>
              ))}
            </div>
          )}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 text-xs">
            {NUTRIENTES.map((n) => {
              const val = composition[n];
              const ev = evaluation.byNutrient[n];
              const badge =
                ev === "C"
                  ? "text-green-700"
                  : ev === "SUP"
                  ? "text-blue-700"
                  : ev === "NC"
                  ? "text-red-700"
                  : "text-gray-500";
              return (
                <div key={n} className={`bg-white rounded px-2 py-1 ${badge}`}>
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

        <div className="flex justify-end">
          <button
            onClick={saveList}
            disabled={saving || components.length === 0}
            className="bg-emerald-700 text-white px-6 py-2 rounded hover:bg-emerald-800 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar lista"}
          </button>
        </div>
      </div>
    </div>
  );
}
