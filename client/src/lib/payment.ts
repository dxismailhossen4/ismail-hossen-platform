export const VIP_PAYMENT_PLAN = {
  name: "VIP One Set",
  amount: 500,
  currency: "MYR",
  durationDays: 30,
} as const;

export type PaymentDecision = "approved" | "rejected" | "more_info";

export function normalizePaymentReference(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function isValidPaymentReference(value: string) {
  const reference = normalizePaymentReference(value);
  return reference.length >= 6 && reference.length <= 80;
}

export function paymentDecisionLabel(decision: PaymentDecision) {
  if (decision === "approved") return "Approved";
  if (decision === "more_info") return "More information requested";
  return "Rejected";
}
