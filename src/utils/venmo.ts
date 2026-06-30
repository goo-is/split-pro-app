/**
 * Helpers for the "Pay with Venmo" settle-up button.
 *
 * `normalizeVenmoHandle` accepts the various ways a user might supply their
 * handle — `@name`, `https://www.venmo.com/u/name`, `venmo.com/name?ref=x`, or a
 * bare username — and reduces it to a bare username, or `null` if nothing valid
 * remains. We validate charset and length leniently: 1–30 of `[A-Za-z0-9_-]`
 * (Venmo's own minimum is longer, but we don't enforce that).
 *
 * `buildVenmoPayLink` builds the `venmo://paycharge` deep link with every value
 * URL-encoded so a note containing `&`/`#`/`=` can't break out of its parameter.
 */

const VENMO_HANDLE = /^[\w-]{1,30}$/;

export function normalizeVenmoHandle(input?: string | null): string | null {
  if (!input) {
    return null;
  }
  const handle = input
    .trim()
    .replace(/^@/, '')
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/^venmo\.com\/(u\/)?/i, '')
    .replace(/[/?#].*$/, '') // Drop any trailing path / query / fragment
    .replace(/^@/, ''); // A stray @ left after stripping a URL form

  return VENMO_HANDLE.test(handle) ? handle : null;
}

export interface VenmoPayLinkParams {
  amount: string; // Clean decimal string, dot separator (USD)
  txn: 'pay' | 'charge';
  note: string;
  handle?: string | null;
}

export function buildVenmoPayLink({ amount, txn, note, handle }: VenmoPayLinkParams): string {
  const parts = [
    `txn=${txn}`,
    `amount=${encodeURIComponent(amount)}`,
    `note=${encodeURIComponent(note)}`,
  ];
  const normalized = normalizeVenmoHandle(handle);
  if (normalized) {
    parts.push(`recipients=${encodeURIComponent(normalized)}`);
  }
  return `venmo://paycharge?${parts.join('&')}`;
}
