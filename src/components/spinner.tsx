import { cn } from '@/lib/utils'
import { Loader } from 'lucide-react'
import { memo } from 'react'

// src/components/Spinner.tsx
export const Spinner = memo(({ className }: { className?: string }) => (
  <Loader
    className={cn('animate-spin [animation-duration:3000ms]', className)}
    size={14}
  />
))
