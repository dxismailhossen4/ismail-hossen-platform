import { describe, expect, it } from "vitest";
import { formatFreeTipDate, validateFreeTipDraft } from "./freeTips";

describe("free tips helpers", () => {
  it("requires useful title and body lengths", () => {
    expect(validateFreeTipDraft({ title: "Hi", body: "Too short" })).toContain("Title");
    expect(validateFreeTipDraft({ title: "Today’s tip", body: "A concise informational daily update." })).toBeNull();
  });

  it("formats publication dates and handles missing values", () => {
    expect(formatFreeTipDate(null)).toBe("Not published yet");
    expect(formatFreeTipDate("2026-09-04T00:00:00.000Z")).toMatch(/2026/);
  });
});
