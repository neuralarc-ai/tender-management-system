import { format, toZonedTime } from 'date-fns-tz';

// Timezone mappings
export const TIMEZONES = {
  admin: 'Asia/Kolkata', // IST (Indian Standard Time)
  client: 'Asia/Dubai',  // GST (Gulf Standard Time)
} as const;

export function formatDateWithTimezone(
  date: string | Date,
  role: 'admin' | 'client',
  formatString: string = 'MMM dd, yyyy • hh:mm a'
): string {
  const timezone = TIMEZONES[role];
  const zonedDate = toZonedTime(new Date(date), timezone);
  return format(zonedDate, formatString, { timeZone: timezone });
}

export function getCurrentTimeForRole(role: 'admin' | 'client'): Date {
  const timezone = TIMEZONES[role];
  return toZonedTime(new Date(), timezone);
}

export function getTimezoneAbbreviation(role: 'admin' | 'client'): string {
  return role === 'admin' ? 'IST' : 'GST';
}

