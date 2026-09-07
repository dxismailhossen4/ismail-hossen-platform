export type PaymentChannelId = "bkash" | "nagad" | "bank";

export type PaymentChannel = {
  id: PaymentChannelId;
  title: string;
  shortLabel: string;
  localLabel: string;
  logoUrl: string;
  logoAlt: string;
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
    localLabel: "বিকাশ",
    logoUrl: "/assets/bkash-logo_392da5f7.png",
    logoAlt: "bKash logo",
    category: "Mobile Wallet",
    paymentMethod: "bKash · Send Money",
    recipientLabel: "bKash number",
    recipientValue: "01706559143",
    accountHolder: "SINGAPORE POOLS 4D6D",
    referenceLabel: "bKash transaction ID",
    available: true,
    instructions: ["Open bKash and choose Send Money.", "Send the approved membership amount to the number shown below.", "Save the transaction ID and upload its payment proof screenshot."],
  },
  {
    id: "nagad",
    title: "Nagad",
    shortLabel: "Nagad wallet",
    localLabel: "নগদ",
    logoUrl: "/assets/nagad-logo_c4cd92b1.png",
    logoAlt: "Nagad logo",
    category: "Mobile Wallet",
    paymentMethod: "Nagad · Send Money",
    recipientLabel: "Nagad number",
    recipientValue: "01863211541",
    accountHolder: "SINGAPORE POOLS 4D6D",
    referenceLabel: "Nagad transaction ID",
    available: true,
    instructions: ["Open Nagad and choose Send Money.", "Send the approved membership amount to the number shown below.", "Save the transaction ID and upload its payment proof screenshot."],
  },
  {
    id: "bank",
    title: "Maybank",
    shortLabel: "Maybank transfer",
    localLabel: "Maybank",
    logoUrl: "/assets/maybank-logo_ce807edb.png",
    logoAlt: "Maybank logo",
    category: "Bank Account",
    paymentMethod: "Maybank · Bank Transfer",
    recipientLabel: "Maybank account number",
    recipientValue: "5140 1212 2490",
    accountHolder: "IMON KHAN",
    referenceLabel: "Maybank transfer reference",
    available: true,
    instructions: ["Open your bank transfer service and select Maybank as the receiving bank.", "Transfer the approved membership amount to the account number shown below.", "Save the bank transfer reference and upload a readable proof screenshot."],
  },
];

export function getPaymentChannel(id: PaymentChannelId) {
  return PAYMENT_CHANNELS.find((channel) => channel.id === id) ?? PAYMENT_CHANNELS[0];
}
