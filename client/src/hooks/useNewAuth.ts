import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AuthUser {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  authProvider: string | null;
  isEmailVerified: boolean | null;
  subscriptionStatus?: string;
  trialStartDate?: Date | null;
  trialEndDate?: Date | null;
  subscriptionStartDate?: Date | null;
  subscriptionExpiresAt?: Date | null;
  lastPaymentDate?: Date | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export function useNewAuth() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth-token');
  });
  const queryClient = useQueryClient();

  // Fetch user data with JWT token (supports both Bearer and cookie auth)
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      // Try cookie-based auth first, then fall back to token in localStorage
      let response = await fetch('/api/auth/status', {
        credentials: 'include' // Include cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          return data.user;
        }
      }
      
      // Fall back to Bearer token if cookie auth failed and we have a stored token
      if (token) {
        response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          return response.json();
        } else if (response.status === 401) {
          // Token is invalid, clear it
          localStorage.removeItem('auth-token');
          setToken(null);
        }
      }
      
      return null;
    },
    retry: false,
  });


  const signIn = (user: AuthUser, authToken: string) => {
    localStorage.setItem('auth-token', authToken);
    setToken(authToken);
    queryClient.setQueryData(["/api/auth/user"], user);
  };

  const signOut = async () => {
    try {
      // Call logout endpoint to clear cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
    
    localStorage.removeItem('auth-token');
    setToken(null);
    queryClient.clear();
    window.location.href = '/';
  };

  const refreshToken = async () => {
    if (!token) return null;
    
    try {
      const response = await apiRequest("POST", "/api/auth/refresh", { token });
      const data = await response.json();
      
      const newToken = data.token;
      localStorage.setItem('auth-token', newToken);
      setToken(newToken);
      
      return newToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      signOut();
      return null;
    }
  };

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    token,
    signIn,
    signOut,
    refreshToken,
    error,
  };
}