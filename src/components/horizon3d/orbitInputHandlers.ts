import type { KeyboardEvent, PointerEvent } from 'react'
import type { HitTarget } from './canvasRenderer.ts'
import type { FacultyBeacon } from './campusGeometry.ts'

export interface OrbitCameraState {
  yaw: number
  pitch: number
  targetYaw: number | null
  dragging: boolean
  lastX: number
  lastY: number
  dragDistance: number
  visible: boolean
  hitTargets: HitTarget[]
}

export function applyOrbitPointerDown(
  e: PointerEvent<HTMLCanvasElement>,
  camera: OrbitCameraState,
): void {
  e.currentTarget.setPointerCapture(e.pointerId)
  camera.dragging = true
  camera.targetYaw = null
  camera.lastX = e.clientX
  camera.lastY = e.clientY
  camera.dragDistance = 0
}

export function applyOrbitPointerMove(
  e: PointerEvent<HTMLCanvasElement>,
  stageEl: HTMLDivElement | null,
  camera: OrbitCameraState,
  motionPaused: boolean,
  renderNow: () => void,
): void {
  if (!motionPaused && stageEl) {
    const rect = e.currentTarget.getBoundingClientRect()
    stageEl.style.setProperty('--hx', String(((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1))
    stageEl.style.setProperty('--hy', String(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1))
  }
  if (!camera.dragging) return
  const dx = e.clientX - camera.lastX
  const dy = e.clientY - camera.lastY
  camera.lastX = e.clientX
  camera.lastY = e.clientY
  camera.dragDistance += Math.hypot(dx, dy)
  camera.yaw += dx * 0.01
  camera.pitch = Math.max(-0.45, Math.min(0.65, camera.pitch + dy * 0.008))
  renderNow()
}

export function applyOrbitPointerUp(
  e: PointerEvent<HTMLCanvasElement>,
  camera: OrbitCameraState,
  selectBeacon: (beacon: FacultyBeacon) => void,
): void {
  const wasClick = camera.dragDistance < 6
  camera.dragging = false
  if (!wasClick) return

  const rect = e.currentTarget.getBoundingClientRect()
  const cx = e.clientX - rect.left
  const cy = e.clientY - rect.top
  const hit = camera.hitTargets.find((t) => Math.hypot(cx - t.x, cy - t.y) <= t.radius)
  if (hit) selectBeacon(hit.beacon)
}

export function applyOrbitKeyDown(
  e: KeyboardEvent<HTMLCanvasElement>,
  camera: OrbitCameraState,
  renderNow: () => void,
): void {
  if (e.key === 'ArrowLeft') camera.yaw -= 0.16
  else if (e.key === 'ArrowRight') camera.yaw += 0.16
  else if (e.key === 'ArrowUp') camera.pitch = Math.min(0.65, camera.pitch + 0.1)
  else if (e.key === 'ArrowDown') camera.pitch = Math.max(-0.45, camera.pitch - 0.1)
  else if (e.key === 'Home') {
    camera.yaw = -0.45
    camera.pitch = 0.18
  } else return
  e.preventDefault()
  renderNow()
}
