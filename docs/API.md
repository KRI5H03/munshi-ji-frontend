# Munshi Ji — API Contract

Base URL (local): `http://localhost:4000/api`

Everything below is taken from the code in `src/routes`, `src/controllers`
and `src/validators`. If code and this file disagree, the code wins — fix
this file.

---

## 1. Rules that apply everywhere

### Money is always integer paise
| Shown to the user | Sent / received by the API |
|---|---|
| ₹850.00 | `85000` |
| ₹8,033.00 | `803300` |
| −₹0.16 round off | `-16` |

Never send rupees or decimals. The frontend converts on input
(₹ → paise) and on display (paise → ₹, Indian grouping: `8,033.00`).

### Discounts are milli-percent
`10%` → `10000` · `4.762%` → `4762` · max 2 discounts per bill, applied
one after the other (stacked).

### GST rate is basis points
`500` = 5% · `1800` = 18%

### Dates
`"YYYY-MM-DD"` strings, e.g. `"2026-11-16"`. Timestamps (`createdAt`,
`updatedAt`, `deletedAt`) are ISO strings in UTC.

### Headers
| Header | When |
|---|---|
| `Content-Type: application/json` | every request with a body |
| `Authorization: Bearer <token>` | every route except register / login |
| `X-Business-Id: <business uuid>` | every route marked **Firm** below |

The token comes from login/register and lasts **7 days**. It identifies the
**user** only; the firm is picked per request with `X-Business-Id`.

### Error shape (every error)
```json
{ "error": { "code": "SOME_CODE", "message": "Human readable.", "details": "…optional…" } }
```

| Status | `code` | Meaning | Frontend should |
|---|---|---|---|
| 400 | `VALIDATION_FAILED` | body failed checks; `details` is `[{ field, message }]` | show each message under its field |
| 400 | other codes (see each route) | business rule broken | show `message` |
| 401 | `UNAUTHENTICATED` | no / bad / expired token | go to login |
| 400 | `BUSINESS_REQUIRED` | `X-Business-Id` missing or not a UUID | go to firm picker |
| 403 | `FORBIDDEN` | not your firm, or staff doing an owner-only action | show `message` |
| 404 | `*_NOT_FOUND` / `NOT_FOUND` | record or route does not exist | show `message` |
| 409 | `ALREADY_EXISTS` | duplicate (email, GSTIN, design no.) | show "already exists" |
| 409 | `INSUFFICIENT_STOCK` | not enough stock for a bill or a stock removal | show `message` |
| 409 | `ALREADY_CANCELLED` | bill was cancelled before | show `message` |
| 500 | `INTERNAL` | bug | show "Something went wrong" |

