export type PaymentChannelId = "bkash" | "nagad" | "bank";

export type PaymentChannel = {
  id: PaymentChannelId;
  title: string;
  shortLabel: string;
  category: "Mobile Wallet" | "Bank Account";
  paymentMethod: string;
  recipientLabel: string;
  recipientValue: string | null;
  accountHolder: string | null;
  referenceLabel: string;
  available: boolean;
  instructions: string[];
};

export const PAYMENT_CHANNELS: PaymentChannel[] = [
  {
    id: "bkash",
    title: "bKash",
    shortLabel: "bKash wallet",
    category: "Mobile Wallet",
    paymentMethod: "bKash · Send Money",
    recipientLabel: "bKash number",
    recipientValue: "01706559143",
    accountHolder: "Ismail Hossen",
    referenceLabel: "bKash transaction ID",
    available: true,
    instructions: ["Open bKash and choose Send Money.", "Send the approved membership amount to the number shown below.", "Save the transaction ID and upload its payment proof screenshot."],
  },
  {
    id: "nagad",
    title: "Nagad",
    shortLabel: "Nagad wallet",
    category: "Mobile Wallet",
    paymentMethod: "Nagad · Send Money",
    recipientLabel: "Nagad number",
    recipientValue: "01863211541",
    accountHolder: "Ismail Hossen",
    referenceLabel: "Nagad transaction ID",
    available: true,
    instructions: ["Open Nagad and choose Send Money.", "Send the approved membership amount to the number shown below.", "Save the transaction ID and upload its payment proof screenshot."],
  },
  {
    id: "bank",
    title: "Bank Account",
    shortLabel: "Bank transfer",
    category: "Bank Account",
    paymentMethod: "Bank Transfer",
    recipientLabel: "Bank details",
    recipientValue: null,
    accountHolder: null,
    referenceLabel: "Bank transfer reference",
    available: false,
    instructions: ["Bank account details will appear here after they are configured by the platform administrator."],
  },
];

export function getPaymentChannel(id: PaymentChannelId) {
  return PAYMENT_CHANNELS.find((channel) => channel.id === id) ?? PAYMENT_CHANNELS[0];
}
