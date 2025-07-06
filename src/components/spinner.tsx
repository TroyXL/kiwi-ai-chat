import { Loader } from 'lucide-react'
import { memo } from 'react'

// src/components/Spinner.tsx
export const Spinner = memo(() => (
  <Loader className="animate-spin [animation-duration:3000ms]" size={14} />
))
