import { describe, expect, it } from "vitest";
import { PAYMENT_CHANNELS, getPaymentChannel } from "./paymentChannels";

describe("payment channel configuration", () => {
  it("exposes the supplied authenticated wallet recipient details", () => {
    expect(getPaymentChannel("bkash").recipientValue).toBe("01706559143");
    expect(getPaymentChannel("nagad").recipientValue).toBe("01863211541");
  });

  it("keeps bank transfer unavailable until real bank details are supplied", () => {
    expect(getPaymentChannel("bank").available).toBe(false);
    expect(PAYMENT_CHANNELS.filter((channel) => channel.category === "Mobile Wallet")).toHaveLength(2);
  });
});
