import React from "react";
import { NavLink } from "react-router-dom";
import { isLocalStorageAdmin } from "../lib";

const navItems = [
  { to: "/catalogo", label: "Cat\u00e1logo", icon: "\ud83d\udccb" },
  { to: "/formulador", label: "Formulador", icon: "\u2697\ufe0f" },
  { to: "/historico", label: "Hist\u00f3rico", icon: "\ud83d\udcda" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = React.useState(isLocalStorageAdmin());

  const toggleAdmin = () => {
    const next = !admin;
    setAdmin(next);
    try {
      if (next) localStorage.setItem("cfq_admin", "true");
      else localStorage.removeItem("cfq_admin");
    } catch {}
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>CFQ</h1>
          <span className="sidebar-subtitle">Formulador</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link--active" : ""}`
              }
              end={item.to === "/formulador" ? false : true}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button
            className={`btn-admin ${admin ? "btn-admin--active" : ""}`}
            onClick={toggleAdmin}
            title={admin ? "Modo admin activo" : "Activar modo admin"}
          >
            {admin ? "\u2705 Admin" : "\U0001f512 Admin"}
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}