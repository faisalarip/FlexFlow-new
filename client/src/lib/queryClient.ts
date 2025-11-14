import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const resolveUrl = (u: string) => {
    if (u.startsWith("/")) {
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || "";
      if (Capacitor.isNativePlatform()) {
        if (!apiBase) {
          console.warn("VITE_API_BASE_URL not set for native platform; requests to relative paths will fail.");
        }
        return `${apiBase}${u}`;
      }
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      return `${origin}${u}`;
    }
    return u;
  };

  const finalUrl = resolveUrl(url);
  const token = localStorage.getItem('auth-token');
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(finalUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const resolveUrl = (u: string) => {
      if (u.startsWith("/")) {
        const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || "";
        if (Capacitor.isNativePlatform()) {
          if (!apiBase) {
            console.warn("VITE_API_BASE_URL not set for native platform; requests to relative paths will fail.");
          }
          return `${apiBase}${u}`;
        }
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        return `${origin}${u}`;
      }
      return u;
    };

    const token = localStorage.getItem('auth-token');
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Build URL with proper query parameters
    let url = queryKey[0] as string;
    
    // If there's a second element and it's an object, convert to query params
    if (queryKey.length > 1 && typeof queryKey[1] === 'object' && queryKey[1] !== null) {
      const params = new URLSearchParams();
      const queryParams = queryKey[1] as Record<string, string>;
      
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const finalUrl = resolveUrl(url);
    const res = await fetch(finalUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
