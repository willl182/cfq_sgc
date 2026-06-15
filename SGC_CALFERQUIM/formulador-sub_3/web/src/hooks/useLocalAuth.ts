import { useState, useEffect } from "react";

export interface LocalUser {
  name: string;
  isAdmin: boolean;
}

export function useLocalAuth() {
  const [user, setUser] = useState<LocalUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("cfq_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = (name: string, isAdmin: boolean) => {
    const u = { name, isAdmin };
    localStorage.setItem("cfq_user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("cfq_user");
    setUser(null);
  };

  return { user, login, logout };
}
