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
}

export function useNewAuth() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth-token');
  });
  const queryClient = useQueryClient();

  // Fetch user data with JWT token
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      if (!token) return null;
      
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear it
          localStorage.removeItem('auth-token');
          setToken(null);
        }
        throw new Error('Failed to fetch user');
      }
      
      return response.json();
    },
    enabled: !!token,
    retry: false,
  });

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const oauthToken = urlParams.get('token');
      const userDataStr = urlParams.get('user');
      
      if (oauthToken && userDataStr && localStorage.getItem('oauth-in-progress')) {
        try {
          const userData = JSON.parse(decodeURIComponent(userDataStr));
          
          // Store token and user data
          localStorage.setItem('auth-token', oauthToken);
          setToken(oauthToken);
          
          // Clear OAuth flags
          localStorage.removeItem('oauth-in-progress');
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Invalidate queries to refetch with new token
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        } catch (error) {
          console.error('Failed to parse OAuth callback data:', error);
        }
      }
    };

    handleOAuthCallback();
  }, [queryClient]);

  const signIn = (user: AuthUser, authToken: string) => {
    localStorage.setItem('auth-token', authToken);
    setToken(authToken);
    queryClient.setQueryData(["/api/auth/user"], user);
  };

  const signOut = async () => {
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
    isLoading: !!token && isLoading,
    isAuthenticated: !!token && (!!user || !isLoading),
    token,
    signIn,
    signOut,
    refreshToken,
    error,
  };
}