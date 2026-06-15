import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <nav className="bg-emerald-700 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Left side: Logo + Nav links */}
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg whitespace-nowrap">CFQ Formulador</span>
          
          <div className="hidden sm:flex items-center gap-1 text-sm">
            <NavLink to="/catalogo" className={linkClass}>
              Catálogo
            </NavLink>
            <NavLink to="/formular" className={linkClass}>
              Formular
            </NavLink>
            <NavLink to="/historico" className={linkClass}>
              Histórico
            </NavLink>
            <NavLink to="/importar" className={linkClass}>
              Importar
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}
          </div>
        </div>

        {/* Right side: User info */}
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="opacity-90">
                {user.name} {isAdmin ? "(Admin)" : ""}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1 bg-emerald-800 rounded hover:bg-emerald-900 transition-colors"
              >
                Salir
              </button>
            </>
          ) : (
            <span className="opacity-75">Sin sesión</span>
          )}
        </div>
      </div>
    </nav>
  );
}

function linkClass({ isActive }: { isActive: boolean }) {
  return `px-3 py-1 rounded transition-colors whitespace-nowrap ${
    isActive ? "bg-emerald-800 font-medium" : "hover:bg-emerald-600"
  }`;
}
