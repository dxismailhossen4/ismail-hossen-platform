import { describe, expect, it } from "vitest";
import { getSubmissionFeedback, isSubmissionStepActive, isSubmissionStepComplete } from "./paymentSubmission";

describe("payment submission feedback", () => {
  it("shows a specific update while each payment-submission stage is processed", () => {
    expect(getSubmissionFeedback("preparing")).toContain("Preparing");
    expect(getSubmissionFeedback("uploading")).toContain("Uploading");
    expect(getSubmissionFeedback("recording")).toContain("verification request");
  });

  it("marks previous upload steps complete without presenting future steps as complete", () => {
    expect(isSubmissionStepComplete("recording", "uploading")).toBe(true);
    expect(isSubmissionStepComplete("uploading", "recording")).toBe(false);
    expect(isSubmissionStepActive("recording", "recording")).toBe(true);
  });
});
