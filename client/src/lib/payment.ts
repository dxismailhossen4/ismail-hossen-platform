export const VIP_PAYMENT_PLAN = {
  name: "VIP One Set",
  amount: 500,
  currency: "MYR",
  durationDays: 30,
} as const;

export type PaymentDecision = "approved" | "rejected" | "more_info";
export type PaymentStatus = "pending" | "approved" | "rejected" | "more_info";

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

export function getPaymentStatusPresentation(status: PaymentStatus) {
  if (status === "approved") {
    return {
      label: "Approved",
      description: "Your payment has been verified and VIP access is active or has been extended.",
      tone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    };
  }
  if (status === "rejected") {
    return {
      label: "Rejected",
      description: "The submitted payment could not be verified. Check the administrator note and submit a corrected reference if needed.",
      tone: "border-red-400/25 bg-red-500/10 text-red-200",
    };
  }
  if (status === "more_info") {
    return {
      label: "More information needed",
      description: "An administrator needs more details before they can verify this payment.",
      tone: "border-amber-300/25 bg-amber-300/10 text-amber-100",
    };
  }
  return {
    label: "Pending review",
    description: "Your payment reference and proof screenshot are waiting for administrator verification.",
    tone: "border-sky-300/25 bg-sky-400/10 text-sky-100",
  };
}
