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
  substring match on name + category over the already-loaded expenses. The export
  respects the active search (exports the filtered view, not the whole ledger).
- **CSV export:** the group page had no export (only the friend page did); added a
  group-level export mirroring `Friend/Export.tsx`, with a signed "Your Net" column.
- **CSV safety:** both exports now build rows via a shared `src/utils/csv.ts` that
  RFC-4180-quotes cells and neutralizes spreadsheet **formula injection** (a cell
  beginning `= + - @` is prefixed with `'`, except genuine numbers). This also fixes a
  pre-existing injection hole in the upstream `Friend/Export.tsx` — a separable upstream
  bugfix PR.
- `src/pages/groups/[groupId].tsx`, `src/components/group/GroupExport.tsx`,
  `src/components/Friend/Export.tsx`, `src/utils/csv.ts`,
  `public/locales/en/common.json` (`group_details.search_expenses`)

### 3. Settle-up: "Pay with Venmo" button (with optional saved handles)

A deep-link button on the friend + group settle-up drawers that opens Venmo
prefilled (`venmo://paycharge?txn=pay|charge&amount=&note=&recipients=`). USD-only;
hides itself otherwise. Falls back gracefully to amount-only when no handle is set.

- v2 adds an optional per-user **Venmo username** (`User.venmoHandle`) set on the
  Account page, used to prefill the recipient for true one-tap.
- Handle parsing + deep-link building live in `src/utils/venmo.ts`
  (`normalizeVenmoHandle` accepts `@name` / `venmo.com/u/name` / a bare username and
  validates 1–30 of `[A-Za-z0-9_-]`; `buildVenmoPayLink` URL-encodes every param so a
  note can't break out). The username is **normalized + validated client-side before
  save and re-validated server-side** (zod) in `updateUserDetail`.
- `src/components/Friend/VenmoPayButton.tsx`, `Friend/GroupSettleup.tsx`,
  `Friend/Settleup.tsx`, `src/components/Account/UpdateVenmoHandle.tsx`,
  `src/pages/account.tsx`, `src/server/api/routers/user.ts` (`updateUserDetail`),
  `src/utils/venmo.ts`,
  `prisma/schema.prisma` + migration `20260612220000_add_venmo_handle`
- Type follow-on (User gained a required-nullable field): `AddExpense/SelectUserOrGroup.tsx`,
  `AddExpense/UserInput.tsx`, `pages/add.tsx`, `pages/balances/[friendId].tsx`,
  `tests/addStore.test.ts` (each adds `venmoHandle: null` to a constructed User).

### 4. Build hygiene

`.gitattributes` adds `* text=auto eol=lf` (and `*.sh text eol=lf`) so shell scripts
stay LF — a CRLF `start.sh` from a Windows checkout had crash-looped the Alpine
container. (Only `.gitattributes` is committed; it governs line endings going forward.)

## i18n

Custom user-facing strings use translation keys, not hardcoded English: a `venmo.*`
namespace was added to `public/locales/en/common.json` (button labels, the account
drawer, toasts) and the export/search controls reuse existing keys (`actions.export`,
`group_details.search_expenses`, `ui.settle_up_name`). The CSV column headers are left
hardcoded to match the sibling upstream `Friend/Export.tsx`.

## Before upstreaming

- Translate the new `venmo.*` keys into the other locales (only `en` is filled here;
  Weblate handles the rest upstream).
- Split into focused PRs (cents fix / search+export / Venmo / CSV-injection fix /
  `.gitattributes`), each prefaced by an issue to gauge maintainer interest. Search +
  import are already requested upstream (issue #207).
- Add unit tests for `utils/csv.ts` (injection/quoting) and `utils/venmo.ts`
  (handle normalization + link building) — both are pure and trivially testable.
