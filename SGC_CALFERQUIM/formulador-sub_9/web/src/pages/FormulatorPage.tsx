import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { 
  calculateComposition, calculateTotalKg, roundCantidad, 
  evaluateTolerance, NUTRIENTS, type Component 
} from '../lib/formulas';
import { Plus, Trash2, Save, AlertTriangle, Check, X, ChevronDown } from 'lucide-react';

export function FormulatorPage() {
  const catalogItems = useQuery(api.listCatalogItems, { includeArchived: false });
  const lists = useQuery(api.listProductLists, { includeArchived: false });

  // Estado del formulador
  const [targetProductId, setTargetProductId] = useState<string | null>(null);
  const [components, setComponents] = useState<{ catalogItemId: string; cantidadKg: number }[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const [searchComponent, setSearchComponent] = useState('');

  // Productos objetivo (PTs y MZRs)
  const targetProducts = useMemo(() => 
    catalogItems?.filter(i => i.class === 'PT' || i.class === 'MZR') || [],
    [catalogItems]
  );

  // Componentes disponibles (solo MP y PT, no MZR como componente)
  const availableComponents = useMemo(() =>
    catalogItems?.filter(i => i.class === 'MP' || i.class === 'PT') || [],
    [catalogItems]
  );

  // Filtrar componentes para el selector
  const filteredComponents = useMemo(() =>
    availableComponents.filter(c => 
      c.name.toLowerCase().includes(searchComponent.toLowerCase()) ||
      c.internalId.toLowerCase().includes(searchComponent.toLowerCase())
    ),
    [availableComponents, searchComponent]
  );

  // Producto objetivo seleccionado
  const targetProduct = useMemo(() =>
    catalogItems?.find(i => i._id === targetProductId) || null,
    [catalogItems, targetProductId]
  );

  // Componentes con datos nutricionales completos
  const componentsWithNutrients = useMemo<Component[]>(() => {
    return components.map(comp => {
      const item = catalogItems?.find(i => i._id === comp.catalogItemId);
      const nutrients: Record<string, number> = {};
      for (const n of NUTRIENTS) {
        nutrients[n] = item ? (item[n as keyof typeof item] as number) || 0 : 0;
      }
      return {
        catalogItemId: comp.catalogItemId,
        name: item?.name || 'Desconocido',
        cantidadKg: comp.cantidadKg,
        nutrients,
      };
    });
  }, [components, catalogItems]);

  // Composición calculada
  const calculatedComposition = useMemo(
    () => calculateComposition(componentsWithNutrients),
    [componentsWithNutrients]
  );

  // Total de kg
  const totalKg = useMemo(
    () => calculateTotalKg(componentsWithNutrients),
    [componentsWithNutrients]
  );

  // Evaluación de tolerancia
  const toleranceEvaluation = useMemo(() => {
    if (!targetProduct) return null;
    const targetNutrients: Record<string, number> = {};
    for (const n of NUTRIENTS) {
      targetNutrients[n] = (targetProduct[n as keyof typeof targetProduct] as number) || 0;
    }
    return evaluateTolerance(calculatedComposition, targetNutrients);
  }, [targetProduct, calculatedComposition]);

  // Alertas
  const alerts = useMemo(() => {
    const a: string[] = [];
    if (Math.abs(totalKg - 1000) > 0.01) {
      a.push(`Total ${totalKg.toFixed(2)} kg ≠ 1000 kg`);
    }
    if (toleranceEvaluation?.generalStatus === 'NO_CUMPLE') {
      a.push('Mezcla NO CUMPLE tolerancias');
    } else if (toleranceEvaluation?.generalStatus === 'CUMPLE_S') {
      a.push('Mezcla supera algunas tolerancias');
    }
    return a;
  }, [totalKg, toleranceEvaluation]);

  // Guardar lista
  const saveMutation = useMutation(api.saveProductList);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await saveMutation({
        id: undefined,
        targetProductId: targetProductId as any || undefined,
        components: components.map(c => ({
          catalogItemId: c.catalogItemId as any,
          cantidadKg: c.cantidadKg,
        })),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: any) {
      setSaveStatus('error');
      alert(err.message);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Agregar componente
  const addComponent = (catalogItemId: string) => {
    setComponents([...components, { catalogItemId, cantidadKg: 0 }]);
    setShowComponentSelector(false);
    setSearchComponent('');
  };

  // Eliminar componente
  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  // Actualizar cantidad
  const updateCantidad = (index: number, cantidad: number) => {
    setComponents(components.map((c, i) => 
      i === index ? { ...c, cantidadKg: roundCantidad(cantidad) } : c
    ));
  };

  const mainNutrients = ['N', 'P', 'K', 'CaO', 'MgO', 'S', 'B', 'Zn'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formulador</h2>
          <p className="text-gray-600 mt-1">Arma mezclas de 1000 kg y evalúa tolerancias ICA</p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <span className="text-sm text-blue-600 animate-pulse">Guardando...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600">✓ Guardado</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-600">Error al guardar</span>
          )}
          <button
            onClick={handleSave}
            disabled={components.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            Guardar Lista
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: Configuración */}
        <div className="space-y-4">
          {/* Producto objetivo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Producto Objetivo (opcional)
            </label>
            <select
              value={targetProductId || ''}
              onChange={(e) => setTargetProductId(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin objetivo (borrador)</option>
              {targetProducts.map(p => (
                <option key={p._id} value={p._id}>
                  {p.internalId} - {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Componentes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Componentes</h3>
              <button
                onClick={() => setShowComponentSelector(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Plus size={14} />
                Agregar
              </button>
            </div>

            {components.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Sin componentes. Agrega materias primas o productos.
              </p>
            ) : (
              <div className="space-y-2">
                {components.map((comp, index) => {
                  const item = catalogItems?.find(i => i._id === comp.catalogItemId);
                  return (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className={`text-xs font-mono px-2 py-1 rounded flex-shrink-0 ${
                        item?.class === 'MP' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item?.internalId || '?'}
                      </span>
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {item?.name || 'Desconocido'}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={comp.cantidadKg || ''}
                        onChange={(e) => updateCantidad(index, parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right tabular-nums"
                        placeholder="kg"
                      />
                      <span className="text-xs text-gray-400">kg</span>
                      <button
                        onClick={() => removeComponent(index)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total */}
            <div className={`mt-4 pt-4 border-t flex items-center justify-between ${
              Math.abs(totalKg - 1000) > 0.01 ? 'text-amber-600' : 'text-gray-900'
            }`}>
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold tabular-nums">{totalKg.toFixed(2)} kg</span>
            </div>
          </div>

          {/* Alertas */}
          {alerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-2 text-amber-800">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{alert}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel derecho: Resultados */}
        <div className="lg:col-span-2 space-y-4">
          {/* Estado de tolerancia */}
          {toleranceEvaluation && (
            <div className={`rounded-xl p-4 border ${
              toleranceEvaluation.generalStatus === 'CUMPLE' ? 'bg-green-50 border-green-200' :
              toleranceEvaluation.generalStatus === 'CUMPLE_S' ? 'bg-blue-50 border-blue-200' :
              toleranceEvaluation.generalStatus === 'NO_CUMPLE' ? 'bg-red-50 border-red-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                {toleranceEvaluation.generalStatus === 'CUMPLE' && <Check className="text-green-600" size={24} />}
                {toleranceEvaluation.generalStatus === 'CUMPLE_S' && <AlertTriangle className="text-blue-600" size={24} />}
                {toleranceEvaluation.generalStatus === 'NO_CUMPLE' && <X className="text-red-600" size={24} />}
                {toleranceEvaluation.generalStatus === 'SIN_OBJETIVO' && <span className="text-2xl">📋</span>}
                <div>
                  <p className={`font-semibold ${
                    toleranceEvaluation.generalStatus === 'CUMPLE' ? 'text-green-800' :
                    toleranceEvaluation.generalStatus === 'CUMPLE_S' ? 'text-blue-800' :
                    toleranceEvaluation.generalStatus === 'NO_CUMPLE' ? 'text-red-800' :
                    'text-gray-800'
                  }`}>
                    {toleranceEvaluation.generalStatus.replace('_', ' ')}
                  </p>
                  {targetProduct && (
                    <p className="text-sm text-gray-600">
                      vs. {targetProduct.name} ({targetProduct.internalId})
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tabla de composición */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nutriente</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Calculado</th>
                  {targetProduct && (
                    <>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Objetivo</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tolerancia</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {NUTRIENTS.map(nutrient => {
                  const calc = calculatedComposition[nutrient] || 0;
                  const eval_ = toleranceEvaluation?.nutrients[nutrient];
                  const target = targetProduct ? (targetProduct[nutrient as keyof typeof targetProduct] as number) || 0 : null;
                  
                  return (
                    <tr key={nutrient} className={target && target > 0 ? '' : 'opacity-50'}>
                      <td className="px-4 py-2 text-sm font-medium text-gray-700">{nutrient}</td>
                      <td className="px-4 py-2 text-sm text-right tabular-nums">
                        {calc > 0 ? calc.toFixed(4) : '-'}
                      </td>
                      {targetProduct && (
                        <>
                          <td className="px-4 py-2 text-sm text-right tabular-nums text-gray-500">
                            {target && target > 0 ? target.toFixed(2) : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-right tabular-nums text-gray-500">
                            {eval_ && target && target > 0 ? `±${eval_.tolerance.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {eval_ && target && target > 0 ? (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                eval_.status === 'C' ? 'bg-green-100 text-green-800' :
                                eval_.status === 'NC' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {eval_.status}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">info</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Component Selector Modal */}
      {showComponentSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Buscar componente..."
                value={searchComponent}
                onChange={(e) => setSearchComponent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {filteredComponents.map(item => (
                <button
                  key={item._id}
                  onClick={() => addComponent(item._id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 text-left"
                >
                  <span className={`text-xs font-mono px-2 py-1 rounded ${
                    item.class === 'MP' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.internalId}
                  </span>
                  <span className="text-sm text-gray-900">{item.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    N:{item.N?.toFixed(1) || 0} P:{item.P?.toFixed(1) || 0} K:{item.K?.toFixed(1) || 0}
                  </span>
                </button>
              ))}
              {filteredComponents.length === 0 && (
                <p className="p-4 text-center text-gray-500">Sin resultados</p>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => { setShowComponentSelector(false); setSearchComponent(''); }}
                className="w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}