import { describe, expect, it } from "vitest";
import { formatMembershipStatus, hasActiveMembership, type MembershipRecord } from "./dashboard";

const activeMembership: MembershipRecord = { id: "1", status: "active", starts_at: "2026-01-01T00:00:00Z", expires_at: "2099-01-01T00:00:00Z" };

describe("dashboard membership selection", () => {
  it("only treats an unexpired active record as active member access", () => {
    expect(hasActiveMembership(activeMembership)).toBe(true);
    expect(hasActiveMembership({ ...activeMembership, expires_at: "2020-01-01T00:00:00Z" })).toBe(false);
    expect(hasActiveMembership({ ...activeMembership, status: "pending" })).toBe(false);
  });

  it("presents an accessible membership label without fabricating account data", () => {
    expect(formatMembershipStatus(null)).toBe("Free");
    expect(formatMembershipStatus(activeMembership)).toBe("VIP Active");
  });
});
