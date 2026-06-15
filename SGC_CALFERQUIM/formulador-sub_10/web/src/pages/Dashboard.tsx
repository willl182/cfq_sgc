import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Package, FlaskConical, History, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const catalogItems = useQuery(api.catalog.list, {});
  const productLists = useQuery(api.lists.list, {});
  const snapshots = useQuery(api.snapshots.list, {});

  const stats = [
    {
      name: "Items en Catálogo",
      value: catalogItems?.length || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Listas Activas",
      value: productLists?.length || 0,
      icon: FlaskConical,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Snapshots",
      value: snapshots?.length || 0,
      icon: History,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const isLoading = !catalogItems || !productLists || !snapshots;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Sistema de formulación de fertilizantes CALFERQUIM S.A.S.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/catalog"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Ver Catálogo</p>
              <p className="text-sm text-gray-500">Explorar materias primas y productos</p>
            </div>
          </a>
          <a
            href="/formulador"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FlaskConical className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Nueva Fórmula</p>
              <p className="text-sm text-gray-500">Crear una nueva lista de formulación</p>
            </div>
          </a>
          <a
            href="/history"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <History className="h-5 w-5 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Ver Histórico</p>
              <p className="text-sm text-gray-500">Revisar snapshots guardados</p>
            </div>
          </a>
        </div>
      </div>

      {/* Catalog Breakdown */}
      {catalogItems && catalogItems.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Desglose del Catálogo</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {catalogItems.filter(i => i.class === "MP").length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Materias Primas</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {catalogItems.filter(i => i.class === "PT").length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Productos Terminados</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {catalogItems.filter(i => i.class === "MZR").length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Mezclas (MZR)</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {catalogItems.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Catálogo vacío</h3>
              <p className="mt-1 text-sm text-yellow-700">
                No hay datos en el catálogo. Ve a la página de Admin para cargar el CSV inicial.
              </p>
              <a
                href="/admin"
                className="mt-3 inline-flex items-center text-sm font-medium text-yellow-800 hover:text-yellow-900"
              >
                Ir a Admin →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
