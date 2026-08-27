import { describe, expect, it } from "vitest";
import { isValidPaymentReference, normalizePaymentReference, paymentDecisionLabel } from "./payment";

describe("payment verification helpers", () => {
  it("normalizes and validates a reasonable transaction reference", () => {
    expect(normalizePaymentReference("  REF   2026-0001  ")).toBe("REF 2026-0001");
    expect(isValidPaymentReference("REF 2026-0001")).toBe(true);
    expect(isValidPaymentReference("123")).toBe(false);
  });

  it("uses unambiguous payment-review labels", () => {
    expect(paymentDecisionLabel("approved")).toBe("Approved");
    expect(paymentDecisionLabel("more_info")).toBe("More information requested");
  });
});
