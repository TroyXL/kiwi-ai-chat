import { Loader } from 'lucide-react'
import { memo } from 'react'

// src/components/Spinner.tsx
export const Spinner = memo(() => <Loader className="animate-spin" size={14} />)
