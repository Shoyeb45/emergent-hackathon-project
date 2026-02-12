"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, setStoredToken } from "@/lib/api";

type User = { id: number; name: string; email: string };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUserFromLogin: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data as User);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await authApi.signout();
    } finally {
      setStoredToken(null);
      setUser(null);
      router.push("/");
    }
  }, [router]);

  const setUserFromLogin = useCallback((userData: User) => {
    setUser(userData);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser, setUserFromLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
