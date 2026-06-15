import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

const TOKEN_KEY = "cfq_auth_token";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = useQuery(
    api.auth.getCurrentUser,
    token ? { token } : "skip"
  );

  const loginMutation = useMutation(api.auth.login);
  const registerMutation = useMutation(api.auth.register);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginMutation({ email, password });
      if (result.success && result.token) {
        localStorage.setItem(TOKEN_KEY, result.token);
        setToken(result.token);
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error };
    },
    [loginMutation]
  );

  const register = useCallback(
    async (name: string, email: string, password: string, role?: "admin" | "user") => {
      const result = await registerMutation({ name, email, password, role });
      if (result.success) {
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    [registerMutation]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    token,
    login,
    register,
    logout,
  };
}
