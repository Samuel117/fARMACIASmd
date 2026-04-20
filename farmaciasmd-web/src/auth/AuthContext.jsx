import { createContext, useContext, useEffect, useState } from "react";
import * as AuthApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  async function refresh() {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setUser(null);
      setReady(true);
      return;
    }
    try {
      const { data } = await AuthApi.me();
      setUser(data);
    } catch {
      localStorage.removeItem("auth_token");
      setUser(null);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function signIn(email, password) {
    const resp = await AuthApi.login(email, password);
    localStorage.setItem("auth_token", resp.data.token);
    setUser(resp.data.user);
  }

  async function signOut() {
    try { await AuthApi.logout(); } catch {}
    localStorage.removeItem("auth_token");
    setUser(null);
  }

  function isAdmin() {
    return user?.role === "admin";
  }

  function isEmployee() {
    return user?.role === "employee";
  }

  return (
    <AuthContext.Provider value={{ user, ready, signIn, signOut, isAdmin, isEmployee }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}