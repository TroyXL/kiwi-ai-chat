import { cn } from '@/lib/utils'
import { memo } from 'react'

export const Beian = memo(({ className }: { className: string }) => {
  return (
    <a
      className={cn(
        `text-muted-foreground text-xs hover:text-blue-500 hover:underline`,
        className
      )}
      href="https://beian.miit.gov.cn/"
      target="_blank"
    >
      苏ICP备2022038935号-1
    </a>
  )
})
