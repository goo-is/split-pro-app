import React from 'react';

import { getCurrencyHelpers } from '~/utils/numbers';
import { Button } from '../ui/button';

/**
 * Opens the Venmo app with a prefilled payment (or request), the way Splitwise's
 * "Pay with Venmo" works. v1 prefills amount + note only; the user picks the
 * recipient in Venmo. Pass `recipientHandle` (v2) to prefill the recipient too.
 *
 * Venmo deep link: venmo://paycharge?txn=pay|charge&amount=<dec>&note=<note>&recipients=<handle>
 * Venmo is USD-only, so the button hides itself for other currencies.
 */
export const VenmoPayButton: React.FC<{
  amount: bigint; // Absolute value, minor units
  currency: string;
  txn?: 'pay' | 'charge';
  note?: string;
  recipientHandle?: string;
}> = ({ amount, currency, txn = 'pay', note = 'Settle up', recipientHandle }) => {
  if (currency !== 'USD' || amount <= 0n) {
    return null;
  }

  // Force en-US so the decimal separator is a dot, which Venmo expects.
  const { parseToCleanString } = getCurrencyHelpers({ currency });
  const amountStr = parseToCleanString(amount).replace(/,/g, '.');

  // Accept "@name", "venmo.com/u/name", or a bare username.
  const handle = recipientHandle
    ?.trim()
    .replace(/^@/, '')
    .replace(/^https?:\/\//, '')
    .replace(/^venmo\.com\/(u\/)?/, '');

  const params = `txn=${txn}&amount=${amountStr}&note=${encodeURIComponent(note)}${
    handle ? `&recipients=${encodeURIComponent(handle)}` : ''
  }`;
  const venmoLink = `venmo://paycharge?${params}`;

  return (
    <Button
      asChild
      className="gap-2 bg-[#008CFF] text-white hover:bg-[#008CFF]/90"
    >
      <a href={venmoLink}>{txn === 'charge' ? 'Request on Venmo' : 'Pay with Venmo'}</a>
    </Button>
  );
};
