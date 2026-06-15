import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";

export default function AdminPage() {
  const { user, login, register, logout, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<"admin" | "user">("user");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isEmpty = useQuery(api.seed.isCatalogEmpty);
  const seedCatalog = useMutation(api.seed.seedCatalog);
  const usersList = useQuery(api.auth.listUsers, {});
  const updateUser = useMutation(api.auth.updateUser);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoginLoading(true);
    setLoginError("");
    const result = await login(email.trim(), password.trim());
    if (!result.success) {
      setLoginError(result.error || "Error al iniciar sesión");
    }
    setLoginLoading(false);
  };

  const handleRegister = async () => {
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) return;
    setRegisterLoading(true);
    setRegisterError("");
    const result = await register(
      registerName.trim(),
      registerEmail.trim(),
      registerPassword.trim(),
      registerRole
    );
    if (!result.success) {
      setRegisterError(result.error || "Error al registrar");
    } else {
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterRole("user");
      alert("Usuario registrado exitosamente");
    }
    setRegisterLoading(false);
  };

  const handleSeed = async () => {
    if (!file) return;
    setLoading(true);
    const text = await file.text();
    const res = await seedCatalog({ csvText: text, actor: user?.name ?? "admin" });
    setResult(res);
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="max-w-sm mx-auto mt-10 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Iniciar sesión</h2>
          {loginError && (
            <div className="bg-red-50 text-red-800 text-sm rounded p-2">{loginError}</div>
          )}
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            disabled={loginLoading}
            className="w-full bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 disabled:opacity-50"
          >
            {loginLoading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        <div className="border-t pt-4 space-y-4">
          <h2 className="text-xl font-semibold">Registrar nuevo usuario</h2>
          {registerError && (
            <div className="bg-red-50 text-red-800 text-sm rounded p-2">{registerError}</div>
          )}
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Nombre"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
            type="email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Contraseña"
            type="password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
          />
          <select
            className="w-full border rounded px-3 py-2"
            value={registerRole}
            onChange={(e) => setRegisterRole(e.target.value as "admin" | "user")}
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
          <button
            onClick={handleRegister}
            disabled={registerLoading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {registerLoading ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Administración</h1>
        <div className="flex items-center gap-2 text-sm">
          <span>{user.name} ({user.email})</span>
          <button
            onClick={logout}
            className="px-3 py-1 bg-emerald-700 text-white rounded hover:bg-emerald-800"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <section className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2">Carga inicial de catálogo</h2>
        {isEmpty === false ? (
          <p className="text-red-600">El catálogo ya tiene datos. No se permite carga inicial.</p>
        ) : (
          <div className="space-y-3">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={handleSeed}
              disabled={!file || loading}
              className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Cargar CSV"}
            </button>
            {result && (
              <div className="text-sm space-y-1">
                <p>Leídas: {result.read}</p>
                <p>Insertadas: {result.inserted}</p>
                <p>Rechazadas: {result.rejected}</p>
                {result.errors.length > 0 && (
                  <div className="bg-red-50 p-2 rounded max-h-40 overflow-auto">
                    <p className="font-semibold">Errores:</p>
                    <ul className="list-disc pl-5">
                      {result.errors.map((e: string, i: number) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {isAdmin && (
        <section className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">Gestión de usuarios</h2>
          <div className="overflow-auto max-h-[60vh]">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Rol</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                  <th className="px-3 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usersList?.map((u) => (
                  <tr key={u._id} className="border-t">
                    <td className="px-3 py-2">{u.name}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${u.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {u.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            await updateUser({
                              userId: u._id,
                              updates: { role: u.role === "admin" ? "user" : "admin" },
                            });
                          }}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Cambiar rol
                        </button>
                        <button
                          onClick={async () => {
                            await updateUser({
                              userId: u._id,
                              updates: { isActive: !u.isActive },
                            });
                          }}
                          className={`text-xs px-2 py-1 rounded ${u.isActive ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                        >
                          {u.isActive ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
