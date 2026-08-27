export const PAYMENT_PROOF_MAX_BYTES = 3 * 1024 * 1024;
export const PAYMENT_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type PaymentProofIssue = "type" | "size";

export function validatePaymentProofFile(file: Pick<File, "type" | "size">): PaymentProofIssue | null {
  if (!PAYMENT_PROOF_TYPES.includes(file.type as (typeof PAYMENT_PROOF_TYPES)[number])) return "type";
  if (file.size <= 0 || file.size > PAYMENT_PROOF_MAX_BYTES) return "size";
  return null;
}

export function paymentProofValidationMessage(issue: PaymentProofIssue | null) {
  if (issue === "type") return "Upload a JPG, PNG, or WEBP image file.";
  if (issue === "size") return "Payment proof must be between 1 byte and 3 MB.";
  return "";
}

export function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 2 : 1)} MB`;
}

export function readPaymentProofAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The selected proof image could not be read."));
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        reject(new Error("The selected proof image could not be read."));
        return;
      }
      const [, base64 = ""] = dataUrl.split(",", 2);
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}
