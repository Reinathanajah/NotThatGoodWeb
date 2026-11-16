import { Pause, Play, RotateCcw } from 'lucide-react'
import { FACULTY_BEACONS, type FacultyBeacon } from './campusGeometry.ts'

interface HorizonToolbarProps {
  activeId: string
  motionPaused: boolean
  onSelectBeacon: (beacon: FacultyBeacon) => void
  onToggleMotion: () => void
  onResetAngle: () => void
}

export function HorizonToolbar({
  activeId,
  motionPaused,
  onSelectBeacon,
  onToggleMotion,
  onResetAngle,
}: HorizonToolbarProps) {
  const activeBeacon = FACULTY_BEACONS.find((b) => b.id === activeId) ?? FACULTY_BEACONS[0]

  return (
    <div className="horizon-toolbar">
      <div className="horizon-beacon-list" role="group" aria-label="Focus faculty orbital hub">
        {FACULTY_BEACONS.map((beacon) => (
          <button
            key={beacon.id}
            type="button"
            className="horizon-beacon-btn motion-surface"
            aria-pressed={beacon.id === activeId}
            onClick={() => onSelectBeacon(beacon)}
          >
            {beacon.code}
          </button>
        ))}
      </div>

      <div className="sf-row">
        <span className="sf-text-muted">{activeBeacon.name}</span>
        <button
          type="button"
          className="sf-btn sf-btn--secondary"
          onClick={onToggleMotion}
          aria-label={motionPaused ? 'Resume 3D rotation' : 'Pause 3D rotation'}
        >
          {motionPaused ? (
            <Play size={16} aria-hidden="true" />
          ) : (
            <Pause size={16} aria-hidden="true" />
          )}
          <span>{motionPaused ? 'Play' : 'Pause'}</span>
        </button>
        <button
          type="button"
          className="sf-btn sf-btn--secondary"
          onClick={onResetAngle}
          aria-label="Reset 3D camera angle"
        >
          <RotateCcw size={16} aria-hidden="true" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  )
}
