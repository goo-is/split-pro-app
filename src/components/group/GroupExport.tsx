import { type inferRouterOutputs } from '@trpc/server';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import React from 'react';

import { Button } from '~/components/ui/button';
import { useTranslationWithUtils } from '~/hooks/useTranslationWithUtils';
import type { ExpenseRouter } from '~/server/api/routers/expense';
import { toCsv } from '~/utils/csv';

type GroupExpenses = inferRouterOutputs<ExpenseRouter>['getGroupExpenses'];

/**
 * Downloads a group's expense ledger as a CSV. Mirrors Friend/Export.tsx but
 * with group-appropriate columns: "Paid By" is the payer's name, and "Your Net"
 * is the current user's signed share (positive = lent, negative = owe).
 */
export const GroupExport: React.FC<{
  expenses?: GroupExpenses;
  fileName: string;
  currentUserId: number;
  disabled?: boolean;
}> = ({ expenses = [], fileName, currentUserId, disabled = false }) => {
  const { t, getCurrencyHelpersCached, displayName } = useTranslationWithUtils('common');

  const headers = [
    'Date',
    'Name',
    'Category',
    'Paid By',
    'Amount',
    'Currency',
    'Your Net',
    'Split Type',
  ];

  const exportToCSV = () => {
    const rows = expenses.map((expense) => {
      const { parseToCleanString } = getCurrencyHelpersCached(expense.currency);
      const yourShare =
        expense.expenseParticipants.find((p) => p.userId === currentUserId)?.amount ?? 0n;

      return [
        format(new Date(expense.expenseDate), 'yyyy-MM-dd HH:mm:ss'),
        expense.name,
        expense.category,
        displayName(expense.paidByUser, currentUserId),
        parseToCleanString(expense.amount),
        expense.currency,
        parseToCleanString(yourShare, true),
        expense.splitType,
      ];
    });

    const csvContent = toCsv(headers, rows);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Button size="sm" responsiveIcon variant="secondary" onClick={exportToCSV} disabled={disabled}>
      <Download className="size-4 text-gray-400" /> {t('actions.export')}
    </Button>
  );
};
