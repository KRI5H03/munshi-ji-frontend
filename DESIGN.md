# Munshi Ji — design

Direction A ("Refined reference") was chosen. Directions B and C are deleted; they remain in git history on the `design-options` branch.

## Direction A

- **Idea:** the reference screens, tidied. Sidebar on desktop, bottom bar on phone, white cards.
- **Colours:** indigo `#3730A3` on `#F7F7F7`, white cards, grey borders, red only for errors and delete.
- **Font:** Inter, 16px base, tabular digits for money.
- **Spacing:** roomy. 48px fields and buttons, 12px corners, 24px between cards.

## Changes asked for with BUILD A

### 1. Menu and page headers

No tab bars. The whole menu is one list in `components/shell/nav.ts`. Adding Purchases, Payments or Reports means adding one entry there and creating its routes. The sidebar scrolls if it grows. The phone bar shows the first four sections; a "More" button holds the rest and Log out. Each section can still carry a `subNav` list for later; nothing renders it today.

- **List pages:** `PageHeader` with the title on the left and actions on the right. The section's primary action (New bill, Add customer, Add item, from `primaryAction` in `nav.ts`) is the rightmost and the only filled button.
- **Create and edit pages:** a "← Back" link above the title, to the section's list.
- **Unsaved changes:** a form calls `useUnsavedChanges(isDirty)`. Leaving through any app link, Back or Log out then asks "Discard changes?" in an in-page dialog. Reloading or closing the tab gets the browser's own question, the only one browsers allow there.
- **After saving:** a new bill opens its print page; a customer or item goes back to its list with a "Saved" toast.

### 2. Printed bill follows the Busy layout

`components/design/a/print-sheet.tsx`, one A4 page per copy (Original Copy, Duplicate Copy, Triplicate Copy):
GSTIN and copy name on top, centred TAX INVOICE and firm block, invoice and transport columns, Billed to and Shipped to with PAN, mobile, Aadhaar and GSTIN/UIN, the items box (S.N., Description of Goods, HSN/SAC, D. No., Qty., Unit, Price, Amount) with the discount, tax and round-off lines inside it, Grand Total with total pieces, tax summary by rate, amount in words, bank details on one row, then terms from "E.& O.E.", Receiver's Signature and "For FIRM".

## Things that are not in the API (my calls)

- Firm picker shows name and role only. Login does not return a GSTIN.
- The firm list is only returned by login, so it is kept in the browser with the token.
- "Party Aadhaar No" prints blank. The API returns the Aadhaar number only in encrypted form.
- When no ship-to party is saved, "Shipped to" repeats the billed-to party, as Busy does.
- "Next bill number" from the reference is dropped. No route gives it.
- "Low stock" is a frontend-only rule: 10 or fewer.

## Build progress

Built for real: login and firm picker, app shell, bills list. Still mock-ups under `/design`: new bill, customers, items, firm settings, print.
