function isFinderSquare(row: number, col: number, size: number): boolean {
  const inTopLeft = row < 7 && col < 7
  const inTopRight = row < 7 && col >= size - 7
  const inBottomLeft = row >= size - 7 && col < 7
  return inTopLeft || inTopRight || inBottomLeft
}

function finderBit(r: number, c: number): boolean {
  if (r === 0 || r === 6 || c === 0 || c === 6) return true
  if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true
  return false
}

export interface QrMatrix {
  size: number
  modules: boolean[][]
}

export function buildDeterministicQrMatrix(payload: string): QrMatrix {
  const size = 21
  let seed = 2166136261
  for (let i = 0; i < payload.length; i += 1) {
    seed ^= payload.charCodeAt(i)
    seed = Math.imul(seed, 16777619) >>> 0
  }

  const modules: boolean[][] = []
  for (let r = 0; r < size; r += 1) {
    const row: boolean[] = []
    for (let c = 0; c < size; c += 1) {
      if (r < 7 && c < 7) {
        row.push(finderBit(r, c))
      } else if (r < 7 && c >= size - 7) {
        row.push(finderBit(r, c - (size - 7)))
      } else if (r >= size - 7 && c < 7) {
        row.push(finderBit(r - (size - 7), c))
      } else if (
        (r === 7 && c <= 7) ||
        (c === 7 && r <= 7) ||
        (r === 7 && c >= size - 8) ||
        (c === size - 8 && r <= 7) ||
        (r === size - 8 && c <= 7) ||
        (c === 7 && r >= size - 8)
      ) {
        row.push(false)
      } else if (r === 6 || c === 6) {
        row.push((r + c) % 2 === 0)
      } else if (!isFinderSquare(r, c, size)) {
        const mix = (seed ^ Math.imul(r + 17, 73856093) ^ Math.imul(c + 31, 19349663)) >>> 0
        row.push((mix & 1) === 1 || ((mix >> 3) & 3) === 0)
      } else {
        row.push(false)
      }
    }
    modules.push(row)
  }

  return { size, modules }
}
