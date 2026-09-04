export type AccessTier = "free" | "member" | "vip";

const TIER_RANK: Record<AccessTier, number> = { free: 0, member: 1, vip: 2 };

export function accessTierLabel(tier: AccessTier) {
  return tier === "member" ? "Member / Freemium Plus" : tier === "vip" ? "VIP" : "Free";
}

export function canAccessContent(userTier: AccessTier, minimumTier: AccessTier) {
  return TIER_RANK[userTier] >= TIER_RANK[minimumTier];
}

export function livePaymentNotice(status: string, id: string) {
  if (status === "approved") return { id, tone: "success" as const, title: "VIP membership approved", description: "Your payment was approved. Your VIP access is now available in the member area." };
  if (status === "rejected") return { id, tone: "warning" as const, title: "Payment needs attention", description: "Your payment was not approved. Please review the administrator note and contact support if needed." };
  if (status === "more_info") return { id, tone: "info" as const, title: "More payment information requested", description: "The administrator requested additional information. Open Payment History to review the note." };
  return null;
}
