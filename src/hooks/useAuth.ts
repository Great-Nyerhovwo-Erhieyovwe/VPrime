import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from 'react';
import { api } from "../api/client";

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post("/api/auth/login", credentials);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return { success: true };
    },
    onSuccess: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      queryClient.clear();
      window.location.href = "/";
    },
  });
}

export function useCurrentUser() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get("/api/auth/me");
      return data;
    },
  });
}

// Hook to check user status periodically and handle auto-logout
interface AuthStatus {
  isAuthenticated: boolean;
  isBanned: boolean;
  isFrozen: boolean;
  isLoading: boolean;
}

export const useAuthStatus = (): AuthStatus => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/dashboard/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await response.json();

        if (response.ok && user) {
          setIsAuthenticated(true);
          setIsBanned(user.banned || false);
          setIsFrozen(user.frozen || false);

          if (user.banned) {
            // Auto logout banned users
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        } else {
          // Invalid token or error
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isBanned, isFrozen, isLoading };
};

