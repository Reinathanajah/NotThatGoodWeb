import { useState, type FormEvent } from 'react'
import { ApiClientError } from '../../services/apiClient.ts'
import { createSupportTicket } from '../../services/supportApi.ts'
import type { SupportTicketDto } from '../../types/workspace.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'

interface SupportTicketFormProps {
  defaultEmail?: string
  requireEmail: boolean
}

export function SupportTicketForm({ defaultEmail = '', requireEmail }: SupportTicketFormProps) {
  const [email, setEmail] = useState(defaultEmail)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({})
  const [createdTicket, setCreatedTicket] = useState<SupportTicketDto | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)
    setFieldErrors({})

    try {
      const payload = await createSupportTicket({
        ...(requireEmail || email.trim() ? { email: email.trim() } : {}),
        subject,
        message,
      })
      setCreatedTicket(payload)
      setSubject('')
      setMessage('')
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message)
        setFieldErrors({
          email: error.getFieldError('email'),
          subject: error.getFieldError('subject'),
          message: error.getFieldError('message'),
        })
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to submit ticket')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="sf-stack" onSubmit={(e) => void handleSubmit(e)} noValidate>
      {createdTicket ? (
        <StatusBanner
          variant="success"
          title={`Ticket submitted (${createdTicket.referenceCode})`}
          message={`Confirmation sent to ${createdTicket.email}. Status: ${createdTicket.status}.`}
        />
      ) : null}

      {errorMessage ? (
        <StatusBanner variant="error" title="Could not send ticket" message={errorMessage} />
      ) : null}

      {requireEmail ? (
        <div className="foundation-field">
          <label htmlFor="support-email">Email address</label>
          <input
            id="support-email"
            type="email"
            value={email}
            aria-invalid={Boolean(fieldErrors.email)}
            onChange={(e) => setEmail(e.target.value)}
          />
          {fieldErrors.email ? <p className="foundation-field-error">{fieldErrors.email}</p> : null}
        </div>
      ) : null}

      <div className="foundation-field">
        <label htmlFor="support-subject">Subject</label>
        <input
          id="support-subject"
          type="text"
          placeholder="Course access or submission inquiry"
          value={subject}
          aria-invalid={Boolean(fieldErrors.subject)}
          onChange={(e) => setSubject(e.target.value)}
        />
        {fieldErrors.subject ? (
          <p className="foundation-field-error">{fieldErrors.subject}</p>
        ) : null}
      </div>

      <div className="foundation-field">
        <label htmlFor="support-message">Message</label>
        <textarea
          id="support-message"
          className="support-textarea"
          placeholder="Describe the course, activity, or account issue you ran into..."
          value={message}
          aria-invalid={Boolean(fieldErrors.message)}
          onChange={(e) => setMessage(e.target.value)}
        />
        {fieldErrors.message ? (
          <p className="foundation-field-error">{fieldErrors.message}</p>
        ) : null}
      </div>

      <button type="submit" className="sf-btn sf-btn--primary" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send helpdesk ticket'}
      </button>
    </form>
  )
}
