import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Link } from 'react-router-dom';
import { Database, FlaskConical, History, Upload, AlertCircle } from 'lucide-react';

export function DashboardPage() {
  const stats = useQuery(api.catalogStats);
  const listsCount = useQuery(api.listProductLists, { includeArchived: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Panel de Control</h2>
        <p className="text-gray-600 mt-1">Gestión del catálogo y fórmulas del formulador CFQ</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Items"
          value={stats?.total ?? '-'}
          icon={<Database className="text-blue-600" />}
          subtitle={`${stats?.active ?? 0} activos`}
        />
        <StatCard
          title="Materias Primas"
          value={stats?.MP ?? '-'}
          icon={<span className="text-green-600">🧪</span>}
          subtitle="MP editables"
        />
        <StatCard
          title="Productos Terminados"
          value={stats?.PT ?? '-'}
          icon={<span className="text-purple-600">📦</span>}
          subtitle="PT y mezclas"
        />
        <StatCard
          title="Mezclas Residuales"
          value={stats?.MZR ?? '-'}
          icon={<span className="text-amber-600">♻️</span>}
          subtitle="Sin salida comercial"
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QuickAction
            to="/catalog"
            icon={<Upload size={20} />}
            label="Cargar CSV"
            description="Importar datos al catálogo"
          />
          <QuickAction
            to="/catalog"
            icon={<Database size={20} />}
            label="Ver Catálogo"
            description="Explorar MPs, PTs y MZRs"
          />
          <QuickAction
            to="/formulator"
            icon={<FlaskConical size={20} />}
            label="Nueva Fórmula"
            description="Crear una mezcla nueva"
          />
          <QuickAction
            to="/history"
            icon={<History size={20} />}
            label="Ver Histórico"
            description="Snapshots y versiones"
          />
        </div>
      </div>

      {/* Info box */}
      {(stats?.total ?? 0) === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4">
          <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-semibold text-amber-900">Catálogo vacío</h4>
            <p className="text-amber-700 mt-1">
              Para comenzar, ve al catálogo y carga el archivo CSV de materias primas y productos.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 mt-3 text-amber-800 font-medium hover:underline"
            >
              Ir al Catálogo <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, subtitle }: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

function QuickAction({ to, icon, label, description }: {
  to: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
    >
      <div className="p-2 bg-gray-100 rounded-lg text-gray-700">{icon}</div>
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}