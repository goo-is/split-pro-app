import React, { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

import { api } from '~/utils/api';
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
  const [handle, setHandle] = useState(defaultHandle ?? '');
  const updateMutation = api.user.updateUserDetail.useMutation();
  const utils = api.useUtils();

  const onSave = () => {
    updateMutation.mutate(
      { venmoHandle: handle.trim() || null },
      {
        onSuccess: () => {
          toast.success('Venmo username saved', { duration: 1500 });
          utils.user.invalidate().catch(console.error);
        },
        onError: () => toast.error('Could not save Venmo username'),
      },
    );
  };

  return (
    <AppDrawer
      trigger={children}
      title="Venmo username"
      actionTitle="Save"
      actionOnClick={onSave}
      className="h-[60vh]"
      shouldCloseOnAction
    >
      <div className="mt-6 flex flex-col gap-3">
        <p className="text-sm text-gray-400">
          Used to prefill the recipient when someone pays you back with Venmo. Enter just your
          username — the part after the @ (or paste your venmo.com profile link).
        </p>
        <Input
          placeholder="e.g. Jane-Doe"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
        />
      </div>
    </AppDrawer>
  );
};
