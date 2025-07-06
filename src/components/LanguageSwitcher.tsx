import { Check, Languages } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export const LanguageSwitcher = memo(
  ({ className }: { className?: string }) => {
    const { i18n } = useTranslation()
    const isEn = useMemo(() => i18n.language.startsWith('en'), [i18n.language])
    const handleSwitchLanguage = useCallback(
      (lng: string) => {
        i18n.changeLanguage(lng)
      },
      [i18n]
    )

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={className}>
            <Languages />
            <span>{isEn ? 'English' : '中文'}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <div
                className="w-full flex justify-between items-center"
                onClick={() => handleSwitchLanguage('en')}
              >
                <span>English</span>
                {isEn && <Check className="text-foreground" />}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div
                className="w-full flex justify-between items-center"
                onClick={() => handleSwitchLanguage('zh')}
              >
                <span>中文</span>
                {!isEn && <Check className="text-foreground" />}
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)
