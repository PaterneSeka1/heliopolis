const DATE_TIME_ZONE = 'UTC';

export function formatDateFr(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {},
) {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: DATE_TIME_ZONE,
    ...options,
  }).format(new Date(value));
}

export function formatTimeFr(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {},
) {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: DATE_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(new Date(value));
}
