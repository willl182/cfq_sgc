import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Database, FlaskConical, Clock, BarChart3 } from "lucide-react";

export function DashboardPage() {
  const counts = useQuery(api.queries.getCatalogCounts);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Panel de Control
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Database size={20} />
            <span className="font-semibold">MP</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {counts?.MP ?? "—"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Materias Primas</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <FlaskConical size={20} />
            <span className="font-semibold">PT</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {counts?.PT ?? "—"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Productos Terminados</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <BarChart3 size={20} />
            <span className="font-semibold">MZR</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {counts?.MZR ?? "—"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Mezclas Físicas</p>
        </div>
      </div>

      {counts && counts.total > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 text-sm font-medium">
            ✅ Catálogo cargado: {counts.total} items
          </p>
        </div>
      )}

      {counts && counts.total === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-800 text-sm font-medium">
            ⚠️ Catálogo vacío. Vaya a la sección Catálogo para cargar datos CSV.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-3">
          <Clock size={16} className="inline mr-2" />
          Actividad Reciente
        </h3>
        <p className="text-slate-500 text-sm">
          Los cambios recientes aparecerán aquí.
        </p>
      </div>
    </div>
  );
}