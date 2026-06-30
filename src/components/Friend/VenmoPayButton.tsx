import { useTranslation } from 'next-i18next';
import React from 'react';

import { BigMath, getCurrencyHelpers } from '~/utils/numbers';
import { buildVenmoPayLink } from '~/utils/venmo';
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
  amount: bigint; // Minor units; sign is ignored (the button always settles a positive amount)
  currency: string;
  txn?: 'pay' | 'charge';
  note?: string;
  recipientHandle?: string;
}> = ({ amount, currency, txn = 'pay', note, recipientHandle }) => {
  const { t } = useTranslation();

  const absAmount = BigMath.abs(amount);
  if ('USD' !== currency || absAmount <= 0n) {
    return null;
  }

  // Force en-US so the decimal separator is a dot, which Venmo expects.
  const { parseToCleanString } = getCurrencyHelpers({ currency });
  const venmoLink = buildVenmoPayLink({
    amount: parseToCleanString(absAmount),
    txn,
    note: note ?? t('ui.settle_up_name'),
    handle: recipientHandle,
  });

  return (
    <Button asChild className="gap-2 bg-[#008CFF] text-white hover:bg-[#008CFF]/90">
      <a href={venmoLink}>{'charge' === txn ? t('venmo.request') : t('venmo.pay')}</a>
    </Button>
  );
};
