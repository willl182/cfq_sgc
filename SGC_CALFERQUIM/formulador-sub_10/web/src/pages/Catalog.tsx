import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Edit2, Archive, X, Save } from "lucide-react";
import { NUTRIENTS_INFO } from "../lib/nutrients";
import StatusBadge from "../components/StatusBadge";
import type { Doc } from "../../convex/_generated/dataModel";

type CatalogItem = Doc<"catalogItems">;

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState<"MP" | "PT" | "MZR" | undefined>(undefined);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [editComposition, setEditComposition] = useState<any>(null);
  
  const catalogItems = useQuery(api.catalog.list, { classFilter });
  const updateMutation = useMutation(api.catalog.update);
  const archiveMutation = useMutation(api.catalog.archive);

  // Filtrar por búsqueda
  const filteredItems = catalogItems?.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.internalId.toLowerCase().includes(query) ||
      (item.externalCode && item.externalCode.toLowerCase().includes(query))
    );
  }) || [];

  const handleEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setEditComposition({ ...item.composition });
  };

  const handleSave = async () => {
    if (!editingItem || !editComposition) return;
    
    try {
      await updateMutation({
        id: editingItem._id,
        composition: editComposition,
        updatedBy: "user",
      });
      setEditingItem(null);
      setEditComposition(null);
    } catch (error) {
      alert(`Error al guardar: ${error}`);
    }
  };

  const handleArchive = async (item: CatalogItem) => {
    if (!confirm(`¿Archivar ${item.name}?`)) return;
    
    try {
      await archiveMutation({ id: item._id });
    } catch (error) {
      alert(`Error al archivar: ${error}`);
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Catálogo</h1>
        <p className="mt-2 text-gray-600">
          Materias primas, productos terminados y mezclas
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Class Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setClassFilter(undefined)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                !classFilter
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setClassFilter("MP")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                classFilter === "MP"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              MP
            </button>
            <button
              onClick={() => setClassFilter("PT")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                classFilter === "PT"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              PT
            </button>
            <button
              onClick={() => setClassFilter("MZR")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                classFilter === "MZR"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              MZR
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} encontrados
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
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  K
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {item.internalId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.class === "MP" ? "bg-blue-100 text-blue-800" :
                      item.class === "PT" ? "bg-green-100 text-green-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {item.class}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.composition.N.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.composition.P.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.composition.K.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleArchive(item)}
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

      {/* Edit Modal */}
      {editingItem && editComposition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Editar {editingItem.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingItem.internalId} - {editingItem.class}
                  </p>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {NUTRIENTS_INFO.map((nutrient) => (
                  <div key={nutrient.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {nutrient.label}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editComposition[nutrient.key]}
                      onChange={(e) =>
                        setEditComposition({
                          ...editComposition,
                          [nutrient.key]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
