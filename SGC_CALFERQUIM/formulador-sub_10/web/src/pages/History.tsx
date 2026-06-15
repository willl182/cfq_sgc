import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Archive, Copy, Eye, Calendar } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { NUTRIENTS_INFO } from "../lib/nutrients";
import type { Composition } from "../../convex/lib/formulas";
import type { Doc } from "../../convex/_generated/dataModel";

type Snapshot = Doc<"productListSnapshots">;

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  
  const snapshots = useQuery(api.snapshots.list, {});
  const catalogItems = useQuery(api.catalog.list, {});
  const archiveMutation = useMutation(api.snapshots.archive);
  const cloneMutation = useMutation(api.snapshots.cloneToList);

  // Filtrar por búsqueda
  const filteredSnapshots = snapshots?.filter(snapshot => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      snapshot.displayCode.toLowerCase().includes(query) ||
      (snapshot.name && snapshot.name.toLowerCase().includes(query))
    );
  }) || [];

  const handleArchive = async (snapshot: Snapshot) => {
    if (!confirm(`¿Archivar snapshot ${snapshot.displayCode} v${snapshot.snapshotVersion}?`)) return;
    
    try {
      await archiveMutation({ id: snapshot._id });
    } catch (error) {
      alert(`Error al archivar: ${error}`);
    }
  };

  const handleClone = async (snapshot: Snapshot) => {
    try {
      const result = await cloneMutation({
        snapshotId: snapshot._id,
        createdBy: "user",
      });
      alert(`Snapshot clonado a nueva lista: ${result.displayCode}`);
    } catch (error) {
      alert(`Error al clonar: ${error}`);
    }
  };

  const getTargetProductName = (snapshot: Snapshot): string => {
    if (!snapshot.targetProductId || !catalogItems) return "Sin objetivo";
    const product = catalogItems.find(p => p._id === snapshot.targetProductId);
    return product ? `${product.internalId} - ${product.name}` : "Desconocido";
  };

  const isLoading = !snapshots || !catalogItems;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Histórico</h1>
        <p className="mt-2 text-gray-600">
          Snapshots inmutables de fórmulas guardadas
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredSnapshots.length} {filteredSnapshots.length === 1 ? "snapshot" : "snapshots"} encontrados
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Versión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto Objetivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSnapshots.map((snapshot) => (
                <tr key={snapshot._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {snapshot.displayCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    v{snapshot.snapshotVersion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getTargetProductName(snapshot)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {snapshot.totalKg.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={snapshot.toleranceEvaluation.overallStatus} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(snapshot.createdAt).toLocaleDateString("es-CO")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedSnapshot(snapshot)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleClone(snapshot)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Clonar a nueva lista"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleArchive(snapshot)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Archivar"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSnapshot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedSnapshot.displayCode} v{selectedSnapshot.snapshotVersion}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedSnapshot.name || "Sin nombre"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSnapshot(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedSnapshot.totalKg.toFixed(2)} kg
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Estado</p>
                  <StatusBadge status={selectedSnapshot.toleranceEvaluation.overallStatus} />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Componentes</p>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedSnapshot.components.length}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedSnapshot.createdAt).toLocaleString("es-CO")}
                  </p>
                </div>
              </div>

              {/* Alerts */}
              {selectedSnapshot.alerts.length > 0 && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">Alertas</h3>
                  <ul className="list-disc list-inside text-sm text-yellow-700">
                    {selectedSnapshot.alerts.map((alert, i) => (
                      <li key={i}>{alert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Components */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Componentes</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                        <th className="pb-2">Código</th>
                        <th className="pb-2">Nombre</th>
                        <th className="pb-2 text-right">Cantidad (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedSnapshot.components.map((comp, i) => (
                        <tr key={i} className="text-sm">
                          <td className="py-2 font-mono">{comp.internalId}</td>
                          <td className="py-2">{comp.name}</td>
                          <td className="py-2 text-right font-mono">{comp.quantityKg.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculated Composition */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Composición Calculada</h3>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {NUTRIENTS_INFO.map((nutrient) => {
                    const value = selectedSnapshot.calculatedComposition[nutrient.key as keyof Composition];
                    const detail = selectedSnapshot.toleranceEvaluation.details[nutrient.key];
                    
                    if (value === 0 && !detail) return null;

                    return (
                      <div key={nutrient.key} className="text-sm">
                        <p className="text-gray-600">{nutrient.label}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{value.toFixed(2)}%</span>
                          {detail && detail.status !== "INFO" && (
                            <StatusBadge status={detail.status} size="sm" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
