import { useCallback, useEffect, useState } from "react";
import { login as loginRequest, verifySession } from "./api.ts";

const TOKEN_STORAGE_KEY = "mrama-admin-session-token";

export type AuthStatus = "checking" | "authenticated" | "anonymous";

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setStatus("anonymous");
      return;
    }
    verifySession(token).then((valid) => {
      if (valid) {
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
      const token = await loginRequest(username, password);
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      setStatus("authenticated");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setStatus("anonymous");
  }, []);

  return { status, error, login, logout };
}
