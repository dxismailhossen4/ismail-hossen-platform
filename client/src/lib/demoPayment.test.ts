import { describe, expect, it } from "vitest";
import { demoPaymentMessage, nextDemoPaymentStatus } from "./demoPayment";

describe("demo payment simulator", () => {
  it("walks through both decision branches without persistence", () => {
    expect(nextDemoPaymentStatus("reset")).toBe("pending");
    expect(nextDemoPaymentStatus("approve")).toBe("approved");
    expect(nextDemoPaymentStatus("reject")).toBe("rejected");
  });

  it("explains the production-safe meaning of each demo state", () => {
    expect(demoPaymentMessage("pending")).toContain("synthetic");
    expect(demoPaymentMessage("approved")).toContain("approval complete");
    expect(demoPaymentMessage("rejected")).toContain("rejection complete");
  });
});
