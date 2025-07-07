import { cn } from '@/lib/utils'
import { memo } from 'react'

export const KiwiLogo = memo(
  ({
    className,
    logoClassName,
  }: {
    className?: string
    logoClassName?: string
  }) => (
    <div className={cn('p-2 bg-muted rounded-full', className)}>
      <img
        src="/kiwi.svg"
        alt="Kiwi Logo"
        className={cn('size-7', logoClassName)}
      />
    </div>
  )
)
