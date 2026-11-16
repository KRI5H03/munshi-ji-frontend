// Sample data for the design mock-ups, shaped exactly like docs/API.md.
// Every PAN, phone, bank and transport value here is made up. Deleted with the last mock-up.
import type {
  Business,
  Contact,
  Item,
  LoginResponse,
  SaleDetail,
  SaleRow,
} from "@/lib/types";

const FIRM_ID = "5b0c1f6e-2a44-4d0b-9a57-0f3f1f0a7c11";
const USER_ID = "0d5a9f3c-7b1e-4c55-8f0a-3f6d2f1b9e21";
const AT = "2026-11-16T05:30:00.000Z";

export const TODAY = "2026-11-16";

export const login: LoginResponse = {
  token: "mock-token",
  userId: USER_ID,
  businesses: [
    { id: FIRM_ID, name: "BHOLA COLLECTION", role: "owner", isDefault: true },
    { id: "a4e9d2b7-6c31-4f8e-b0d5-9c2e7a1f4d32", name: "BHOLA SALES", role: "owner", isDefault: false },
  ],
};

export const business: Business = {
  id: FIRM_ID,
  name: "BHOLA COLLECTION",
  gstin: "09AGDPR3745A1ZJ",
  stateCode: "09",
  address: "General Ganj, Kanpur, Uttar Pradesh 208001",
  phone: "9876501234",
  pan: "AGDPR3745A",
  msmeUdhyamNo: "UDYAM-UP-00-0000000",
  branchAddress: "Sample Market, Kanpur, Uttar Pradesh 208001",
  jurisdiction: "Kanpur",
  bankName: "TEST BANK",
  bankAccountNo: "123456789012",
  ifsc: "SBIN0001234",
  bankBranch: "KANPUR",
  termsText:
    "Goods once sold will not be taken back.\nInterest at 18% a year is charged on bills unpaid after 30 days.\nAll disputes subject to Kanpur jurisdiction.",
  createdAt: AT,
  updatedAt: AT,
};

export const contacts: Contact[] = [
  {
    id: "c1d7b6a2-3e5f-4a90-8b1c-6d2e9f0a7b43",
    businessId: FIRM_ID,
    name: "BULAND AKHTAR",
    contactType: "customer",
    city: "Nagra",
    address: null,
    stateCode: "09",
    gstin: null,
    pan: null,
    aadhaarEncrypted: null,
    phone: null,
    deletedAt: null,
    createdAt: AT,
    updatedAt: AT,
  },
  {
    id: "93697418-1ff3-4293-9ff5-4c69e80f1868",
    businessId: FIRM_ID,
    name: "VISHAL GARMENTS",
    contactType: "customer",
    city: "Mau",
    address: "Sadar Bazar, Mau, Uttar Pradesh",
    stateCode: "09",
    gstin: "09BBPPV6063F1Z1",
    pan: null,
    aadhaarEncrypted: null,
    phone: "9876543210",
    deletedAt: null,
    createdAt: AT,
    updatedAt: AT,
  },
];

export const items: Item[] = [
  {
    id: "9f81af99-f279-4333-9c76-9f457de778e8",
    businessId: FIRM_ID,
    description: "KURTA PAJAMA",
    hsnCode: "62114290",
    designNo: "BC-101",
    unit: "PCS",
    stockQty: 40,
    deletedAt: null,
    createdAt: AT,
    updatedAt: AT,
  },
  {
    id: "2c6e8d14-5a7b-4f39-a1d0-8e3b7c9f5a64",
    businessId: FIRM_ID,
    description: "LEGGINGS",
    hsnCode: "6204",
    designNo: "BS-202",
    unit: "PCS",
    stockQty: 6,
    deletedAt: null,
    createdAt: AT,
    updatedAt: AT,
  },
];

/** Frontend-only rule (not in the API): stock at or below this is shown as low. */
export const LOW_STOCK_AT = 10;

const BILL_1_ID = "e7a3c5d9-1b2f-4e68-9c0a-4d7f2b8e6a75";

export const sales: SaleRow[] = [
  {
    id: "f8b4d6ea-2c3a-4f79-8d1b-5e8a3c9f7b86",
    invoiceNo: "2/2026-27",
    date: TODAY,
    billedToName: "BULAND AKHTAR",
    grandTotal: 89300,
    status: "active",
  },
  {
    id: BILL_1_ID,
    invoiceNo: "1/2026-27",
    date: TODAY,
    billedToName: "VISHAL GARMENTS",
    grandTotal: 803300,
    status: "active",
  },
];

/** Bill 1/2026-27: 10 × ₹850, 10% discount, 5% GST, total ₹8,033.00. */
export const bill: SaleDetail = {
  invoice: {
    id: BILL_1_ID,
    businessId: FIRM_ID,
    docType: "sale",
    fy: "2026-27",
    serial: 1,
    invoiceNo: "1/2026-27",
    supplierInvoiceNo: null,
    date: TODAY,
    status: "active",
    cancelledAt: null,
    cancelledBy: null,
    cancelReason: null,
    refInvoiceId: null,
    noteReason: null,
    billedToContactId: contacts[1].id,
    billedToName: "VISHAL GARMENTS",
    billedToAddress: "Sadar Bazar, Mau, Uttar Pradesh",
    billedToGstin: "09BBPPV6063F1Z1",
    billedToPan: "ABCDE1234F",
    billedToAadhaarEncrypted: null,
    billedToPhone: "9876543210",
    billedToStateCode: "09",
    shippedToContactId: null,
    shippedToName: null,
    shippedToAddress: null,
    shippedToGstin: null,
    shippedToPan: null,
    shippedToAadhaarEncrypted: null,
    shippedToPhone: null,
    shippedToStateCode: null,
    placeOfSupply: "09",
    reverseCharge: false,
    grRrNo: "1234",
    transport: "SAMPLE TRANSPORT CO.",
    vehicleNo: "UP78AB1234",
    station: "MAU",
    shippingCost: 0,
    transportType: null,
    discounts: [{ seq: 1, percentMilli: 10000, amount: 85000 }],
    gross: 850000,
    discountTotal: 85000,
    taxable: 765000,
    cgst: 19125,
    sgst: 19125,
    igst: 0,
    roundOff: 50,
    grandTotal: 803300,
    createdBy: USER_ID,
    createdAt: AT,
    updatedAt: AT,
  },
  lines: [
    {
      id: "a9c5e7fb-3d4b-4a8a-9e2c-6f9b4d0a8c97",
      businessId: FIRM_ID,
      invoiceId: BILL_1_ID,
      lineNo: 1,
      itemId: items[0].id,
      description: "KURTA PAJAMA",
      hsnCode: "62114290",
      designNo: "BC-101",
      unit: "PCS",
      qty: 10,
      rate: 85000,
      gross: 850000,
      discountAlloc: 85000,
      taxable: 765000,
      gstRateBp: 500,
      createdAt: AT,
    },
  ],
  taxSummary: [
    {
      id: "b0d6f80c-4e5c-4b9b-af3d-70ac5e1b9da8",
      businessId: FIRM_ID,
      invoiceId: BILL_1_ID,
      hsnCode: "62114290",
      gstRateBp: 500,
      taxable: 765000,
      cgst: 19125,
      sgst: 19125,
      igst: 0,
      createdAt: AT,
    },
  ],
};

/** Derived the way the real bills screen will: from the list, not from a stats route. */
export const todaySales = sales.filter((s) => s.date === TODAY && s.status === "active");
export const todayTotal = todaySales.reduce((sum, s) => sum + s.grandTotal, 0);