Example `VALIDATION_FAILED`:
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Some fields are invalid.",
    "details": [{ "field": "phone", "message": "Phone must be 10 digits" }]
  }
}
```

### Legend
- **Auth** = needs `Authorization`
- **Firm** = needs `Authorization` + `X-Business-Id`
- **Owner** = Firm + the user's role in that firm must be `owner`

---

## 2. Health

### `GET /health` (no `/api` prefix)
→ `200 { "state": "ok", "server": "Online" }`

---

## 3. Auth

### `POST /api/auth/register` — public
Creates a user, their first firm, and makes them its owner.

| Field | Type | Rule |
|---|---|---|
| `name` | string | 1–100 |
| `email` | string | valid email (stored lowercase) |
| `password` | string | 8–72 |
| `businessName` | string | 1–200 |
| `gstin` | string | valid GSTIN (uppercased); first 2 digits = state |
| `address` | string | 1–500 |

→ `201 { "userId": "uuid", "businessId": "uuid", "token": "jwt" }`

Errors: `400 VALIDATION_FAILED`, `400 INVALID_GSTIN` (bad state code),
`409 ALREADY_EXISTS` (email or GSTIN taken).

### `POST /api/auth/login` — public
| Field | Type |
|---|---|
| `email` | string |
| `password` | string |

→ `200`
```json
{
  "token": "jwt",
  "userId": "uuid",
  "businesses": [
    { "id": "uuid", "name": "BHOLA COLLECTION", "role": "owner", "isDefault": true }
  ]
}
```
If `businesses` has one entry, select it automatically; otherwise show a
firm picker. Store the chosen `id` and send it as `X-Business-Id`.

Errors: `401 INVALID_CREDENTIALS` "Email or password is wrong." (same for
unknown email and wrong password, on purpose).

### `GET /api/auth/me` — Auth
→ `200 { "userId": "uuid" }` · use it on app start to check the token.

---

## 4. Firm (business)

### `GET /api/businesses/current` — Firm
→ `200 { "businessId": "uuid", "role": "owner" | "staff" }`

### `GET /api/businesses/profile` — Firm
→ `200 { "business": Business }`

```ts
type Business = {
  id: string; name: string;
  gstin: string;            // 15 chars, cannot be changed
  stateCode: string;        // "09", cannot be changed
  address: string;
  phone: string | null; pan: string | null;
  msmeUdhyamNo: string | null; branchAddress: string | null;
  jurisdiction: string | null;
  bankName: string | null; bankAccountNo: string | null;
  ifsc: string | null; bankBranch: string | null;
  termsText: string | null;
  createdAt: string; updatedAt: string;
};
```

### `PATCH /api/businesses/profile` — Owner
Send only the fields that change (at least one).

| Field | Rule |
|---|---|
| `name` | 1–200 |
| `address` | 1–500 |
| `phone` | 10 digits |
| `pan` | `ABCDE1234F` (uppercased) |
| `msmeUdhyamNo` | ≤ 30 (uppercased) |
| `branchAddress` | ≤ 500 |
| `jurisdiction` | ≤ 100 |
| `bankName` | ≤ 100 |
| `bankAccountNo` | 9–18 digits |
| `ifsc` | `SBIN0001234` (uppercased) |
| `bankBranch` | ≤ 100 |
| `termsText` | ≤ 2000 |

→ `200 { "business": Business }`

Errors: `400 VALIDATION_FAILED` ("Nothing to update." if empty),
`403 FORBIDDEN` "Only the owner can edit business details."
`gstin` / `stateCode` in the body are ignored (stripped).

---

## 5. Contacts (customers / suppliers)

```ts
type Contact = {
  id: string; businessId: string;
  name: string;
  contactType: "customer" | "supplier" | "both";
  city: string;
  address: string | null;
  stateCode: string;        // "09"
  gstin: string | null; pan: string | null;
  aadhaarEncrypted: string | null;
  phone: string | null;
  deletedAt: string | null; createdAt: string; updatedAt: string;
};
```

### `POST /api/contacts` — Firm
| Field | Required | Rule |
|---|---|---|
| `name` | yes | 1–200 |
| `contactType` | yes | `customer` / `supplier` / `both` |
| `city` | yes | 1–100 |
| `address` | no | ≤ 500 |
| `gstin` | one of these two | valid GSTIN (uppercased) |
| `stateCode` | one of these two | 2 digits |
| `pan` | no | valid PAN |
| `aadhaar` | no | 12 digits |
| `phone` | no | 10 digits |

If `gstin` is given, the state code is taken from it. If both are given they
must match.

→ `201 Contact` ⚠️ **not wrapped** — the contact object is the whole body
(every other route wraps it as `{ "contact": … }`).

Errors: `400 VALIDATION_FAILED` ("Give either a GSTIN or a state code."),
`400 STATE_MISMATCH`, `400 INVALID_STATE`, `409 ALREADY_EXISTS` (same GSTIN
already saved in this firm).

### `GET /api/contacts?search=` — Firm
`search` (optional, ≤ 100) matches **name or city**, case-insensitive.
Sorted A–Z by name, max 50, deleted contacts hidden.

→ `200 { "contacts": Contact[] }` (empty list = `[]`, not an error)

Error: `400 SEARCH_TOO_LONG`.

### `GET /api/contacts/:id` — Firm
→ `200 { "contact": Contact }`

Errors: `400 INVALID_ID`, `404 CONTACT_NOT_FOUND` (also for another firm's
or a deleted contact).

### `PATCH /api/contacts/:id` — Firm
Same fields as create, all optional, at least one. Fields not sent stay as
they are. (A field cannot be cleared back to empty yet.)

→ `200 { "contact": Contact }`

Errors: as GET, plus `400 VALIDATION_FAILED`, `400 STATE_MISMATCH`,
`400 INVALID_STATE`, `409 ALREADY_EXISTS`.

### `DELETE /api/contacts/:id` — Firm
Soft delete — old bills keep their copy of the details.

→ `204` (no body)

Errors: `400 INVALID_ID`, `404 CONTACT_NOT_FOUND`.

---

## 6. Items

```ts
type Item = {
  id: string; businessId: string;
  description: string;      // "KURTA PAJAMA"
  hsnCode: string;          // "62114290"
  designNo: string;         // "BC-101", unique per firm (case-insensitive)
  unit: string;             // "PCS"
  stockQty: number;         // pieces, never negative
  deletedAt: string | null; createdAt: string; updatedAt: string;
};
```

### `POST /api/items` — Firm
| Field | Required | Rule |
|---|---|---|
| `description` | yes | 1–200 |
| `hsnCode` | yes | 4–8 digits |
| `designNo` | yes | 1–50 |
| `unit` | yes | 1–10 (uppercased) |
| `openingStock` | no | whole number 0–1,000,000, default 0 |

→ `201 { "item": Item }`

Errors: `400 VALIDATION_FAILED`, `409 ALREADY_EXISTS` (design no. taken).

### `GET /api/items?search=` — Firm
`search` matches **description or design no.** Sorted A–Z by description,
max 50.

→ `200 { "items": Item[] }`

### `GET /api/items/:id` — Firm
→ `200 { "item": Item }` · Errors: `400 INVALID_ID`, `404 ITEM_NOT_FOUND`.

### `PATCH /api/items/:id` — Firm
`description`, `hsnCode`, `designNo`, `unit` — optional, at least one.
**Stock cannot be edited here**; use `POST /api/items/:id/adjust`.
`stockQty` in the body is ignored.

→ `200 { "item": Item }`

### `POST /api/items/:id/adjust` — Firm
Add or remove stock by hand (new goods arrived, damaged, counted wrong).
Every change is saved as a stock movement and in the audit log.

| Field | Type | Rule |
|---|---|---|
| `change` | integer | pieces to add (`50`) or remove (`-3`); not 0; −1,000,000 to 1,000,000 |
| `note` | string | required, 1–200 chars ("New stock from Surat") |

→ `200 { "item": Item }` (with the new `stockQty`)

Errors: `400 VALIDATION_FAILED`, `400 INVALID_ID`, `404 ITEM_NOT_FOUND`,
`409 INSUFFICIENT_STOCK` ("Only 22 left of BC-101." — stock cannot go below 0).

### `DELETE /api/items/:id` — Firm
Soft delete. → `204`

---

## 7. Sale bills

### `POST /api/sales` — Firm
Saves the whole bill in one transaction: number, lines, GST, stock, ledger,
audit. Either everything is saved or nothing is.

| Field | Required | Rule |
|---|---|---|
| `date` | yes | `YYYY-MM-DD` — decides the financial year and GST rule |
| `billedToContactId` | yes | uuid; contact must be `customer` or `both` |
| `shippedToContactId` | no | uuid |
| `lines` | yes | 1–50 lines |
| `lines[].itemId` | yes | uuid |
| `lines[].qty` | yes | whole number 1–100,000 |
| `lines[].rate` | yes | **paise per piece**, 0–100,000,000 |
| `discounts` | no | 0–2 milli-percent values, default `[]` |
| `grRrNo` | no | ≤ 50 |
| `transport` | no | ≤ 100 |
| `vehicleNo` | no | ≤ 20 (uppercased) |
| `station` | no | ≤ 100 |

Example:
```json
{
  "date": "2026-11-16",
  "billedToContactId": "93697418-1ff3-4293-9ff5-4c69e80f1868",
  "lines": [{ "itemId": "9f81af99-f279-4333-9c76-9f457de778e8", "qty": 10, "rate": 85000 }],
  "discounts": [10000]
}
```

→ `201 { "invoice": Invoice }` — e.g. `invoiceNo "1/2026-27"`,
`grandTotal 803300` (₹8,033.00).

**The server calculates every amount.** The frontend may show a live
preview, but the saved bill is always the server's numbers.

Errors:
| Code | When |
|---|---|
| `400 VALIDATION_FAILED` | bad body |
| `400 NOT_A_CUSTOMER` | billed-to is a supplier |
| `400 ITEM_NOT_FOUND` | an item is missing or deleted |
| `400 INSUFFICIENT_STOCK` | "Only 40 left of BC-101." |
| `400 INVALID_ID` / `404 CONTACT_NOT_FOUND` | bad contact |

A failed bill does **not** use up a bill number.

```ts
type Invoice = {
  id: string; businessId: string;
  docType: "sale"; fy: string;            // "2026-27"
  serial: number; invoiceNo: string;      // 1, "1/2026-27"
  supplierInvoiceNo: null;
  date: string; status: "active" | "cancelled";
  cancelledAt: string | null; cancelledBy: string | null; cancelReason: string | null;
  refInvoiceId: null; noteReason: null;
  // billed-to snapshot (copied at billing time; never changes later)
  billedToContactId: string; billedToName: string; billedToAddress: string | null;
  billedToGstin: string | null; billedToPan: string | null;
  billedToAadhaarEncrypted: string | null; billedToPhone: string | null;
  billedToStateCode: string;
  // shipped-to snapshot (all null if not sent)
  shippedToContactId: string | null; shippedToName: string | null;
  shippedToAddress: string | null; shippedToGstin: string | null;
  shippedToPan: string | null; shippedToAadhaarEncrypted: string | null;
  shippedToPhone: string | null; shippedToStateCode: string | null;
  placeOfSupply: string; reverseCharge: boolean;
  grRrNo: string | null; transport: string | null;
  vehicleNo: string | null; station: string | null;
  shippingCost: number; transportType: string | null;
  discounts: { seq: number; percentMilli: number; amount: number }[];
  // all paise
  gross: number; discountTotal: number; taxable: number;
  cgst: number; sgst: number; igst: number;
  roundOff: number;                        // can be negative
  grandTotal: number;
  createdBy: string; createdAt: string; updatedAt: string;
};
```

Same state as the firm → `cgst` + `sgst` (equal), `igst = 0`.
Different state → `igst` only.

### `GET /api/sales?search=` — Firm
`search` matches **customer name or bill number**. Newest first, max 100.
Light rows only, for the bill list:

→ `200`
```json
{
  "sales": [
    { "id": "uuid", "invoiceNo": "2/2026-27", "date": "2026-11-16",
      "billedToName": "VISHAL GARMENTS", "grandTotal": 89300, "status": "active" }
  ]
}
```

### `GET /api/sales/:id` — Firm
Everything needed to show or print one bill.

→ `200`
```json
{ "invoice": Invoice, "lines": InvoiceLine[], "taxSummary": TaxRow[] }
```
```ts
type InvoiceLine = {
  id: string; businessId: string; invoiceId: string;
  lineNo: number;                 // 1, 2, 3… in print order
  itemId: string;
  description: string; hsnCode: string; designNo: string; unit: string; // snapshot
  qty: number;
  rate: number;                   // paise per piece
  gross: number;                  // qty × rate
  discountAlloc: number;          // this line's share of the bill discount
  taxable: number;                // gross − discountAlloc
  gstRateBp: number;              // 500 or 1800
  createdAt: string;
};
type TaxRow = {                   // the HSN table on the bill
  id: string; businessId: string; invoiceId: string;
  hsnCode: string; gstRateBp: number;
  taxable: number; cgst: number; sgst: number; igst: number;
  createdAt: string;
};
```

Errors: `400 INVALID_ID`, `404 INVOICE_NOT_FOUND`.

For the printed bill also call `GET /api/businesses/profile` (firm header,
bank, terms). Amount in words: use the same Indian grouping as
`src/core/amountInWords.ts`.

### `POST /api/sales/:id/cancel` — Owner
Cancels a bill. The bill **stays** in the list with `status: "cancelled"`
and keeps its number (numbers never get reused, no gaps). In one
transaction: stock goes back for every line, the customer's ledger gets
a matching credit, and the audit log records who cancelled and why.

| Field | Type | Rule |
|---|---|---|
| `reason` | string | required, 1–200 chars ("Wrong party") |

→ `200 { "invoice": Invoice }` (with `status: "cancelled"`, `cancelledAt`,
`cancelledBy`, `cancelReason`)

Errors: `400 VALIDATION_FAILED`, `400 INVALID_ID`, `403 FORBIDDEN` (staff),
`404 INVOICE_NOT_FOUND`, `409 ALREADY_CANCELLED`.

**Frontend:** show cancelled bills in the list with a "CANCELLED" badge and
leave them out of "Sales today". A cancelled bill still prints, with a
large "CANCELLED" mark. Ask for the reason in an in-page dialog first.

---

## 8. Not built yet (do not call)

Purchase bills · payments and ledger screen · GST summary ·
credit / debit notes · staff users.
