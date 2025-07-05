import apiClient from './client';
import { Application, SearchResult, Exchange } from './types';
import { fetchEventSource } from '@microsoft/fetch-event-source';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const searchApplications = (params: { name?: string; page?: number; pageSize?: number; newlyChangedId?: string }) => {
  return apiClient<SearchResult<Application>>('/app/search', {
    body: params,
  });
};

export const getApplication = (id: string) => {
  return apiClient<Application>(`/app/${id}`);
};

export const saveApplication = (app: Partial<Application>) => {
  return apiClient<string>('/app', {
    method: 'POST',
    body: app,
  });
};

export const deleteApplication = (id: string) => {
  return apiClient<void>(`/app/${id}`, {
    method: 'DELETE',
  });
};

export const searchExchanges = (params: { appId: string; prompt?: string; page?: number; pageSize?: number; }) => {
  return apiClient<SearchResult<Exchange>>('/generate/history', {
    body: params,
  });
}

export const cancelGeneration = (exchangeId: string) => {
  return apiClient<void>('/generate/cancel', {
    method: 'POST',
    body: { exchangeId },
  });
};

interface GenerateCodeListeners {
  onMessage: (event: Exchange) => void;
  onClose: () => void;
  onError: (err: any) => void;
}

const createEventSource = (
  url: string,
  listeners: GenerateCodeListeners,
  signal: AbortSignal,
  options?: { method?: 'GET' | 'POST', body?: any }
): void => {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'Accept': 'text/event-stream',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }

  fetchEventSource(url, {
    method: options?.method || 'GET',
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    signal,
    openWhenHidden: true,

    onopen: async (response) => {
      // START MODIFICATION
      // Prioritize handling auth errors for SSE connections.
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('authToken');
        window.location.replace('/login');
        // Throw an error to ensure the fetchEventSource library stops processing.
        // The redirect will happen, but this is clean.
        throw new Error(`Authentication failed with status ${response.status}`);
      }
      // END MODIFICATION

      if (!response.ok) {
        // This now correctly handles other non-auth server errors (e.g., 500).
        listeners.onError(new Error(`Failed to connect with status ${response.status}: ${response.statusText}`));
        throw new Error(`Failed to connect with status ${response.status}: ${response.statusText}`);
      }
    },

    onmessage: (event) => {
      if (event.event !== 'generation' || !event.data) {
        return;
      }
      try {
        const exchangeData = JSON.parse(event.data) as Exchange;
        console.log("Received 'generation' event with data:", exchangeData)
        listeners.onMessage(exchangeData);
      } catch (e) {
        console.error("Failed to parse SSE message data:", event.data, e);
      }
    },

    onclose: () => {
      listeners.onClose();
    },

    onerror: (err) => {
      listeners.onError(err);
    },
  });
}

export const generateCode = (
  params: { prompt: string; appId?: string; skipPageGeneration?: boolean; },
  listeners: GenerateCodeListeners,
  signal: AbortSignal
): void => {
  
  const url = `${API_BASE_URL}/generate`;
  
  const body: { prompt: string; appId?: string; skipPageGeneration?: boolean } = {
    prompt: params.prompt,
  };

  if (params.appId) {
    body.appId = params.appId;
  }
  
  if (params.skipPageGeneration) {
    body.skipPageGeneration = params.skipPageGeneration;
  }
  
  createEventSource(url, listeners, signal, {
    method: 'POST',
    body: body,
  });
};

export const reconnectExchange = (
  params: { exchangeId: string },
  listeners: GenerateCodeListeners,
  signal: AbortSignal
): void => {
  const queryParams = new URLSearchParams();
  queryParams.append('exchange-id', params.exchangeId);

  const url = `${API_BASE_URL}/generate/reconnect?${queryParams.toString()}`;
  createEventSource(url, listeners, signal);
};

export const retryGeneration = (
  params: { exchangeId: string },
  listeners: GenerateCodeListeners,
  signal: AbortSignal
): void => {
  const url = `${API_BASE_URL}/generate/retry`;
  createEventSource(url, listeners, signal, {
    method: 'POST',
    body: { exchangeId: params.exchangeId },
  });
};