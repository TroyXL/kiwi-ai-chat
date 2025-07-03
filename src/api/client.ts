interface ErrorResponse {
  code: number;
  message: string;
}

// Use a custom RequestOptions to properly type the body
interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, any>;
  body?: Record<string, any> | any[];
}

async function apiClient<T>(endpoint: string, { body, params, ...customConfig }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  let url = `${baseUrl}${endpoint}`;
  
  if (params) {
    const queryParams = new URLSearchParams(params);
    url += `?${queryParams.toString()}`;
  }

  const response = await fetch(url, config);

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return Promise.resolve(null as unknown as T);
  }
  
  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    const error: ErrorResponse = data;
    return Promise.reject(new Error(error.message || `API request failed with status ${response.status}`));
  }

  return data as T;
}

export default apiClient;