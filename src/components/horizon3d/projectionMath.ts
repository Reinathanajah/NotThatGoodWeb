export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface ProjectedPoint {
  x: number
  y: number
  z: number
  scale: number
}

export function rotatePoint(pt: Vec3, yaw: number, pitch: number): Vec3 {
  const cosY = Math.cos(yaw)
  const sinY = Math.sin(yaw)
  const x1 = pt.x * cosY - pt.z * sinY
  const z1 = pt.x * sinY + pt.z * cosY

  const cosP = Math.cos(pitch)
  const sinP = Math.sin(pitch)
  const y2 = pt.y * cosP - z1 * sinP
  const z2 = pt.y * sinP + z1 * cosP

  return { x: x1, y: y2, z: z2 }
}

export function projectPoint(
  pt: Vec3,
  width: number,
  height: number,
  fov: number,
  cameraDistance: number,
): ProjectedPoint {
  const denom = Math.max(0.8, cameraDistance - pt.z)
  const scale = fov / denom
  return {
    x: width * 0.5 + pt.x * scale,
    y: height * 0.52 - pt.y * scale,
    z: pt.z,
    scale,
  }
}

export function normalizeAngle(radians: number): number {
  const twoPi = Math.PI * 2
  let angle = radians % twoPi
  if (angle > Math.PI) angle -= twoPi
  if (angle < -Math.PI) angle += twoPi
  return angle
}

export function stepAngleToward(current: number, target: number, factor: number): number {
  const diff = normalizeAngle(target - current)
  return current + diff * factor
}
