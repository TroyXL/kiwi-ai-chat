import { useCreation } from 'ahooks'
import markdownit from 'markdown-it'
import { memo } from 'react'

const md = markdownit()

export const MdRenderer = memo(
  ({ content, className }: { content: string; className?: string }) => {
    const html = useCreation(() => md.render(content), [content])

    return (
      <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
    )
  }
)
