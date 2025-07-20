import type { ReactNode } from "react"

interface RichTextProps {
  children?: ReactNode
  content?: string
  className?: string
}

export function RichText({ children, content, className }: RichTextProps) {
  if (content) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return <div className={className}>{children}</div>
}
