/** Dates are stored as local-time `YYYY-MM-DD` strings so a day means the user's day. */
export type ISODate = string;

export function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISODate(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: ISODate, n: number): ISODate {
  const d = fromISODate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function today(): ISODate {
  return toISODate(new Date());
}

/** Monday of the week containing `s`. Weeks run Monday–Sunday. */
export function weekStart(s: ISODate): ISODate {
  const d = fromISODate(s);
  const offset = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  return addDays(s, -offset);
}
