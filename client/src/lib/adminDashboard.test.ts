import { describe, expect, it } from "vitest";
import { adminPaymentStatusLabel, countActiveMemberships, filterAdminPayments } from "./adminDashboard";

describe("admin dashboard helpers", () => {
  const payments = [
    { user_id: "user-a", payment_method: "bKash", transaction_id: "BK-100", status: "pending" as const },
    { user_id: "user-b", payment_method: "Nagad", transaction_id: "NG-200", status: "approved" as const },
    { user_id: "user-c", payment_method: "Maybank", transaction_id: "MB-300", status: "more_info" as const },
  ];

  it("labels the needs-information state clearly", () => {
    expect(adminPaymentStatusLabel("more_info")).toBe("Needs information");
    expect(adminPaymentStatusLabel("pending")).toBe("Pending");
  });

  it("filters the review queue by status and searchable fields", () => {
    expect(filterAdminPayments(payments, "pending", "")).toHaveLength(1);
    expect(filterAdminPayments(payments, "all", "maybank")[0]?.transaction_id).toBe("MB-300");
    expect(filterAdminPayments(payments, "all", "user-b")[0]?.status).toBe("approved");
  });

  it("counts only active memberships that have not expired", () => {
    const now = new Date("2026-09-03T12:00:00.000Z");
    expect(countActiveMemberships([
      { status: "active", expires_at: "2026-09-04T12:00:00.000Z" },
      { status: "active", expires_at: "2026-09-02T12:00:00.000Z" },
      { status: "pending", expires_at: "2026-09-04T12:00:00.000Z" },
      { status: "active", expires_at: null },
    ], now)).toBe(2);
  });
});
