import { useCallback, useEffect, useRef, useState } from 'react'
import { saveQuizAttemptAnswers } from '../services/quizzesApi.ts'

export type AutosaveState = 'idle' | 'saving' | 'saved' | 'error'

export function useQuizAutosave(attemptId: string | null, locked: boolean) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [saveState, setSaveState] = useState<AutosaveState>('idle')
  const answersRef = useRef<Record<string, number>>({})
  const debounceRef = useRef<number | null>(null)

  const clearPendingTimer = useCallback(() => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
  }, [])

  useEffect(() => () => clearPendingTimer(), [clearPendingTimer])

  const resetWith = useCallback(
    (initialAnswers: Record<string, number>) => {
      clearPendingTimer()
      answersRef.current = initialAnswers
      setAnswers(initialAnswers)
      setSaveState('idle')
    },
    [clearPendingTimer],
  )

  const persistNow = useCallback(async () => {
    if (!attemptId || Object.keys(answersRef.current).length === 0) return
    setSaveState('saving')
    try {
      await saveQuizAttemptAnswers(attemptId, answersRef.current)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [attemptId])

  const selectOption = useCallback(
    (questionId: string, optionIndex: number) => {
      if (!attemptId || locked) return
      const next = { ...answersRef.current, [questionId]: optionIndex }
      answersRef.current = next
      setAnswers(next)
      setSaveState('saving')
      clearPendingTimer()
      debounceRef.current = window.setTimeout(() => {
        void persistNow()
      }, 300)
    },
    [attemptId, locked, clearPendingTimer, persistNow],
  )

  const getLatestAnswers = useCallback(() => answersRef.current, [])

  return {
    answers,
    saveState,
    resetWith,
    selectOption,
    retrySave: () => void persistNow(),
    clearPendingTimer,
    getLatestAnswers,
  }
}
