import { describe, expect, it } from "vitest";
import { PAYMENT_PROOF_MAX_BYTES, paymentProofValidationMessage, validatePaymentProofFile } from "./paymentProof";

describe("payment proof upload validation", () => {
  it("accepts an in-limit PNG screenshot", () => {
    expect(validatePaymentProofFile({ type: "image/png", size: 1024 } as File)).toBeNull();
  });

  it("rejects unsupported and oversized files before upload", () => {
    expect(validatePaymentProofFile({ type: "application/pdf", size: 1024 } as File)).toBe("type");
    expect(validatePaymentProofFile({ type: "image/jpeg", size: PAYMENT_PROOF_MAX_BYTES + 1 } as File)).toBe("size");
    expect(paymentProofValidationMessage("type")).toContain("JPG");
  });
});
