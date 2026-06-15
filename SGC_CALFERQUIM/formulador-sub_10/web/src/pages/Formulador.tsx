import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Trash2, Save, AlertCircle } from "lucide-react";
import { NUTRIENTS_INFO } from "../lib/nutrients";
import StatusBadge from "../components/StatusBadge";
import {
  calculateFinalComposition,
  calculateTotalKg,
  type Composition,
  type Component,
} from "../../convex/lib/formulas";
import { evaluateTolerance, type ToleranceEvaluation } from "../../convex/lib/tolerances";
import type { Doc } from "../../convex/_generated/dataModel";

type CatalogItem = Doc<"catalogItems">;

interface LocalComponent {
  catalogItem: CatalogItem;
  quantityKg: number;
}

export default function Formulador() {
  const [targetProduct, setTargetProduct] = useState<CatalogItem | null>(null);
  const [components, setComponents] = useState<LocalComponent[]>([]);
  const [calculatedComposition, setCalculatedComposition] = useState<Composition | null>(null);
  const [toleranceEvaluation, setToleranceEvaluation] = useState<ToleranceEvaluation | null>(null);
  const [totalKg, setTotalKg] = useState<number>(0);
  const [listName, setListName] = useState<string>("");
  
  const catalogItems = useQuery(api.catalog.list, {});
  const saveMutation = useMutation(api.lists.save);

  // Recalcular cuando cambian los componentes o el target
  useEffect(() => {
    if (components.length === 0) {
      setCalculatedComposition(null);
      setToleranceEvaluation(null);
      setTotalKg(0);
      return;
    }

    // Convertir a formato de Component para cálculo
    const componentData: Component[] = components.map((comp) => ({
      catalogItemId: comp.catalogItem._id,
      internalId: comp.catalogItem.internalId,
      name: comp.catalogItem.name,
      quantityKg: comp.quantityKg,
      composition: comp.catalogItem.composition,
    }));

    // Calcular composición
    const composition = calculateFinalComposition(componentData);
    setCalculatedComposition(composition);

    // Calcular total
    const total = calculateTotalKg(componentData);
    setTotalKg(total);

    // Evaluar tolerancia
    const evaluation = evaluateTolerance(
      composition,
      targetProduct?.composition
    );
    setToleranceEvaluation(evaluation);
  }, [components, targetProduct]);

  const handleAddComponent = (item: CatalogItem) => {
    // Verificar si ya está en la lista
    if (components.some((c) => c.catalogItem._id === item._id)) {
      alert("Este item ya está en la lista");
      return;
    }

    setComponents([
      ...components,
      { catalogItem: item, quantityKg: 0 },
    ]);
  };

  const handleRemoveComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, value: number) => {
    // Validar máximo 2 decimales
    const rounded = Math.round(value * 100) / 100;
    
    const newComponents = [...components];
    newComponents[index].quantityKg = rounded;
    setComponents(newComponents);
  };

  const handleSave = async () => {
    if (components.length === 0) {
      alert("Agrega al menos un componente");
      return;
    }

    try {
      const result = await saveMutation({
        targetProductId: targetProduct?._id,
        name: listName || undefined,
        components: components.map((comp) => ({
          catalogItemId: comp.catalogItem._id,
          quantityKg: comp.quantityKg,
        })),
        updatedBy: "user",
      });

      alert(`Lista guardada: ${result.displayCode}\nTotal: ${result.totalKg.toFixed(2)} kg`);
      
      // Limpiar formulario
      setComponents([]);
      setTargetProduct(null);
      setListName("");
    } catch (error) {
      alert(`Error al guardar: ${error}`);
    }
  };

  const isLoading = !catalogItems;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const mpItems = catalogItems?.filter((i) => i.class === "MP") || [];
  const ptItems = catalogItems?.filter((i) => i.class === "PT") || [];
  const mzrItems = catalogItems?.filter((i) => i.class === "MZR") || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Formulador</h1>
        <p className="mt-2 text-gray-600">
          Arma tu fórmula seleccionando componentes y cantidades
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Product */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Producto Objetivo (Opcional)
            </h2>
            <select
              value={targetProduct?._id || ""}
              onChange={(e) => {
                const item = catalogItems?.find((i) => i._id === e.target.value);
                setTargetProduct(item || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sin objetivo (borrador)</option>
              {ptItems.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.internalId} - {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* List Name */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Nombre de la Lista (Opcional)
            </h2>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ej: Fórmula de prueba"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Components */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Componentes ({components.length})
            </h2>

            {/* Add Component */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agregar Componente
              </label>
              <select
                onChange={(e) => {
                  const item = catalogItems?.find((i) => i._id === e.target.value);
                  if (item) handleAddComponent(item);
                  e.target.value = "";
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value=""
              >
                <option value="">Seleccionar...</option>
                <optgroup label="Materias Primas (MP)">
                  {mpItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.internalId} - {item.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Productos Terminados (PT)">
                  {ptItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.internalId} - {item.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Mezclas (MZR)">
                  {mzrItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.internalId} - {item.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Components List */}
            {components.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay componentes agregados
              </p>
            ) : (
              <div className="space-y-3">
                {components.map((comp, index) => (
                  <div
                    key={comp.catalogItem._id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {comp.catalogItem.internalId} - {comp.catalogItem.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {comp.catalogItem.class}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={comp.quantityKg}
                        onChange={(e) =>
                          handleQuantityChange(index, parseFloat(e.target.value) || 0)
                        }
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">kg</span>
                    </div>
                    <button
                      onClick={() => handleRemoveComponent(index)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className={`font-bold ${
                  Math.abs(totalKg - 1000) > 0.01 ? "text-red-600" : "text-green-600"
                }`}>
                  {totalKg.toFixed(2)} kg
                </span>
              </div>
              
              {Math.abs(totalKg - 1000) > 0.01 && (
                <div className="flex items-start text-sm text-red-600 bg-red-50 p-3 rounded">
                  <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                  <span>
                    El total debe ser 1000 kg. Diferencia: {(1000 - totalKg).toFixed(2)} kg
                  </span>
                </div>
              )}

              {toleranceEvaluation && (
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-gray-600">Estado:</span>
                  <StatusBadge status={toleranceEvaluation.overallStatus} />
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={components.length === 0}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Lista
            </button>
          </div>

          {/* Calculated Composition */}
          {calculatedComposition && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Composición Calculada
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {NUTRIENTS_INFO.map((nutrient) => {
                  const value = calculatedComposition[nutrient.key as keyof Composition];
                  const detail = toleranceEvaluation?.details[nutrient.key];
                  
                  if (value === 0 && !detail) return null;

                  return (
                    <div
                      key={nutrient.key}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-600">{nutrient.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{value.toFixed(2)}%</span>
                        {detail && detail.status !== "INFO" && (
                          <StatusBadge status={detail.status} size="sm" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
