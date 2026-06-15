import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { History, Copy, Archive, ChevronDown, Filter } from 'lucide-react';
import { NUTRIENTS } from '../lib/formulas';

export function HistoryPage() {
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
  const [filterProduct, setFilterProduct] = useState<string>('');

  const snapshots = useQuery(api.listSnapshots, { limit: 100 });
  const lists = useQuery(api.listProductLists, { includeArchived: false });

  const cloneMutation = useMutation(api.cloneSnapshotToList);
  const archiveMutation = useMutation(api.archiveProductList);

  // Filtrar snapshots
  const filteredSnapshots = snapshots?.filter(s => {
    if (!filterProduct) return true;
    return s.displayCode.toLowerCase().includes(filterProduct.toLowerCase()) ||
           s.targetProductId?.toString().includes(filterProduct);
  }) || [];

  // Snapshot seleccionado
  const selected = snapshots?.find(s => s._id === selectedSnapshot);

  const handleClone = async (snapshotId: string) => {
    try {
      const result = await cloneMutation({ snapshotId: snapshotId as any });
      alert(`Lista clonada: ${result.displayCode}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Histórico de Snapshots</h2>
          <p className="text-gray-600 mt-1">Versiones congeladas de listas y fórmulas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de snapshots */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Filtrar por producto..."
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
            {filteredSnapshots.map(snapshot => (
              <button
                key={snapshot._id}
                onClick={() => setSelectedSnapshot(snapshot._id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedSnapshot === snapshot._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{snapshot.displayCode}</span>
                  <span className="text-xs text-gray-500">
                    {snapshot.snapshotVersion}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {snapshot.targetProductId ? 'Con objetivo' : 'Borrador'}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {new Date(snapshot.createdAt).toLocaleString('es-CO')}
                </div>
                {snapshot.toleranceEvaluation && (
                  <div className="mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      snapshot.toleranceEvaluation.generalStatus === 'CUMPLE' ? 'bg-green-100 text-green-800' :
                      snapshot.toleranceEvaluation.generalStatus === 'CUMPLE_S' ? 'bg-blue-100 text-blue-800' :
                      snapshot.toleranceEvaluation.generalStatus === 'NO_CUMPLE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {snapshot.toleranceEvaluation.generalStatus.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </button>
            ))}
            {filteredSnapshots.length === 0 && (
              <p className="p-8 text-center text-gray-500">
                No hay snapshots registrados
              </p>
            )}
          </div>
        </div>

        {/* Detalle del snapshot */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selected.displayCode}</h3>
                    <p className="text-sm text-gray-500">
                      {selected.snapshotVersion} • {new Date(selected.createdAt).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleClone(selected._id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Copy size={14} />
                      Clonar
                    </button>
                  </div>
                </div>
              </div>

              {/* Componentes */}
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Componentes</h4>
                <div className="space-y-2">
                  {selected.components.map((comp, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-mono text-gray-600">{comp.internalId}</span>
                      <span className="text-sm text-gray-900 flex-1">{comp.name}</span>
                      <span className="text-sm font-medium tabular-nums">{comp.cantidadKg.toFixed(2)} kg</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="font-medium text-gray-700">Total</span>
                  <span className="text-lg font-bold tabular-nums">{selected.totalKg.toFixed(2)} kg</span>
                </div>
              </div>

              {/* Composición calculada */}
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Composición Calculada</h4>
                <div className="grid grid-cols-4 gap-2">
                  {NUTRIENTS.filter(n => (selected.calculatedComposition as any)[n] > 0).map(n => (
                    <div key={n} className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">{n}</div>
                      <div className="text-sm font-medium tabular-nums">
                        {(selected.calculatedComposition as any)[n].toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tolerancia */}
              {selected.toleranceEvaluation && (
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Evaluación de Tolerancia</h4>
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-500">
                        <th className="text-left py-2">Nutriente</th>
                        <th className="text-right py-2">Calculado</th>
                        <th className="text-right py-2">Objetivo</th>
                        <th className="text-right py-2">Tolerancia</th>
                        <th className="text-center py-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(selected.toleranceEvaluation.nutrients)
                        .filter(([_, eval_]) => (eval_ as any).target > 0)
                        .map(([nutrient, eval_]) => (
                          <tr key={nutrient}>
                            <td className="py-2 text-sm font-medium">{nutrient}</td>
                            <td className="py-2 text-sm text-right tabular-nums">
                              {(eval_ as any).calculated.toFixed(4)}
                            </td>
                            <td className="py-2 text-sm text-right tabular-nums text-gray-500">
                              {(eval_ as any).target.toFixed(2)}
                            </td>
                            <td className="py-2 text-sm text-right tabular-nums text-gray-500">
                              ±{(eval_ as any).tolerance.toFixed(2)}
                            </td>
                            <td className="py-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                (eval_ as any).status === 'C' ? 'bg-green-100 text-green-800' :
                                (eval_ as any).status === 'NC' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {(eval_ as any).status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Alertas */}
              {selected.alerts && selected.alerts.length > 0 && (
                <div className="p-4 bg-amber-50 border-t border-amber-200">
                  <h4 className="font-medium text-amber-900 mb-2">Alertas</h4>
                  <ul className="space-y-1">
                    {selected.alerts.map((alert, i) => (
                      <li key={i} className="text-sm text-amber-700">• {alert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <History className="mx-auto text-gray-300" size={48} />
              <p className="mt-4 text-gray-500">Selecciona un snapshot para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}