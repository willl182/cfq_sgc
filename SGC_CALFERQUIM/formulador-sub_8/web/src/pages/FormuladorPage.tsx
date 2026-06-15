import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { calcularComposicion, type Composicion } from "../lib/formulas";
import { evaluarComposicion } from "../lib/tolerancias";
import { FlaskConical, Trash2, AlertTriangle } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface FormuladorPageProps {
  isAdmin: boolean;
}

interface ComponenteLocal {
  catalogItemId: string;
  internalId: string;
  nombre: string;
  clase: string;
  cantidadKg: number;
  composicion: Composicion;
}

export function FormuladorPage(_props: FormuladorPageProps) {
  const catalog: any = useQuery(api.queries.getCatalogAll);
  const [targetId, setTargetId] = useState<string>("");
  const [componentes, setComponentes] = useState<ComponenteLocal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const catalogList: any[] = catalog ?? [];

  // Filtrar catálogo para agregar componentes
  const availableItems = catalogList
    .filter(
      (item: any) =>
        !componentes.some((c) => c.internalId === item.internalId)
    )
    .filter((item: any) =>
      searchTerm
        ? item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.internalId.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );

  // Calcular composición en tiempo real (preview client-side)
  const calculation = calcularComposicion(
    componentes.map((c) => ({
      cantidadKg: c.cantidadKg,
      composicion: c.composicion,
    }))
  );

  // Buscar target (PT objetivo)
  const target: any = catalogList.find((i: any) => i._id === targetId);

  const evaluacion = evaluarComposicion(
    calculation.composicionCalculada,
    target ? (target.composicion as Record<string, number>) : null
  );

  const addComponente = (item: any) => {
    setComponentes((prev) => [
      ...prev,
      {
        catalogItemId: item._id,
        internalId: item.internalId,
        nombre: item.nombre,
        clase: item.clase,
        cantidadKg: 0,
        composicion: item.composicion as Composicion,
      },
    ]);
  };

  const removeComponente = (idx: number) => {
    setComponentes((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateCantidad = (idx: number, cantidad: number) => {
    setComponentes((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, cantidadKg: cantidad } : c))
    );
  };

  const ptItems = catalogList.filter(
    (i: any) => i.clase === "PT" || i.clase === "MZR"
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        <FlaskConical size={24} className="inline mr-2" />
        Formulador
      </h2>

      {/* PT Objetivo */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Producto Terminado Objetivo (opcional)
        </label>
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— Sin objetivo (borrador) —</option>
          {ptItems.map((item: any) => (
            <option key={item._id} value={item._id}>
              {item.internalId} — {item.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Componentes */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <h3 className="font-semibold text-slate-700 mb-3">Componentes</h3>

        {componentes.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 text-center">
            Agregue componentes usando el buscador de abajo
          </p>
        ) : (
          <div className="space-y-2 mb-4">
            {componentes.map((comp, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-slate-50 rounded-md p-2"
              >
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    comp.clase === "MP"
                      ? "bg-blue-100 text-blue-700"
                      : comp.clase === "PT"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {comp.internalId}
                </span>
                <span className="text-sm text-slate-800 flex-1">
                  {comp.nombre}
                </span>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  step={0.01}
                  value={comp.cantidadKg || ""}
                  onChange={(e) =>
                    updateCantidad(idx, parseFloat(e.target.value) || 0)
                  }
                  className="w-24 px-2 py-1 border border-slate-200 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="kg"
                />
                <span className="text-xs text-slate-500 w-6">kg</span>
                <button
                  onClick={() => removeComponente(idx)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Total:</span>
          <span
            className={`font-bold ${
              calculation.totalKg === 1000
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {calculation.totalKg.toFixed(2)} kg
          </span>
        </div>

        {calculation.alertas.length > 0 && (
          <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
            <AlertTriangle size={14} />
            {calculation.alertas[0]}
          </div>
        )}

        {/* Buscador */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <input
            type="text"
            placeholder="Buscar MP, PT o MZR para agregar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && availableItems.length > 0 && (
            <div className="mt-2 max-h-40 overflow-auto border border-slate-100 rounded-md">
              {availableItems.slice(0, 20).map((item: any) => (
                <button
                  key={item._id}
                  onClick={() => {
                    addComponente(item);
                    setSearchTerm("");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 text-left transition-colors"
                >
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      item.clase === "MP"
                        ? "bg-blue-50 text-blue-600"
                        : item.clase === "PT"
                        ? "bg-green-50 text-green-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {item.internalId}
                  </span>
                  <span className="text-slate-700">{item.nombre}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resultados calculados */}
      {(componentes.length > 0 || targetId) && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">
              Composición Calculada
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                evaluacion.estadoGeneral === "CUMPLE"
                  ? "bg-green-100 text-green-700"
                  : evaluacion.estadoGeneral === "CUMPLE_S"
                  ? "bg-amber-100 text-amber-700"
                  : evaluacion.estadoGeneral === "NO_CUMPLE"
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {evaluacion.estadoGeneral === "CUMPLE"
                ? "✓ CUMPLE"
                : evaluacion.estadoGeneral === "CUMPLE_S"
                ? "⚠ CUMPLE con SUPERACIÓN"
                : evaluacion.estadoGeneral === "NO_CUMPLE"
                ? "✗ NO CUMPLE"
                : "SIN OBJETIVO"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-2 py-1 text-left text-xs font-medium text-slate-600">
                    Nutriente
                  </th>
                  <th className="px-2 py-1 text-right text-xs font-medium text-slate-600">
                    Calculado
                  </th>
                  {targetId && (
                    <>
                      <th className="px-2 py-1 text-right text-xs font-medium text-slate-600">
                        Declarado
                      </th>
                      <th className="px-2 py-1 text-right text-xs font-medium text-slate-600">
                        Tolerancia
                      </th>
                      <th className="px-2 py-1 text-right text-xs font-medium text-slate-600">
                        Mín
                      </th>
                      <th className="px-2 py-1 text-right text-xs font-medium text-slate-600">
                        Máx
                      </th>
                      <th className="px-2 py-1 text-center text-xs font-medium text-slate-600">
                        Estado
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {evaluacion.evaluaciones
                  .filter(
                    (ev) =>
                      ev.calculado > 0 || ev.declarado > 0
                  )
                  .map((ev) => (
                    <tr
                      key={ev.nutriente}
                      className="border-b border-slate-50"
                    >
                      <td className="px-2 py-1 font-mono text-xs">
                        {ev.nutriente}
                      </td>
                      <td className="px-2 py-1 text-right">
                        {ev.calculado.toFixed(2)}
                      </td>
                      {targetId && (
                        <>
                          <td className="px-2 py-1 text-right text-slate-500">
                            {ev.declarado.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-right text-slate-400 text-xs">
                            ±{ev.tolerancia.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-right text-slate-400 text-xs">
                            {ev.min.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-right text-slate-400 text-xs">
                            {ev.max.toFixed(2)}
                          </td>
                          <td
                            className={`px-2 py-1 text-center text-xs font-bold ${
                              ev.estado === "C"
                                ? "text-green-600"
                                : ev.estado === "NC"
                                ? "text-red-600"
                                : "text-amber-600"
                            }`}
                          >
                            {ev.declarado > 0 ? ev.estado : "—"}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}