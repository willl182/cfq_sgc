import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  FlaskConical, 
  History, 
  Settings,
  Beaker
} from "lucide-react";
import { clsx } from "clsx";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Catálogo", href: "/catalog", icon: Package },
  { name: "Formulador", href: "/formulador", icon: FlaskConical },
  { name: "Histórico", href: "/history", icon: History },
  { name: "Admin", href: "/admin", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Beaker className="h-8 w-8 text-blue-600" />
        <div className="ml-3">
          <h1 className="text-lg font-bold text-gray-900">Formulador CFQ</h1>
          <p className="text-xs text-gray-500">CALFERQUIM S.A.S.</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          v2.0 - Convex + React
        </p>
      </div>
    </div>
  );
}
