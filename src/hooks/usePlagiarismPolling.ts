import { useEffect } from 'react'
import { fetchPlagiarismStatus } from '../services/assignmentsApi.ts'
import type { PlagiarismJobDto } from '../types/activities.ts'

export function hasPendingScan(jobs: PlagiarismJobDto[]): boolean {
  return jobs.some((job) => job.status === 'pending' || job.status === 'scanning')
}

export function usePlagiarismPolling(
  moduleId: number,
  enabled: boolean,
  onUpdate: (jobs: PlagiarismJobDto[]) => void,
) {
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    const timer = window.setInterval(() => {
      fetchPlagiarismStatus(moduleId, controller.signal).then(
        (res) => onUpdate(res.jobs),
        () => undefined,
      )
    }, 3000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [moduleId, enabled, onUpdate])
}
