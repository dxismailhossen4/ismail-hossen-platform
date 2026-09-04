import { describe, expect, it } from "vitest";
import { accessTierLabel, canAccessContent, livePaymentNotice } from "./accessRules";

describe("content access rules", () => {
  it("orders Free, Member/Freemium Plus, and VIP tiers", () => {
    expect(canAccessContent("free", "free")).toBe(true);
    expect(canAccessContent("free", "member")).toBe(false);
    expect(canAccessContent("member", "member")).toBe(true);
    expect(canAccessContent("member", "vip")).toBe(false);
    expect(canAccessContent("vip", "member")).toBe(true);
    expect(accessTierLabel("member")).toBe("Member / Freemium Plus");
  });

  it("maps payment decisions to user-facing notices", () => {
    expect(livePaymentNotice("approved", "p-1")?.tone).toBe("success");
    expect(livePaymentNotice("rejected", "p-2")?.title).toBe("Payment needs attention");
    expect(livePaymentNotice("more_info", "p-3")?.title).toContain("information");
    expect(livePaymentNotice("pending", "p-4")).toBeNull();
  });
});
