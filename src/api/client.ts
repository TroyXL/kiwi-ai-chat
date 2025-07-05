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

  // START MODIFICATION - Complete Refactor of Response Handling

  // Highest priority: check for auth errors and redirect immediately.
  // This is done BEFORE attempting to parse any response body.
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('authToken');
    window.location.replace('/login');
    // Return a promise that never resolves to halt the call stack.
    return new Promise(() => {}); 
  }

  // Handle successful but empty responses.
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return Promise.resolve(null as unknown as T);
  }
  
  // For any other response (both success with body and other errors), get the text.
  const responseText = await response.text();

  if (!response.ok) {
    // Handle non-auth errors (e.g., 400, 404, 500).
    // We try to parse the body for a detailed error message from the API.
    let errorMessage = `API request failed with status ${response.status}`;
    try {
      const errorData: ErrorResponse = JSON.parse(responseText);
      if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // The error response wasn't valid JSON. We'll use the generic message.
      console.error("Could not parse API error response body:", responseText);
    }
    return Promise.reject(new Error(errorMessage));
  }

  // Handle successful responses with a body.
  try {
    const data = JSON.parse(responseText);
    return data as T;
  } catch (e) {
    console.error("Failed to parse successful API response body:", responseText, e);
    return Promise.reject(new Error("Failed to parse API response."));
  }
  // END MODIFICATION
}

export default apiClient;