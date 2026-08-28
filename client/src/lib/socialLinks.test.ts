import { describe, expect, it } from "vitest";
import { SOCIAL_LINKS, WHATSAPP_CONTACTS } from "./socialLinks";

describe("social and contact links", () => {
  it("keeps the supplied official social profile URLs", () => {
    expect(SOCIAL_LINKS).toEqual([
      {
        id: "facebook",
        label: "Facebook",
        handle: "Official profile",
        href: "https://www.facebook.com/profile.php?id=61592890808867",
      },
      {
        id: "instagram",
        label: "Instagram",
        handle: "@mdismail90154",
        href: "https://www.instagram.com/mdismail90154?igsh=enQxOGY5a3EzZXh4",
      },
    ]);
  });

  it("maps each supplied WhatsApp number to a working wa.me link", () => {
    expect(WHATSAPP_CONTACTS.map((contact) => contact.href)).toEqual([
      "https://wa.me/8801863211541",
      "https://wa.me/8801341926364",
    ]);
    expect(WHATSAPP_CONTACTS.map((contact) => contact.displayNumber)).toEqual([
      "+880 1863 211541",
      "+880 1341 926364",
    ]);
  });
});
