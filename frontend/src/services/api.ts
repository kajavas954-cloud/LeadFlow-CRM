const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// In-memory access token storage
let accessToken: string | null = null;
let refreshInProgress: Promise<string | null> | null = null;

export function setLocalAccessToken(token: string | null) {
  accessToken = token;
}

export function getLocalAccessToken(): string | null {
  return accessToken;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInProgress) {
    return refreshInProgress;
  }

  refreshInProgress = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const result = await response.json();
      if (result.success && result.data.accessToken) {
        accessToken = result.data.accessToken;
        return accessToken;
      }
      return null;
    } catch (e) {
      accessToken = null;
      return null;
    } finally {
      refreshInProgress = null;
    }
  })();

  return refreshInProgress;
}

export async function apiRequest(endpoint: string, options: RequestOptions = {}): Promise<any> {
  const { skipAuth = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});

  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach access token if present and not skipped
  if (accessToken && !skipAuth) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  fetchOptions.headers = headers;
  fetchOptions.credentials = 'include'; // Essential for HTTP-only cookies

  let response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

  // If 401 and we have a token or cookie, attempt auto-refresh
  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry request with the new token
      headers.set('Authorization', `Bearer ${newToken}`);
      fetchOptions.headers = headers;
      response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
    }
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'API request failed');
  }

  return result;
}
