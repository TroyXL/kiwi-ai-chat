import { LanguageSwitcher } from '@/components/language-switcher'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircleIcon } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { KiwiLogo } from '../components/kiwi-logo'
import { useAuth } from '../contexts/AuthContext'

export const LoginPage = () => {
  const { t } = useTranslation()
  const { login, register, isAuthenticated } = useAuth()

  const [isLoginMode, setIsLoginMode] = useState(true)
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isLoginMode && password !== confirmPassword) {
      setError(t('login.errorPasswordsDontMatch'))
      return
    }

    setLoading(true)
    try {
      if (isLoginMode) {
        await login(userName, password)
      } else {
        await register(userName, password)
        toast.success(t('login.registerSuccess'))
      }
    } catch (err) {
      setError(
        (err as Error).message ||
          (isLoginMode ? t('login.error') : 'Failed to register')
      )
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setError('')
    setUserName('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <>
      <div className="fixed-center h-[35rem] space-y-4">
        <section className="flex items-center gap-4 px-4 pb-2">
          <KiwiLogo />
          <h2 className="text-2xl">
            {isLoginMode ? t('login.title') : t('login.registerTitle')}
          </h2>
        </section>

        <form
          className="w-[30rem] border p-4 space-y-6 rounded-md bg-card shadow-lg"
          onSubmit={handleSubmit}
        >
          <div className="space-y-3">
            <Label className="px-2" htmlFor="username">
              {t('login.usernameLabel')}
            </Label>
            <Input
              id="username"
              type="text"
              required
              value={userName}
              onChange={e => setUserName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="px-2" htmlFor="password">
              {t('login.passwordLabel')}
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {!isLoginMode && (
            <div className="space-y-3">
              <Label className="px-2" htmlFor="confirm-password">
                {t('login.confirmPasswordLabel')}
              </Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <div>
            <Button variant="default" className="w-full" disabled={loading}>
              {loading
                ? isLoginMode
                  ? t('login.buttonLoading')
                  : t('login.registerButtonLoading')
                : isLoginMode
                ? t('login.button')
                : t('login.registerButton')}
            </Button>

            <Button
              variant="link"
              className="w-full font-normal"
              onClick={toggleMode}
            >
              {isLoginMode
                ? t('login.switch_to_register')
                : t('login.switch_to_login')}
            </Button>
          </div>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
      </div>
      <LanguageSwitcher className="fixed top-4 right-4" />
    </>
  )
}
