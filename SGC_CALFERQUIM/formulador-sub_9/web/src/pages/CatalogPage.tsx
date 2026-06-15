import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { NUTRIENTS } from '../lib/formulas';
import { Upload, Search, Filter, Edit2, Archive, X, Save } from 'lucide-react';

type ClaseFilter = 'ALL' | 'MP' | 'PT' | 'MZR';

export function CatalogPage() {
  const [search, setSearch] = useState('');
  const [claseFilter, setClaseFilter] = useState<ClaseFilter>('ALL');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editedNutrients, setEditedNutrients] = useState<Record<string, number>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const items = useQuery(api.listCatalogItems, {
    clase: claseFilter === 'ALL' ? undefined : claseFilter,
    search: search || undefined,
    includeArchived: false,
  });

  const seedMutation = useMutation(api.seedFromCSV);
  const updateMutation = useMutation(api.updateCatalogItem);
  const archiveMutation = useMutation(api.archiveCatalogItem);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setSaveStatus('saving');
    
    try {
      await seedMutation({ csvContent: text });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: any) {
      setSaveStatus('error');
      alert(err.message);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const startEditing = (item: any) => {
    setEditingItem(item);
    const nutrients: Record<string, number> = {};
    for (const n of NUTRIENTS) {
      nutrients[n] = item[n] || 0;
    }
    setEditedNutrients(nutrients);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    
    setSaveStatus('saving');
    try {
      await updateMutation({
        id: editingItem._id,
        name: editingItem.name,
        nutrients: editedNutrients,
      });
      setEditingItem(null);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: any) {
      setSaveStatus('error');
      alert(err.message);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const isAdmin = localStorage.getItem('formulador_admin') === 'true';

  // Mostrar solo nutrientes principales en la tabla
  const mainNutrients = ['N', 'P', 'K', 'CaO', 'MgO', 'S', 'B', 'Zn'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catálogo</h2>
          <p className="text-gray-600 mt-1">Gestión de materias primas, productos terminados y mezclas residuales</p>
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
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={16} />
            Cargar CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, código o referencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          {(['ALL', 'MP', 'PT', 'MZR'] as ClaseFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setClaseFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                claseFilter === f
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'ALL' ? 'Todos' : f}
              {f !== 'ALL' && items && (
                <span className="ml-1 text-xs opacity-60">
                  ({items.filter(i => i.class === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clase</th>
              {mainNutrients.map(n => (
                <th key={n} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{n}</th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items?.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`text-xs font-mono px-2 py-1 rounded ${
                    item.class === 'MP' ? 'bg-green-100 text-green-800' :
                    item.class === 'PT' ? 'bg-purple-100 text-purple-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {item.internalId}
                  </span>
                  {item.externalCode && (
                    <span className="ml-1 text-xs text-gray-400">({item.externalCode})</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.class === 'MP' ? 'bg-green-50 text-green-700' :
                    item.class === 'PT' ? 'bg-purple-50 text-purple-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {item.class}
                  </span>
                </td>
                {mainNutrients.map(n => (
                  <td key={n} className="px-4 py-3 text-sm text-right tabular-nums">
                    {((item as any)[n] || 0) > 0 ? ((item as any)[n] || 0).toFixed(2) : '-'}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {(isAdmin || item.class === 'MP') && (
                      <button
                        onClick={() => startEditing(item)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => archiveMutation({ id: item._id as any })}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                      title="Archivar"
                    >
                      <Archive size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!items || items.length === 0) && (
              <tr>
                <td colSpan={10 + mainNutrients.length} className="px-4 py-12 text-center text-gray-500">
                  {claseFilter === 'ALL' && search === '' 
                    ? 'No hay items. Carga un CSV para comenzar.'
                    : 'Sin resultados para la búsqueda.'
                }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Editar Item</h3>
                <p className="text-sm text-gray-500">{editingItem.internalId} - {editingItem.name}</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {NUTRIENTS.map(n => (
                  <div key={n}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{n}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editedNutrients[n] || 0}
                      onChange={(e) => setEditedNutrients({
                        ...editedNutrients,
                        [n]: parseFloat(e.target.value) || 0,
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {saveStatus === 'saving' ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}