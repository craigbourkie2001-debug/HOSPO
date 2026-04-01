import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth } from "@/api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("hospo_token");
    if (!token) { setIsLoadingAuth(false); return; }
    auth.me().then(u => { setUser(u); setIsAuthenticated(true); }).catch(() => { localStorage.removeItem("hospo_token"); }).finally(() => setIsLoadingAuth(false));
  }, []);

  const login = useCallback(async (email, password) => { const u = await auth.login(email, password); setUser(u); setIsAuthenticated(true); return u; }, []);
  const register = useCallback(async (email, password, account_type, full_name) => { const u = await auth.register(email, password, account_type, full_name); setUser(u); setIsAuthenticated(true); return u; }, []);
  const logout = useCallback(async () => { await auth.logout(); setUser(null); setIsAuthenticated(false); window.location.href = "/"; }, []);
  const updateProfile = useCallback(async (updates) => { const u = await auth.updateProfile(updates); setUser(u); return u; }, []);
  const refreshUser = useCallback(async () => { try { const u = await auth.me(); setUser(u); return u; } catch (_) {} }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings: false, authError, isEmployer: user?.account_type === "employer", isWorker: user?.account_type === "worker", login, register, logout, updateProfile, refreshUser, navigateToLogin: () => { window.location.href = "/Welcome"; }, checkAppState: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
