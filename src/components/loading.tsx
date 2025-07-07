import { Spinner } from '@/components/spinner'
import { memo } from 'react'

export const Loading = memo(({ message }: { message: string }) => {
  return (
    <p className="absolute-center flex flex-col items-center gap-2 text-muted-foreground text-xs font-light">
      <Spinner />
      {message}
    </p>
  )
})
