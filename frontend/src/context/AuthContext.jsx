import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { loginRequest, registerRequest } from "../api/auth";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem("gc_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const persistSession = (data) => {
    const { token, ...rest } = data;
    localStorage.setItem("gc_token", token);
    localStorage.setItem("gc_user", JSON.stringify(rest));
    setUser(rest);
  };

  const login = useCallback(async ({ email, password }) => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const { data } = await loginRequest({ email, password });
      persistSession(data);
      return data;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to sign in. Please try again.";
      setAuthError(message);
      throw new Error(message);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async ({ name, email, password, role }) => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const { data } = await registerRequest({ name, email, password, role });
      persistSession(data);
      return data;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to create your account. Please try again.";
      setAuthError(message);
      throw new Error(message);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("gc_token");
    localStorage.removeItem("gc_user");
    setUser(null);
  }, []);

  const updateStoredUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("gc_user", JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      authError,
      authLoading,
      login,
      register,
      logout,
      updateStoredUser
    }),
    [user, authError, authLoading, login, register, logout, updateStoredUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
