import { useCallback, useEffect, useState } from "react";
import { login as loginRequest, verifySession } from "./api.ts";

const TOKEN_STORAGE_KEY = "mrama-admin-session-token";

export type AuthStatus = "checking" | "authenticated" | "anonymous";

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!stored) {
      setStatus("anonymous");
      return;
    }
    verifySession(stored).then((valid) => {
      if (valid) {
        setToken(stored);
        setStatus("authenticated");
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setStatus("anonymous");
      }
    });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    try {
      const newToken = await loginRequest(username, password);
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      setToken(newToken);
      setStatus("authenticated");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setStatus("anonymous");
  }, []);

  return { status, error, token, login, logout };
}
