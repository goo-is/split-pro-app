import { useTranslation } from 'next-i18next';
import React, { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

import { api } from '~/utils/api';
import { normalizeVenmoHandle } from '~/utils/venmo';
import { AppDrawer } from '../ui/drawer';
import { Input } from '../ui/input';

/**
 * Account-settings drawer for a user's Venmo username. Stored on User.venmoHandle
 * and used to prefill the recipient on the "Pay with Venmo" settle-up button.
 * Leaving it blank simply falls back to picking the recipient inside Venmo.
 */
export const UpdateVenmoHandle: React.FC<{
  children: ReactNode;
  defaultHandle?: string | null;
}> = ({ children, defaultHandle }) => {
  const { t } = useTranslation();
  const [handle, setHandle] = useState(defaultHandle ?? '');
  const updateMutation = api.user.updateUserDetail.useMutation();
  const utils = api.useUtils();

  const trimmed = handle.trim();
  const normalized = normalizeVenmoHandle(trimmed);
  const isInvalid = 0 < trimmed.length && null === normalized;

  const onSave = () => {
    updateMutation.mutate(
      { venmoHandle: normalized },
      {
        onSuccess: () => {
          toast.success(t('venmo.saved'), { duration: 1500 });
          utils.user.invalidate().catch(console.error);
        },
        onError: () => toast.error(t('venmo.save_error')),
      },
    );
  };

  return (
    <AppDrawer
      trigger={children}
      title={t('venmo.username')}
      actionTitle={t('actions.save')}
      actionOnClick={onSave}
      actionDisabled={isInvalid}
      className="h-[60vh]"
      shouldCloseOnAction
    >
      <div className="mt-6 flex flex-col gap-3">
        <p className="text-sm text-gray-400">{t('venmo.help')}</p>
        <Input
          placeholder={t('venmo.placeholder')}
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
        />
        {isInvalid ? <p className="text-xs text-red-500">{t('venmo.invalid')}</p> : null}
      </div>
    </AppDrawer>
  );
};
