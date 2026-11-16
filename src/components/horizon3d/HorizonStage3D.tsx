import './horizon.css'
import { HorizonBackdrop } from './HorizonBackdrop.tsx'
import { HorizonToolbar } from './HorizonToolbar.tsx'
import type { FacultyBeacon } from './campusGeometry.ts'
import { useHorizonOrbit } from './useHorizonOrbit.ts'

interface HorizonStage3DProps {
  onSelectFaculty?: (beacon: FacultyBeacon) => void
  compact?: boolean
}

export function HorizonStage3D({ onSelectFaculty, compact = false }: HorizonStage3DProps) {
  const {
    stageRef,
    canvasRef,
    activeId,
    motionPaused,
    selectBeacon,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onKeyDown,
    resetParallax,
    toggleMotion,
    resetAngle,
  } = useHorizonOrbit(onSelectFaculty)

  return (
    <section
      ref={stageRef}
      className="horizon-stage"
      aria-label="Interactive Campus Tower 3D Horizon Stage"
      style={{ minHeight: compact ? '300px' : '400px' }}
    >
      <HorizonBackdrop />
      <div className="horizon-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={640}
          height={320}
          tabIndex={0}
          className="horizon-canvas"
          aria-label="Interactive 3D Campus Tower model. Drag with pointer or use arrow keys to rotate."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={resetParallax}
          onKeyDown={onKeyDown}
        />
      </div>
      <HorizonToolbar
        activeId={activeId}
        motionPaused={motionPaused}
        onSelectBeacon={selectBeacon}
        onToggleMotion={toggleMotion}
        onResetAngle={resetAngle}
      />
    </section>
  )
}
