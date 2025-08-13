import alovaInstance from '.'

interface LoginResponse {
  token: string
}

// 使用 alovajs 重构登录功能
export async function login(userName: string, password: string) {
  const data = await alovaInstance.Post<LoginResponse>('/auth/login', {
    userName,
    password,
  })

  const token = data.token
  if (token) {
    // 步骤 2: 存储令牌供主应用程序使用
    localStorage.setItem('authToken', data.token)

    // 步骤 3: 对管理 API 进行次要的"即发即忘"调用
    const mgmtApiBaseUrl = import.meta.env.VITE_MGMT_API_BASE_URL
    if (mgmtApiBaseUrl) {
      const mgmtLoginUrl = `${mgmtApiBaseUrl}/login-with-token`
      try {
        // 使用环境变量中的绝对 URL
        fetch(mgmtLoginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: token }),
          credentials: 'include',
        }).catch(error => {
          console.error('Failed to call management API login:', error)
        })
        console.log('Successfully initiated login with management API.')
      } catch (error) {
        // 此 catch 块处理同步错误
        console.error('Error initiating management API login call:', error)
      }
    }
  }
}

export function register(userName: string, password: string) {
  return alovaInstance.Post<void>('/auth/register', {
    userName,
    password,
  })
}

export async function logout() {
  try {
    await alovaInstance.Post<void>('/auth/logout')
  } catch (error) {
    console.error('Logout API call failed, but clearing token anyway.', error)
  } finally {
    localStorage.removeItem('authToken')
  }
}
