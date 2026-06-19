import { useState, useEffect, useCallback } from "react";

const TOKEN_KEY = "nexus_token";
const USER_KEY  = "nexus_user";
const BASE_URL  = "http://localhost:5000/api";

const useAuth = () => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user,  setUser]  = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  const isAuthenticated = !!token;

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const verifyToken = async () => {
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
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      } catch {
        // Backend offline — localStorage pe fallback
        setToken(storedToken);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
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

  return { token, user, isAuthenticated, isLoading, saveSession, updateUser, logout };
};

export default useAuth;