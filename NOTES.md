# Fork — additions over `oss-apps/split-pro`

This documents what this fork
changed on top of upstream `main`, so each piece can later be split into a clean,
focused upstream PR. Changes are intentionally minimal and additive — no restyling
of existing upstream choices.

## Features / fixes (each = a candidate upstream PR)

### 1. Currency: show trailing-zero cents (bug)

`$4.20` was rendering as `$4.2` (and `$4.00` as `$4`). The currency formatter used
`minimumFractionDigits: 0`. Set it to the currency's `decimalDigits`.

- `src/utils/numbers.ts` (`getCurrencyHelpers`)

### 2. Group ledger: in-app expense search + CSV export

- **Search:** a mobile-first filter box atop the group "Expenses" tab; client-side
  substring match on name + category over the already-loaded expenses.
- **CSV export:** the group page had no export (only the friend page did); added a
  group-level export mirroring `Friend/Export.tsx`, with a signed "Your Net" column.
- `src/pages/groups/[groupId].tsx`, `src/components/group/GroupExport.tsx`,
  `public/locales/en/common.json` (`group_details.search_expenses`)

### 3. Settle-up: "Pay with Venmo" button (with optional saved handles)

A deep-link button on the friend + group settle-up drawers that opens Venmo
prefilled (`venmo://paycharge?txn=pay|charge&amount=&note=&recipients=`). USD-only;
hides itself otherwise. Falls back gracefully to amount-only when no handle is set.

- v2 adds an optional per-user **Venmo username** (`User.venmoHandle`) set on the
  Account page, used to prefill the recipient for true one-tap.
- `src/components/Friend/VenmoPayButton.tsx`, `Friend/GroupSettleup.tsx`,
  `Friend/Settleup.tsx`, `src/components/Account/UpdateVenmoHandle.tsx`,
  `src/pages/account.tsx`, `src/server/api/routers/user.ts` (`updateUserDetail`),
  `prisma/schema.prisma` + migration `20260612220000_add_venmo_handle`
- Type follow-on (User gained a required-nullable field): `AddExpense/SelectUserOrGroup.tsx`,
  `AddExpense/UserInput.tsx`, `pages/add.tsx`, `pages/balances/[friendId].tsx`,
  `tests/addStore.test.ts` (each adds `venmoHandle: null` to a constructed User).

### 4. Build hygiene

`.gitattributes` enforces LF (a CRLF `start.sh` from a Windows checkout crash-looped
the Alpine container); `start.sh` normalized to LF.

## Before upstreaming (not done here — private deploy uses English directly)

- Replace hardcoded English strings ("Pay with Venmo", "Search expenses" header, etc.)
  with i18n translation keys across all locales.
- Split into focused PRs (cents fix / search / group export / Venmo), each prefaced by
  an issue to gauge maintainer interest. Search + import are already requested upstream
  (issue #207).
