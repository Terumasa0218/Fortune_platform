const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseBirthDate(input: string): Date | null {
  const match = DATE_REGEX.exec(input);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return null;
  }

  return utcDate;
}

export function parseBirthTime(input: string | null): string | null {
  if (input === null) return null;
  if (!TIME_REGEX.test(input)) return null;
  return input;
}

function getTimezoneOffsetMs(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;

  const asUtcTimestamp = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return asUtcTimestamp - date.getTime();
}

export function toUTC(
  birthDate: string,
  birthTime: string | null,
  timezone: string,
): Date {
  const parsedDate = parseBirthDate(birthDate);
  if (!parsedDate) {
    throw new Error('Invalid birthDate. Expected YYYY-MM-DD.');
  }

  const parsedTime = parseBirthTime(birthTime);
  if (birthTime !== null && parsedTime === null) {
    throw new Error('Invalid birthTime. Expected HH:MM or null.');
  }

  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = (parsedTime ?? '00:00').split(':').map(Number);

  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  let utcTimestamp = localAsUtc;

  for (let i = 0; i < 3; i += 1) {
    const offset = getTimezoneOffsetMs(new Date(utcTimestamp), timezone);
    utcTimestamp = localAsUtc - offset;
  }

  return new Date(utcTimestamp);
}

function getTimezoneAbbr(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short',
  }).formatToParts(date);

  return parts.find((part) => part.type === 'timeZoneName')?.value ?? timezone;
}

export function formatBirthDateTime(
  birthDate: string,
  birthTime: string | null,
  timezone: string,
): string {
  const parsedDate = parseBirthDate(birthDate);
  if (!parsedDate) {
    throw new Error('Invalid birthDate. Expected YYYY-MM-DD.');
  }

  const zone = getTimezoneAbbr(toUTC(birthDate, birthTime, timezone), timezone);
  const [year, month, day] = birthDate.split('-').map(Number);

  if (birthTime === null) {
    return `${year}年${month}月${day}日 (時刻不明) (${zone})`;
  }

  const parsedTime = parseBirthTime(birthTime);
  if (!parsedTime) {
    throw new Error('Invalid birthTime. Expected HH:MM or null.');
  }

  return `${year}年${month}月${day}日 ${parsedTime} (${zone})`;
}
