import apiClient from './client';

interface LoginResponse {
  token: string;
}

export const login = async (userName: string, password: string) => {
  const data = await apiClient<LoginResponse>('/auth/login', {
    body: { userName, password: password },
  });
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
};

export const register = (userName: string, password: string) => {
  return apiClient<void>('/auth/register', {
    method: 'POST',
    body: { userName, password },
  });
};

export const logout = async () => {
  try {
    await apiClient<void>('/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error("Logout API call failed, but clearing token anyway.", error);
  } finally {
    localStorage.removeItem('authToken');
  }
};