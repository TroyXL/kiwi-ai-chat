import apiClient from './client';

interface LoginResponse {
  token: string;
}

// This function now handles both the primary login and the secondary management API call.
export const login = async (userName: string, password: string) => {
  // Step 1: Perform the primary login to get the token.
  const data = await apiClient<LoginResponse>('/auth/login', {
    body: { userName, password: password },
  });

  const token = data.token;
  if (token) {
    // Step 2: Store the token for the main application to use.
    localStorage.setItem('authToken', data.token);

    // Step 3: Make the secondary, "fire-and-forget" call to the management API.
    const mgmtApiBaseUrl = import.meta.env.VITE_MGMT_API_BASE_URL;
    if (mgmtApiBaseUrl) {
      const mgmtLoginUrl = `${mgmtApiBaseUrl}/login-with-token`;
      try {
        // Uses the absolute URL from the environment variable
        fetch(mgmtLoginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: token }),
          credentials: 'include',
        }).catch(error => {
            console.error('Failed to call management API login:', error);
        });
        console.log('Successfully initiated login with management API.');
      } catch (error) {
        // This catch block handles synchronous errors.
        console.error('Error initiating management API login call:', error);
      }
    }
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