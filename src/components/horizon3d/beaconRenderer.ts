import { projectPoint, rotatePoint, type ProjectedPoint } from './projectionMath.ts'
import { FACULTY_BEACONS, type FacultyBeacon } from './campusGeometry.ts'

export interface ScenePalette {
  wireframe: string
  faceFill: string
  accent: string
  horizonGlow: string
  beaconIdle: string
  beaconActive: string
  labelBg: string
  labelText: string
}

export interface HitTarget {
  beacon: FacultyBeacon
  x: number
  y: number
  radius: number
}

export function getScenePalette(theme: 'dark' | 'light'): ScenePalette {
  if (theme === 'light') {
    return {
      wireframe: 'rgba(20, 22, 27, 0.55)',
      faceFill: 'rgba(140, 92, 0, 0.10)',
      accent: '#8C5C00',
      horizonGlow: 'rgba(158, 42, 43, 0.55)',
      beaconIdle: '#494E59',
      beaconActive: '#8C5C00',
      labelBg: 'rgba(255, 255, 255, 0.92)',
      labelText: '#14161B',
    }
  }
  return {
    wireframe: 'rgba(244, 241, 234, 0.42)',
    faceFill: 'rgba(212, 148, 10, 0.11)',
    accent: '#D4940A',
    horizonGlow: 'rgba(196, 62, 50, 0.55)',
    beaconIdle: '#B9B4AA',
    beaconActive: '#F4E8C1',
    labelBg: 'rgba(14, 16, 21, 0.88)',
    labelText: '#F4F1EA',
  }
}

export function drawOrbitalBeacons(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  yaw: number,
  pitch: number,
  fov: number,
  cameraDist: number,
  activeId: string | null,
  palette: ScenePalette,
): HitTarget[] {
  const ringPoints: ProjectedPoint[] = []
  for (let s = 0; s <= 48; s++) {
    const a = (s / 48) * Math.PI * 2
    const r = rotatePoint({ x: Math.sin(a) * 2.15, y: 0, z: Math.cos(a) * 2.15 }, yaw, pitch)
    ringPoints.push(projectPoint(r, width, height, fov, cameraDist))
  }

  ctx.strokeStyle = palette.horizonGlow
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ringPoints.forEach((pt, idx) => {
    if (idx === 0) ctx.moveTo(pt.x, pt.y)
    else ctx.lineTo(pt.x, pt.y)
  })
  ctx.stroke()

  const items = FACULTY_BEACONS.map((beacon) => {
    const r = rotatePoint(beacon.pos, yaw, pitch)
    const p = projectPoint(r, width, height, fov, cameraDist)
    return { beacon, p, z: r.z }
  }).sort((a, b) => a.z - b.z)

  ctx.font = '600 14px "Plus Jakarta Sans", system-ui, sans-serif'
  ctx.textBaseline = 'middle'

  const targets: HitTarget[] = []
  for (const { beacon, p } of items) {
    const isActive = beacon.id === activeId
    ctx.fillStyle = isActive ? palette.beaconActive : palette.beaconIdle
    ctx.beginPath()
    ctx.arc(p.x, p.y, isActive ? 7.5 : 5.5, 0, Math.PI * 2)
    ctx.fill()

    const labelWidth = ctx.measureText(beacon.code).width + 14
    const lx = p.x + 11
    const ly = p.y - 12
    ctx.fillStyle = palette.labelBg
    ctx.fillRect(lx, ly, labelWidth, 24)
    ctx.strokeStyle = isActive ? palette.accent : palette.wireframe
    ctx.lineWidth = isActive ? 1.5 : 1
    ctx.strokeRect(lx, ly, labelWidth, 24)
    ctx.fillStyle = palette.labelText
    ctx.fillText(beacon.code, lx + 7, p.y)

    targets.push({ beacon, x: p.x, y: p.y, radius: 24 })
  }
  return targets
}
