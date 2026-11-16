import { useCallback, useEffect, useRef, useState } from 'react'
import { useThemeObserver } from '../../hooks/useThemeObserver.ts'
import { drawHorizon3DScene, getScenePalette } from './canvasRenderer.ts'
import {
  applyOrbitKeyDown,
  applyOrbitPointerDown,
  applyOrbitPointerMove,
  applyOrbitPointerUp,
  type OrbitCameraState,
} from './orbitInputHandlers.ts'
import { stepAngleToward } from './projectionMath.ts'
import type { FacultyBeacon } from './campusGeometry.ts'

export function useHorizonOrbit(onSelectFaculty?: (beacon: FacultyBeacon) => void) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const renderNowRef = useRef<() => void>(() => {})
  const theme = useThemeObserver()
  const [activeId, setActiveId] = useState<string>('engineering')
  const [motionPaused, setMotionPaused] = useState<boolean>(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )

  const cameraRef = useRef<OrbitCameraState>({
    yaw: -0.45,
    pitch: 0.18,
    targetYaw: null,
    dragging: false,
    lastX: 0,
    lastY: 0,
    dragDistance: 0,
    visible: true,
    hitTargets: [],
  })

  useEffect(() => {
    const container = stageRef.current
    if (!container) return
    const observer = new IntersectionObserver(
      (entries) => {
        cameraRef.current.visible = entries[0]?.isIntersecting ?? true
      },
      { threshold: 0.05 },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const palette = getScenePalette(theme)

    const paintScene = () => {
      const rect = canvas.getBoundingClientRect()
      const c = cameraRef.current
      c.hitTargets = drawHorizon3DScene(ctx, rect.width, rect.height, c.yaw, c.pitch, activeId, palette)
    }

    const syncSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      paintScene()
    }

    renderNowRef.current = paintScene
    syncSize()
    const resizeObserver = new ResizeObserver(syncSize)
    resizeObserver.observe(canvas)

    let rafId = 0
    const tick = () => {
      const c = cameraRef.current
      if (c.visible) {
        if (!c.dragging && c.targetYaw !== null) {
          c.yaw = stepAngleToward(c.yaw, c.targetYaw, motionPaused ? 1 : 0.12)
          if (Math.abs(c.targetYaw - c.yaw) < 0.01) c.targetYaw = null
          paintScene()
        } else if (!c.dragging && !motionPaused) {
          c.yaw += 0.0032
          paintScene()
        }
      }
      if (!motionPaused || c.targetYaw !== null) rafId = window.requestAnimationFrame(tick)
    }

    if (!motionPaused || cameraRef.current.targetYaw !== null) {
      rafId = window.requestAnimationFrame(tick)
    }
    return () => {
      window.cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
    }
  }, [activeId, motionPaused, theme])

  const selectBeacon = useCallback(
    (beacon: FacultyBeacon) => {
      setActiveId(beacon.id)
      cameraRef.current.targetYaw = motionPaused ? null : beacon.focusYaw
      if (motionPaused) {
        cameraRef.current.yaw = beacon.focusYaw
        renderNowRef.current()
      }
      onSelectFaculty?.(beacon)
    },
    [motionPaused, onSelectFaculty],
  )

  const resetParallax = () => {
    cameraRef.current.dragging = false
    stageRef.current?.style.setProperty('--hx', '0')
    stageRef.current?.style.setProperty('--hy', '0')
  }

  const toggleMotion = () => {
    const nextPaused = !motionPaused
    setMotionPaused(nextPaused)
    if (nextPaused) resetParallax()
    document.documentElement.dataset.motion = nextPaused ? 'paused' : 'active'
  }

  return {
    stageRef,
    canvasRef,
    activeId,
    motionPaused,
    selectBeacon,
    resetParallax,
    toggleMotion,
    resetAngle: () => {
      Object.assign(cameraRef.current, { yaw: -0.45, pitch: 0.18, targetYaw: null })
      renderNowRef.current()
    },
    onPointerDown: (e: Parameters<typeof applyOrbitPointerDown>[0]) =>
      applyOrbitPointerDown(e, cameraRef.current),
    onPointerMove: (e: Parameters<typeof applyOrbitPointerMove>[0]) =>
      applyOrbitPointerMove(e, stageRef.current, cameraRef.current, motionPaused, renderNowRef.current),
    onPointerUp: (e: Parameters<typeof applyOrbitPointerUp>[0]) =>
      applyOrbitPointerUp(e, cameraRef.current, selectBeacon),
    onKeyDown: (e: Parameters<typeof applyOrbitKeyDown>[0]) =>
      applyOrbitKeyDown(e, cameraRef.current, renderNowRef.current),
  }
}
