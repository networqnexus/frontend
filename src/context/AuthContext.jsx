import { createContext, useState, useEffect, useCallback } from "react";

const TOKEN_KEY = "nexus_token";
const USER_KEY  = "nexus_user";
const BASE_URL  = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user,  setUser]  = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) { setIsLoading(false); return; }

    const verify = async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            setUser(data.user);
          }
          setToken(storedToken);
        } else {
          // Token invalid or expired — clear session
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      } catch {
        // Backend offline — use cached localStorage data
        setToken(storedToken);
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, []);

  const saveSession = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      token, user, isAuthenticated: !!token, isLoading,
      saveSession, updateUser, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
