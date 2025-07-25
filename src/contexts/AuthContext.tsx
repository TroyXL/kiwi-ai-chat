import { useMemoizedFn } from 'ahooks'
import { isUndefined } from 'lodash'
import { createContext, ReactNode, useContext, useState } from 'react'
import * as authApi from '../api/auth'

interface AuthContextType {
  isAuthenticated: boolean
  login: (userName: string, pass: string) => Promise<void>
  register: (userName: string, pass: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('authToken')
  )

  const login = useMemoizedFn(async (userName: string, password: string) => {
    await authApi.login(userName, password)
    setIsAuthenticated(true)
  })

  const register = useMemoizedFn(async (userName: string, password: string) => {
    await authApi.register(userName, password)
    await login(userName, password)
  })

  const logout = useMemoizedFn(async () => {
    await authApi.logout()
    setIsAuthenticated(false)
  })

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (isUndefined(context)) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
