export function UploadProgressBar({ progress }: { progress: number | null }) {
  if (progress === null) return null
  return (
    <div className="sf-stack" style={{ gap: '4px' }}>
      <span className="sf-text-muted tabular-nums">Uploading... {progress}%</span>
      <div
        className="assign-meter-track"
        role="progressbar"
        aria-label="Upload progress"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="assign-meter-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
