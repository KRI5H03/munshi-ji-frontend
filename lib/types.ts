// Shapes copied from docs/API.md. If the API changes, change this file to match.
// Money is integer paise. Discounts are milli-percent. GST rate is basis points.

export type Role = "owner" | "staff";

export type LoginBusiness = {
  id: string;
  name: string;
  role: Role;
  isDefault: boolean;
};

export type LoginResponse = {
  token: string;
  userId: string;
  businesses: LoginBusiness[];
};

export type Business = {
  id: string;
  name: string;
  gstin: string;
  stateCode: string;
  address: string;
  phone: string | null;
  pan: string | null;
  msmeUdhyamNo: string | null;
  branchAddress: string | null;
  jurisdiction: string | null;
  bankName: string | null;
  bankAccountNo: string | null;
  ifsc: string | null;
  bankBranch: string | null;
  termsText: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactType = "customer" | "supplier" | "both";

export type Contact = {
  id: string;
  businessId: string;
  name: string;
  contactType: ContactType;
  city: string;
  address: string | null;
  stateCode: string;
  gstin: string | null;
  pan: string | null;
  aadhaarEncrypted: string | null;
  phone: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Item = {
  id: string;
  businessId: string;
  description: string;
  hsnCode: string;
  designNo: string;
  unit: string;
  stockQty: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceStatus = "active" | "cancelled";

export type InvoiceDiscount = {
  seq: number;
  percentMilli: number;
  amount: number;
};

export type Invoice = {
  id: string;
  businessId: string;
  docType: "sale";
  fy: string;
  serial: number;
  invoiceNo: string;
  supplierInvoiceNo: null;
  date: string;
  status: InvoiceStatus;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancelReason: string | null;
  refInvoiceId: null;
  noteReason: null;
  billedToContactId: string;
  billedToName: string;
  billedToAddress: string | null;
  billedToGstin: string | null;
  billedToPan: string | null;
  billedToAadhaarEncrypted: string | null;
  billedToPhone: string | null;
  billedToStateCode: string;
  shippedToContactId: string | null;
  shippedToName: string | null;
  shippedToAddress: string | null;
  shippedToGstin: string | null;
  shippedToPan: string | null;
  shippedToAadhaarEncrypted: string | null;
  shippedToPhone: string | null;
  shippedToStateCode: string | null;
  placeOfSupply: string;
  reverseCharge: boolean;
  grRrNo: string | null;
  transport: string | null;
  vehicleNo: string | null;
  station: string | null;
  shippingCost: number;
  transportType: string | null;
  discounts: InvoiceDiscount[];
  gross: number;
  discountTotal: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  grandTotal: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceLine = {
  id: string;
  businessId: string;
  invoiceId: string;
  lineNo: number;
  itemId: string;
  description: string;
  hsnCode: string;
  designNo: string;
  unit: string;
  qty: number;
  rate: number;
  gross: number;
  discountAlloc: number;
  taxable: number;
  gstRateBp: number;
  createdAt: string;
};

export type TaxRow = {
  id: string;
  businessId: string;
  invoiceId: string;
  hsnCode: string;
  gstRateBp: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  createdAt: string;
};

/** One light row from GET /api/sales. */
export type SaleRow = {
  id: string;
  invoiceNo: string;
  date: string;
  billedToName: string;
  grandTotal: number;
  status: InvoiceStatus;
};

/** GET /api/sales/:id */
export type SaleDetail = {
  invoice: Invoice;
  lines: InvoiceLine[];
  taxSummary: TaxRow[];
};
