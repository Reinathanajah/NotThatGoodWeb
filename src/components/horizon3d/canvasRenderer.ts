import { drawOrbitalBeacons, type HitTarget, type ScenePalette } from './beaconRenderer.ts'
import { projectPoint, rotatePoint } from './projectionMath.ts'
import { TOWER_EDGES, TOWER_FACES, TOWER_VERTICES } from './campusGeometry.ts'

export { getScenePalette, type HitTarget } from './beaconRenderer.ts'

export function drawHorizon3DScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  yaw: number,
  pitch: number,
  activeId: string | null,
  palette: ScenePalette,
): HitTarget[] {
  ctx.clearRect(0, 0, width, height)

  const fov = Math.min(width, height) * 0.86
  const cameraDist = 6.3

  const rotated = TOWER_VERTICES.map((v) => rotatePoint(v, yaw, pitch))
  const projected = rotated.map((v) => projectPoint(v, width, height, fov, cameraDist))

  const sortedFaces = TOWER_FACES.map((indices) => {
    const avgZ = indices.reduce((acc, idx) => acc + rotated[idx].z, 0) / indices.length
    return { indices, avgZ }
  }).sort((a, b) => a.avgZ - b.avgZ)

  ctx.fillStyle = palette.faceFill
  for (const face of sortedFaces) {
    ctx.beginPath()
    face.indices.forEach((idx, pos) => {
      const pt = projected[idx]
      if (pos === 0) ctx.moveTo(pt.x, pt.y)
      else ctx.lineTo(pt.x, pt.y)
    })
    ctx.closePath()
    ctx.fill()
  }

  ctx.lineCap = 'round'
  for (let i = 0; i < TOWER_EDGES.length; i++) {
    const [a, b] = TOWER_EDGES[i]
    const pa = projected[a]
    const pb = projected[b]
    const isHighlight = i >= 36
    ctx.strokeStyle = isHighlight ? palette.accent : palette.wireframe
    ctx.lineWidth = isHighlight ? 2 : 1.25
    ctx.beginPath()
    ctx.moveTo(pa.x, pa.y)
    ctx.lineTo(pb.x, pb.y)
    ctx.stroke()
  }

  return drawOrbitalBeacons(ctx, width, height, yaw, pitch, fov, cameraDist, activeId, palette)
}
