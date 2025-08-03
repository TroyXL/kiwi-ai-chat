import { cn } from '@/lib/utils'
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
            className={cn('!border-border/80 shadow-md', className)}
            variant="outline"
            size={simple ? 'icon-sm' : 'sm'}
          >
            <Languages />
            {!simple && <span>{isEn ? 'English' : '中文'}</span>}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handleSwitchLanguage('en')}>
              <div className="w-full flex justify-between items-center">
                <span>English</span>
                {isEn && <Check className="text-foreground" />}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSwitchLanguage('zh')}>
              <div className="w-full flex justify-between items-center">
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
