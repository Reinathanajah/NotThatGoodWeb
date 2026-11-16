const PATTERN_PALETTES = [
  { bg: '#181D29', stroke: '#D4940A', glow: '#9E2A2B' },
  { bg: '#1D1820', stroke: '#E5A51B', glow: '#B93829' },
  { bg: '#141A24', stroke: '#C8A24A', glow: '#3B5875' },
  { bg: '#211A16', stroke: '#D4940A', glow: '#7A3E2E' },
  { bg: '#161C1B', stroke: '#B89B5E', glow: '#3F6258' },
] as const

interface CourseArtworkProps {
  courseId: number
  code: string
  className?: string
}

export function CourseArtwork({ courseId, code, className }: CourseArtworkProps) {
  const hash = Math.abs(
    code.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), courseId),
  )
  const palette = PATTERN_PALETTES[hash % PATTERN_PALETTES.length]
  const offset = (hash % 5) * 14

  return (
    <svg
      width={320}
      height={112}
      viewBox="0 0 320 112"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="320" height="112" fill={palette.bg} />
      <circle cx={240 - offset} cy="28" r="54" fill={palette.glow} opacity="0.28" />
      <path
        d={`M0 ${86 - (hash % 18)} L110 48 L210 74 L320 34 L320 112 L0 112 Z`}
        fill={palette.stroke}
        opacity="0.16"
      />
      <path
        d={`M0 98 L${90 + offset} 62 L${190 + offset} 84 L320 50`}
        fill="none"
        stroke={palette.stroke}
        strokeWidth="2"
        opacity="0.72"
      />
      <text
        x="18"
        y="34"
        fill="#F4F1EA"
        fontSize="16"
        fontWeight="700"
        fontFamily="JetBrains Mono, monospace"
      >
        {code.slice(0, 12)}
      </text>
    </svg>
  )
}
