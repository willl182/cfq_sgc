import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Database, FlaskConical, History, LayoutDashboard } from 'lucide-react';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">
                Formulador CFQ
              </h1>
              <div className="flex gap-1">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <LayoutDashboard size={16} />
                  Inicio
                </NavLink>
                <NavLink
                  to="/catalog"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <Database size={16} />
                  Catálogo
                </NavLink>
                <NavLink
                  to="/formulator"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <FlaskConical size={16} />
                  Formulador
                </NavLink>
                <NavLink
                  to="/history"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <History size={16} />
                  Histórico
                </NavLink>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AdminToggle />
              <StatusIndicator />
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function AdminToggle() {
  const [isAdmin, setIsAdmin] = React.useState(
    () => localStorage.getItem('formulador_admin') === 'true'
  );

  const toggleAdmin = () => {
    const newValue = !isAdmin;
    setIsAdmin(newValue);
    localStorage.setItem('formulador_admin', newValue ? 'true' : 'false');
  };

  return (
    <button
      onClick={toggleAdmin}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        isAdmin
          ? 'bg-amber-100 text-amber-800 border border-amber-300'
          : 'bg-gray-100 text-gray-600 border border-gray-300'
      }`}
    >
      {isAdmin ? '🔓 Admin' : '🔒 Usuario'}
    </button>
  );
}

function StatusIndicator() {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      Convex
    </div>
  );
}