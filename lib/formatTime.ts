import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

export type TimeDisplayMode = 'relative' | 'absolute' | 'lagos-timezone';

/**
 * Format a date as a relative time string (e.g., "3h ago", "Just now")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const mins = differenceInMinutes(now, date);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = differenceInHours(now, date);
  if (hours < 24) return `${hours}h ago`;
  const days = differenceInDays(now, date);
  return `${days}d ago`;
}

/**
 * Format a date as an absolute date/time in Lagos timezone
 * (prevents UTC day-shift issues)
 */
export function formatLagosTime(date: Date): string {
  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;
}

/**
 * Format time based on configured display mode
 * @param date Date to format
 * @param mode Display mode: 'relative' (default) | 'absolute' | 'lagos-timezone'
 */
export function formatTime(date: Date, mode: TimeDisplayMode = 'relative'): string {
  switch (mode) {
    case 'relative':
      return formatRelativeTime(date);
    case 'lagos-timezone':
      return formatLagosTime(date);
    case 'absolute':
    default:
      // Standard absolute format
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
  }
}

/**
 * Get the configured time display mode from environment or localStorage
 * Defaults to 'relative'
 */
export function getTimeDisplayMode(): TimeDisplayMode {
  // In browser, check localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('timeDisplayMode');
    if (saved === 'absolute' || saved === 'lagos-timezone') {
      return saved as TimeDisplayMode;
    }
  }
  // Default to relative
  return 'relative';
}

/**
 * Set the time display mode preference
 */
export function setTimeDisplayMode(mode: TimeDisplayMode): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('timeDisplayMode', mode);
  }
}
