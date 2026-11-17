import { Fragment, type ReactNode } from 'react'
import { isSafeHttpUrl } from '../../lib/formatBytes.ts'

interface SafeHtmlBlockProps {
  html: string | null | undefined
  className?: string
}

const ALLOWED_TAGS = new Set([
  'P',
  'BR',
  'STRONG',
  'B',
  'EM',
  'I',
  'CODE',
  'PRE',
  'UL',
  'OL',
  'LI',
  'A',
  'H3',
  'H4',
  'BLOCKQUOTE',
])

function renderDomNode(node: ChildNode, key: string): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null

  const el = node as Element
  const tag = el.tagName.toUpperCase()
  const children = Array.from(el.childNodes).map((child, idx) =>
    renderDomNode(child, `${key}-${idx}`),
  )

  if (!ALLOWED_TAGS.has(tag)) {
    return <Fragment key={key}>{children}</Fragment>
  }

  if (tag === 'BR') return <br key={key} />
  if (tag === 'P') return <p key={key}>{children}</p>
  if (tag === 'STRONG' || tag === 'B') return <strong key={key}>{children}</strong>
  if (tag === 'EM' || tag === 'I') return <em key={key}>{children}</em>
  if (tag === 'CODE') return <code key={key} className="sf-inline-code">{children}</code>
  if (tag === 'PRE') return <pre key={key} className="sf-inline-code">{children}</pre>
  if (tag === 'UL') return <ul key={key}>{children}</ul>
  if (tag === 'OL') return <ol key={key}>{children}</ol>
  if (tag === 'LI') return <li key={key}>{children}</li>
  if (tag === 'H3' || tag === 'H4') return <h3 key={key}>{children}</h3>
  if (tag === 'BLOCKQUOTE') return <blockquote key={key}>{children}</blockquote>
  if (tag === 'A') {
    const safeHref = isSafeHttpUrl(el.getAttribute('href'))
    if (!safeHref) return <Fragment key={key}>{children}</Fragment>
    return (
      <a key={key} href={safeHref} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    )
  }

  return <Fragment key={key}>{children}</Fragment>
}

export function SafeHtmlBlock({ html, className }: SafeHtmlBlockProps) {
  if (!html || !html.trim()) return null

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const nodes = Array.from(doc.body.childNodes).map((node, idx) =>
    renderDomNode(node, `html-${idx}`),
  )

  return <div className={className ? `safe-html ${className}` : 'safe-html'}>{nodes}</div>
}
