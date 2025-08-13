import { XIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

export interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 关闭回调函数，如果提供则显示关闭按钮
   */
  onClose?: () => void
}

export function Tag({ className, children, onClose, ...props }: TagProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center bg-muted rounded px-2 py-1 text-sm',
        className
      )}
      {...props}
    >
      {children}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-1 rounded-full hover:bg-muted-foreground/10"
        >
          <XIcon className="size-3" />
          <span className="sr-only">关闭</span>
        </button>
      )}
    </div>
  )
}
