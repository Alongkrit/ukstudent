const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

let currentAccessToken: string | null =
  typeof window !== 'undefined'
    ? localStorage.getItem('scholza_token') || localStorage.getItem('ukstudent_token')
    : null;

export function setAccessToken(token: string | null) {
  currentAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('scholza_token', token);
    } else {
      localStorage.removeItem('scholza_token');
      localStorage.removeItem('ukstudent_token');
    }
  }
}

export function getAccessToken(): string | null {
  if (typeof window !== 'undefined' && !currentAccessToken) {
    currentAccessToken = localStorage.getItem('scholza_token') || localStorage.getItem('ukstudent_token');
  }
  return currentAccessToken;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export async function ensureCsrfToken(): Promise<string | null> {
  let token = getCookie('csrfToken');
  if (!token) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/csrf`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        token = data.csrfToken;
      }
    } catch (err) {
      console.error('Failed to fetch CSRF token:', err);
    }
  }
  return token;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only default to application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Double submit CSRF token header for state-changing requests
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    // Attempt silent refresh
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.accessToken) {
          setAccessToken(refreshData.accessToken);
          headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
          return fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include',
          });
        }
      } else {
        setAccessToken(null);
      }
    } catch {
      setAccessToken(null);
    }
  }

  return response;
}
