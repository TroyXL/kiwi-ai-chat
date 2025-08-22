import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      richColors
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--error-bg': 'var(--destructive / 10%)',
          '--error-text': 'var(--destructive)',
          '--error-border': 'var(--destructive)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
