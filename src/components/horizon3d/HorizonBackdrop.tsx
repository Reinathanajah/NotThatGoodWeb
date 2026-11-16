import './horizon.css'

export function HorizonBackdrop() {
  return (
    <div className="horizon-backdrop" aria-hidden="true">
      <div className="horizon-sky-gradient" />
      <div className="horizon-sun-disc" />
      <svg
        className="horizon-ridges horizon-ridges--far"
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
      >
        <path
          d="M0 320 L190 220 L380 268 L580 185 L810 250 L1020 175 L1240 245 L1440 198 L1440 420 L0 420 Z"
          fill="var(--horizon-ridge-far)"
        />
      </svg>
      <svg
        className="horizon-ridges horizon-ridges--mid"
        viewBox="0 0 1440 360"
        preserveAspectRatio="none"
      >
        <path
          d="M0 255 L210 190 L440 248 L670 165 L910 232 L1170 172 L1440 225 L1440 360 L0 360 Z"
          fill="var(--horizon-ridge-mid)"
        />
      </svg>
      <svg
        className="horizon-ridges horizon-ridges--near"
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
      >
        <path
          d="M0 190 L260 118 L520 198 L760 142 L990 195 L1230 112 L1440 180 L1440 260 L0 260 Z"
          fill="var(--horizon-ridge-near)"
        />
      </svg>
    </div>
  )
}
