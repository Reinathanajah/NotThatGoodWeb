import { splitHighlightChunks } from './searchUtils.ts'

interface HighlightedTextProps {
  text: string
  query: string
}

export function HighlightedText({ text, query }: HighlightedTextProps) {
  const chunks = splitHighlightChunks(text, query)
  return (
    <>
      {chunks.map((chunk, idx) =>
        chunk.matched ? (
          <mark key={idx} className="cmd-match-mark">
            {chunk.text}
          </mark>
        ) : (
          <span key={idx}>{chunk.text}</span>
        ),
      )}
    </>
  )
}
