import { describe, expect, it } from "vitest";
import { PAYMENT_CHANNELS, getPaymentChannel } from "./paymentChannels";

describe("payment channel configuration", () => {
  it("exposes the supplied authenticated wallet recipient details", () => {
    expect(getPaymentChannel("bkash").recipientValue).toBe("01706559143");
    expect(getPaymentChannel("nagad").recipientValue).toBe("01863211541");
  });

  it("activates the supplied Maybank beneficiary details for bank transfer", () => {
    const bank = getPaymentChannel("bank");
    expect(bank.available).toBe(true);
    expect(bank.title).toBe("Maybank");
    expect(bank.accountHolder).toBe("IMON KHAN");
    expect(bank.recipientValue).toBe("5140 1212 2490");
  });

  it("keeps bKash, Nagad, and bank transfer available as separate checkout choices", () => {
    expect(PAYMENT_CHANNELS.filter((channel) => channel.available)).toHaveLength(3);
  });

  it("provides visual identity metadata for every payment choice", () => {
    expect(PAYMENT_CHANNELS.map((channel) => channel.localLabel)).toEqual(["বিকাশ", "নগদ", "Maybank"]);
    expect(PAYMENT_CHANNELS.every((channel) => channel.logoUrl.startsWith("/assets/") && channel.logoAlt.endsWith("logo"))).toBe(true);
  });
});
