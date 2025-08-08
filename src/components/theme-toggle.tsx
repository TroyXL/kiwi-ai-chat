import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getStorage, setStorage } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { isUndefined } from 'lodash'
import { Check, Moon, Sun } from 'lucide-react'
import { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => void 0,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (getStorage('kiwi:ui:theme') as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setStorage('kiwi:ui:theme', theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (isUndefined(context))
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const isLight = theme === 'light'
  const isDark = theme === 'dark'
  const isSystem = theme === 'system'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn('!border-border/80 shadow-md', className)}
          variant="outline"
          size="icon-sm"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          className="w-full flex justify-between items-center"
          onClick={() => setTheme('light')}
        >
          <span>{t('theme.light')}</span>
          {isLight && <Check className="text-foreground" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="w-full flex justify-between items-center"
          onClick={() => setTheme('dark')}
        >
          <span>{t('theme.dark')}</span>
          {isDark && <Check className="text-foreground" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="w-full flex justify-between items-center"
          onClick={() => setTheme('system')}
        >
          <span>{t('theme.system')}</span>
          {isSystem && <Check className="text-foreground" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
