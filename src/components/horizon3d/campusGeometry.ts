import type { Vec3 } from './projectionMath.ts'

export interface FacultyBeacon {
  id: string
  code: string
  name: string
  moodleCategoryId: number
  focusYaw: number
  pos: Vec3
}

// Vertex tiers: 0-3 podium, 4-7 waist, 8-11 shaft, 12-15 eaves, 16-21 roof and spire.
export const TOWER_VERTICES: readonly Vec3[] = [
  { x: -1.15, y: -1.05, z: -1.15 },
  { x: 1.15, y: -1.05, z: -1.15 },
  { x: 1.15, y: -1.05, z: 1.15 },
  { x: -1.15, y: -1.05, z: 1.15 },
  { x: -0.92, y: -0.65, z: -0.92 },
  { x: 0.92, y: -0.65, z: -0.92 },
  { x: 0.92, y: -0.65, z: 0.92 },
  { x: -0.92, y: -0.65, z: 0.92 },
  { x: -0.78, y: 0.58, z: -0.78 },
  { x: 0.78, y: 0.58, z: -0.78 },
  { x: 0.78, y: 0.58, z: 0.78 },
  { x: -0.78, y: 0.58, z: 0.78 },
  { x: -1.08, y: 0.78, z: -1.08 },
  { x: 1.08, y: 0.78, z: -1.08 },
  { x: 1.08, y: 0.78, z: 1.08 },
  { x: -1.08, y: 0.78, z: 1.08 },
  { x: -0.44, y: 1.32, z: -0.44 },
  { x: 0.44, y: 1.32, z: -0.44 },
  { x: 0.44, y: 1.32, z: 0.44 },
  { x: -0.44, y: 1.32, z: 0.44 },
  { x: 0, y: 1.82, z: 0 },
  { x: 0, y: 2.28, z: 0 },
]

export const TOWER_FACES: ReadonlyArray<readonly number[]> = [
  [4, 5, 9, 8],
  [5, 6, 10, 9],
  [6, 7, 11, 10],
  [7, 4, 8, 11],
  [12, 13, 17, 16],
  [13, 14, 18, 17],
  [14, 15, 19, 18],
  [15, 12, 16, 19],
  [16, 17, 20],
  [17, 18, 20],
  [18, 19, 20],
  [19, 16, 20],
]

export const TOWER_EDGES: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [8, 9], [9, 10], [10, 11], [11, 8],
  [12, 13], [13, 14], [14, 15], [15, 12],
  [16, 17], [17, 18], [18, 19], [19, 16],
  [0, 4], [1, 5], [2, 6], [3, 7],
  [4, 8], [5, 9], [6, 10], [7, 11],
  [8, 12], [9, 13], [10, 14], [11, 15],
  [12, 16], [13, 17], [14, 18], [15, 19],
  [16, 20], [17, 20], [18, 20], [19, 20],
  [20, 21],
  [4, 9], [5, 10], [6, 11], [7, 8],
]

const ORBIT_DEFS = [
  { id: 'engineering', code: 'ENG', name: 'Faculty of Engineering', moodleCategoryId: 1007 },
  { id: 'computer-science', code: 'CS', name: 'Faculty of Computer Science', moodleCategoryId: 1008 },
  { id: 'science', code: 'SCI', name: 'Faculty of Science & Mathematics', moodleCategoryId: 1401 },
  { id: 'medicine', code: 'MED', name: 'Faculty of Medicine', moodleCategoryId: 1001 },
  { id: 'economics', code: 'ECON', name: 'Faculty of Economics & Business', moodleCategoryId: 1010 },
  { id: 'law', code: 'LAW', name: 'Faculty of Law', moodleCategoryId: 1009 },
] as const

export const FACULTY_BEACONS: readonly FacultyBeacon[] = ORBIT_DEFS.map((item, idx) => {
  const angle = (idx / ORBIT_DEFS.length) * Math.PI * 2
  const radius = 2.15
  return {
    ...item,
    focusYaw: -angle,
    pos: {
      x: Math.sin(angle) * radius,
      y: idx % 2 === 0 ? 0.16 : -0.18,
      z: Math.cos(angle) * radius,
    },
  }
})
