import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import authController from '@/controllers/auth-controller'
import exchangeController from '@/controllers/exchange-controller'
import { setStorage } from '@/lib/storage'
import { useMemoizedFn } from 'ahooks'
import { AlertCircleIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import { toast } from 'sonner'
import { KiwiLogo } from '../components/kiwi-logo'

export default observer(() => {
  const { t } = useTranslation()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = useMemoizedFn(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isLoginMode && password !== confirmPassword) {
      setError(t('login.errorPasswordsDontMatch'))
      return
    }

    setLoading(true)
    try {
      if (isLoginMode) {
        await authController.login(userName, password)
        exchangeController.updatePreviewMode('desktop')
        setStorage('kiwi:ui:sidebar-opened', true)
      } else {
        await authController.register(userName, password)
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
  })

  const toggleMode = useMemoizedFn(() => {
    setIsLoginMode(!isLoginMode)
    setError('')
    setUserName('')
    setPassword('')
    setConfirmPassword('')
  })

  if (authController.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <div className="fixed-center h-[35rem] max-w-[30rem] w-5/6 space-y-4">
        <section className="flex items-center gap-4 px-4 pb-2">
          <KiwiLogo />
          <h2 className="text-2xl">
            {isLoginMode ? t('login.title') : t('login.registerTitle')}
          </h2>
        </section>

        <form
          className="border p-4 space-y-6 rounded-md bg-card shadow-lg"
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
      <div className="fixed top-4 right-4 space-x-2">
        <LanguageSwitcher simple />
        <ThemeToggle />
      </div>
    </>
  )
})
