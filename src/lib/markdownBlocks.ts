export type MarkdownBlock =
  | { kind: 'heading'; level: 2 | 3; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'paragraph'; text: string }

/** Parse simple markdown text safely into typed UI blocks without raw HTML injection. */
export function parseMarkdownBlocks(source: string): MarkdownBlock[] {
  const lines = source.split(/\r?\n/)
  const blocks: MarkdownBlock[] = []
  let listItems: string[] = []
  let paraLines: string[] = []

  const flushParagraph = () => {
    if (paraLines.length > 0) {
      blocks.push({ kind: 'paragraph', text: paraLines.join(' ') })
      paraLines = []
    }
  }

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ kind: 'list', items: listItems })
      listItems = []
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushParagraph()
      flushList()
      continue
    }
    if (line.startsWith('### ')) {
      flushParagraph()
      flushList()
      blocks.push({ kind: 'heading', level: 3, text: line.slice(4).trim() })
      continue
    }
    if (line.startsWith('## ') || line.startsWith('# ')) {
      flushParagraph()
      flushList()
      const text = line.replace(/^#+\s*/, '').trim()
      blocks.push({ kind: 'heading', level: 2, text })
      continue
    }
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      flushParagraph()
      listItems.push(line.replace(/^([-*]|\d+\.)\s+/, '').trim())
      continue
    }
    flushList()
    paraLines.push(line)
  }

  flushParagraph()
  flushList()
  return blocks
}
