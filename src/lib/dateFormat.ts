export function formatDateHeading(iso: string, timeZone = 'UTC', lang = 'en'): string {
  const locale = lang === 'zh_cn' ? 'zh-CN' : lang === 'id' ? 'id-ID' : 'en-GB'
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return new Date(iso).toDateString()
  }
}

export function formatTime24(iso: string, timeZone = 'UTC'): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(iso))
  } catch {
    return '--:--'
  }
}

export function formatDateTimeShort(iso: string, timeZone = 'UTC'): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
