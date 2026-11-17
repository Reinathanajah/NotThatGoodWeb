import '../components/categories/categories.css'
import '../components/resources/resources.css'
import '../components/assignments/assignments.css'
import '../components/files/filePicker.css'
import '../components/files/privateFiles.css'
import '../components/calendar/calendar.css'
import { useState } from 'react'
import { CalendarMonthView } from '../components/calendar/CalendarMonthView.tsx'
import { CalendarTimelineViews } from '../components/calendar/CalendarTimelineViews.tsx'
import { CalendarToolbar } from '../components/calendar/CalendarToolbar.tsx'
import { EventInspectorModal } from '../components/calendar/EventInspectorModal.tsx'
import { EventsKeySidebar } from '../components/calendar/EventsKeySidebar.tsx'
import { NewEventModal } from '../components/calendar/NewEventModal.tsx'
import { AppShell } from '../components/layout/AppShell.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useCalendarWorkspace } from '../hooks/useCalendarWorkspace.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import type { CalendarEventDto } from '../types/calendar.ts'

export function CalendarPage() {
  useDocumentTitle('Academic calendar')
  const cal = useCalendarWorkspace()
  const [newEventOpen, setNewEventOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventDto | null>(null)
  const [overflowDateKey, setOverflowDateKey] = useState<string | null>(null)

  function handleSelectDay(dateKey: string) {
    const [year, month, day] = dateKey.split('-').map(Number)
    cal.setCursor({ year, month, day })
    cal.setView('day')
  }

  return (
    <AppShell>
      <CalendarToolbar
        view={cal.view}
        cursor={cal.cursor}
        courseId={cal.courseId}
        courses={cal.courses}
        onChangeView={cal.setView}
        onStepPeriod={cal.stepPeriod}
        onJumpToday={cal.jumpToday}
        onCourseChange={cal.setCourseId}
        onOpenNewEvent={() => setNewEventOpen(true)}
      />

      {cal.error ? (
        <StatusBanner
          variant="error"
          title="Could not load calendar"
          message={cal.error}
          actionLabel="Retry calendar"
          onAction={cal.retry}
        />
      ) : cal.loading || !cal.data ? (
        <StatusBanner variant="loading" title="Loading academic calendar" skeletonLines={5} />
      ) : (
        <div className="cal-layout">
          {cal.view === 'month' ? (
            <CalendarMonthView
              cursor={cal.cursor}
              data={cal.data}
              onSelectDay={handleSelectDay}
              onSelectEvent={setSelectedEvent}
              onOpenOverflowDay={setOverflowDateKey}
            />
          ) : (
            <CalendarTimelineViews
              mode={cal.view}
              data={cal.data}
              onSelectEvent={setSelectedEvent}
            />
          )}

          <EventsKeySidebar
            legend={cal.data.scopeLegend}
            hiddenScopes={cal.data.hiddenScopes}
            togglingScope={cal.togglingScope}
            scopeError={cal.scopeError}
            onToggleScope={(scope) => void cal.toggleScope(scope)}
          />
        </div>
      )}

      <NewEventModal
        open={newEventOpen}
        courses={cal.courses}
        onSubmit={cal.createEvent}
        onClose={() => setNewEventOpen(false)}
      />

      <EventInspectorModal
        selectedEvent={selectedEvent}
        overflowDateKey={overflowDateKey}
        overflowEvents={overflowDateKey ? (cal.data?.byDate[overflowDateKey] ?? []) : []}
        onSelectEvent={(ev) => {
          setOverflowDateKey(null)
          setSelectedEvent(ev)
        }}
        onDeletePersonal={cal.deleteEvent}
        onClose={() => {
          setSelectedEvent(null)
          setOverflowDateKey(null)
        }}
      />
    </AppShell>
  )
}
