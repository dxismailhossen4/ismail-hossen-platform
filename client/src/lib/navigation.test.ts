import { describe, expect, it } from "vitest";
import { getAccountSection, getAdminSection, getNavigationLabel, MEMBER_NAV_ITEMS, PUBLIC_NAV_ITEMS } from "./navigation";

describe("site navigation structure", () => {
  it("keeps the core public routes available in the navigation model", () => {
    expect(PUBLIC_NAV_ITEMS.map((item) => item.path)).toEqual(
      expect.arrayContaining(["/", "/free-tips", "/results", "/performance", "/vip", "/faq", "/contact"]),
    );
  });

  it("resolves member and administrator route sections predictably", () => {
    expect(getAccountSection("/account/payment-history")).toBe("payment-history");
    expect(getAdminSection("/admin/site-content")).toBe("site-content");
    expect(getNavigationLabel(MEMBER_NAV_ITEMS, "/account/security", "Overview")).toBe("Security");
  });
});
