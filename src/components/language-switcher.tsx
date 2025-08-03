import { useMemoizedFn } from 'ahooks'
import { Check, Languages } from 'lucide-react'
import { memo, useMemo } from 'react'
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
  ({ simple, className }: { simple?: boolean; className?: string }) => {
    const { i18n } = useTranslation()
    const isEn = useMemo(() => i18n.language.startsWith('en'), [i18n.language])
    const handleSwitchLanguage = useMemoizedFn((lng: string) => {
      i18n.changeLanguage(lng)
    })

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={simple ? 'icon-sm' : 'sm'}
            className={className}
          >
            <Languages />
            {!simple && <span>{isEn ? 'English' : '中文'}</span>}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
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
