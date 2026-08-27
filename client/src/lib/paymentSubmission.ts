export type PaymentSubmissionStage = "idle" | "preparing" | "uploading" | "recording" | "complete";

export const PAYMENT_SUBMISSION_STEPS = [
  { key: "preparing", label: "Preparing your proof", description: "Reading the selected screenshot securely." },
  { key: "uploading", label: "Uploading proof", description: "Saving your screenshot to private storage." },
  { key: "recording", label: "Creating verification request", description: "Linking your proof to the payment reference." },
] as const;

export function getSubmissionFeedback(stage: PaymentSubmissionStage) {
  if (stage === "preparing") return "Preparing your proof screenshot…";
  if (stage === "uploading") return "Uploading your private proof screenshot…";
  if (stage === "recording") return "Saving your payment verification request…";
  if (stage === "complete") return "Payment verification request submitted.";
  return "";
}

export function isSubmissionStepComplete(stage: PaymentSubmissionStage, step: (typeof PAYMENT_SUBMISSION_STEPS)[number]["key"]) {
  const order: PaymentSubmissionStage[] = ["idle", "preparing", "uploading", "recording", "complete"];
  return order.indexOf(stage) > order.indexOf(step);
}

export function isSubmissionStepActive(stage: PaymentSubmissionStage, step: (typeof PAYMENT_SUBMISSION_STEPS)[number]["key"]) {
  return stage === step;
}
