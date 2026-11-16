const UI_GRADE_SCALE: Array<readonly [string, number]> = [
  ['A', 85],
  ['A-', 80],
  ['B+', 75],
  ['B', 70],
  ['B-', 65],
  ['C+', 60],
  ['C', 55],
  ['D', 40],
  ['E', 0],
]

export function formatGrade(score: string | number | null | undefined): string {
  if (score === null || score === undefined) return '-'
  const numeric = Number(score)
  if (Number.isNaN(numeric)) return '-'
  return numeric.toFixed(2)
}

export function getLetterGrade(percentage: number | null | undefined): string | null {
  if (percentage === null || percentage === undefined || Number.isNaN(percentage)) {
    return null
  }
  const matched = UI_GRADE_SCALE.find(([, min]) => percentage >= min)
  return matched ? matched[0] : 'E'
}

export function computeWeightedCourseGrade(
  rows: Array<{ score: string | number | null; weight?: string | number | null }>,
): string | null {
  let weightedTotal = 0
  let totalWeight = 0

  for (const row of rows) {
    if (row.score === null) continue
    const numericScore = Number(row.score)
    if (Number.isNaN(numericScore)) continue
    const w = Number(row.weight ?? 1) || 1
    weightedTotal += numericScore * w
    totalWeight += w
  }

  if (totalWeight <= 0) return null
  return (weightedTotal / totalWeight).toFixed(2)
}
