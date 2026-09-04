export type AdminPaymentStatus = "pending" | "approved" | "rejected" | "more_info";
export type AdminPaymentFilter = "all" | AdminPaymentStatus;

export type AdminPaymentSummary = {
  user_id: string;
  payment_method: string;
  transaction_id: string;
  status: AdminPaymentStatus;
};

export type AdminMembershipSummary = {
  status: "inactive" | "pending" | "active" | "expired";
  expires_at: string | null;
};

export function adminPaymentStatusLabel(status: AdminPaymentStatus) {
  return status === "more_info" ? "Needs information" : status.charAt(0).toUpperCase() + status.slice(1);
}

export function filterAdminPayments<T extends AdminPaymentSummary>(payments: T[], filter: AdminPaymentFilter, search: string) {
  const term = search.trim().toLowerCase();
  return payments.filter((payment) => {
    const matchesFilter = filter === "all" || payment.status === filter;
    const matchesSearch = !term || payment.transaction_id.toLowerCase().includes(term) || payment.user_id.toLowerCase().includes(term) || payment.payment_method.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });
}

export function countActiveMemberships(memberships: AdminMembershipSummary[], now = new Date()) {
  return memberships.filter((membership) => membership.status === "active" && (!membership.expires_at || new Date(membership.expires_at) > now)).length;
}
