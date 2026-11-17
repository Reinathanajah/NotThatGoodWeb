import { useCallback, useEffect, useRef, useState } from 'react'
import { computeSecondsRemaining } from '../lib/quizTimer.ts'
import {
  fetchQuizDetail,
  startOrResumeQuizAttempt,
  submitQuizAttempt,
} from '../services/quizzesApi.ts'
import type {
  QuizAttemptSessionDto,
  QuizDetailDto,
  QuizSubmitResultDto,
} from '../types/quizzes.ts'
import { useQuizAutosave } from './useQuizAutosave.ts'

export function useQuizEngine(moduleId: number) {
  const [trackedId, setTrackedId] = useState(moduleId)
  const [detail, setDetail] = useState<QuizDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<QuizAttemptSessionDto | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [reviewResult, setReviewResult] = useState<QuizSubmitResultDto | null>(null)
  const [nonce, setNonce] = useState(0)
  const autoExpiredRef = useRef(false)
  const autosave = useQuizAutosave(session?.attemptId ?? null, submitting || Boolean(reviewResult))
  const { resetWith, clearPendingTimer, getLatestAnswers } = autosave

  if (trackedId !== moduleId) {
    setTrackedId(moduleId)
    setDetail(null)
    setSession(null)
    setReviewResult(null)
    setLoading(true)
    setError(null)
    setActionError(null)
  }

  useEffect(() => {
    resetWith({})
    autoExpiredRef.current = false
  }, [moduleId, resetWith])

  useEffect(() => {
    const controller = new AbortController()
    fetchQuizDetail(moduleId, controller.signal).then(
      (res) => {
        if (controller.signal.aborted) return
        setDetail(res)
        setError(null)
        setLoading(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unable to load quiz')
        setLoading(false)
      },
    )
    return () => controller.abort()
  }, [moduleId, nonce])

  const submitCurrent = useCallback(async () => {
    if (!session || submitting) return
    clearPendingTimer()
    setSubmitting(true)
    setActionError(null)
    try {
      const result = await submitQuizAttempt(session.attemptId, getLatestAnswers())
      setReviewResult(result)
      setNonce((n) => n + 1)
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Unable to submit quiz attempt')
    } finally {
      setSubmitting(false)
    }
  }, [session, submitting, clearPendingTimer, getLatestAnswers])

  useEffect(() => {
    if (!session || reviewResult) return
    const timer = window.setInterval(() => {
      const rem = computeSecondsRemaining(session.deadlineAt)
      setSecondsLeft(rem)
      if (rem === 0 && !autoExpiredRef.current) {
        autoExpiredRef.current = true
        void submitCurrent()
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [session, reviewResult, submitCurrent])

  const beginAttempt = useCallback(async () => {
    if (!detail || starting) return
    setStarting(true)
    setActionError(null)
    try {
      const started = await startOrResumeQuizAttempt(detail.moduleId)
      autoExpiredRef.current = false
      resetWith(started.answers)
      setSecondsLeft(computeSecondsRemaining(started.deadlineAt))
      setReviewResult(null)
      setSession(started)
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Could not start quiz attempt')
    } finally {
      setStarting(false)
    }
  }, [detail, starting, resetWith])

  return {
    detail,
    loading,
    error,
    session,
    answers: autosave.answers,
    saveState: autosave.saveState,
    actionError,
    starting,
    submitting,
    secondsLeft,
    reviewResult,
    beginAttempt,
    selectOption: autosave.selectOption,
    retrySave: autosave.retrySave,
    submitCurrent,
    exitToLobby: () => {
      setSession(null)
      setReviewResult(null)
      setNonce((n) => n + 1)
    },
    retry: () => {
      setLoading(true)
      setError(null)
      setNonce((n) => n + 1)
    },
  }
}
