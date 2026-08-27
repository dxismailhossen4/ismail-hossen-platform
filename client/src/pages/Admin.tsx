import DashboardLayout from "@/components/DashboardLayout";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { ADMIN_NAV_ITEMS, getAdminSection, getNavigationLabel } from "@/lib/navigation";
import { paymentDecisionLabel, type PaymentDecision } from "@/lib/payment";
import { supabase } from "@/lib/supabase";
import { BadgeCheck, CircleAlert, ClipboardCheck, FileText, RefreshCw, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";

type PendingPayment = { id: string; user_id: string; amount: string | number; currency: string; payment_method: string; transaction_id: string; submitted_date: string; created_at: string };

const ADMIN_COPY: Record<string, { title: string; description: string }> = {
  overview: { title: "Admin overview", description: "A protected workspace for managing users, content, membership operations, and audit-friendly platform records." },
  users: { title: "Users", description: "Search, review, and manage account status through the administrator-only user-management workflow." },
  predictions: { title: "Predictions", description: "Create, review, publish, archive, and distinguish free versus member-only prediction records." },
  results: { title: "Results", description: "Enter and maintain verified historical results with a clear distinction between prediction records and actual outcomes." },
  memberships: { title: "Memberships", description: "Create packages, review eligibility, and manage membership duration or current access state." },
  payments: { title: "Payment verification", description: "Review submitted payment references. Approval activates or extends the matching user’s VIP access for 30 days." },
  "site-content": { title: "Site Content", description: "Manage hero messaging, selected public content, FAQs, announcements, and other homepage sections without altering verified records." },
  support: { title: "Support", description: "Review account and member support requests through a secure administrator workflow." },
};

function PaymentReviewPanel() {
  const { user } = useSupabaseAuth();
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase.from("payments").select("id, user_id, amount, currency, payment_method, transaction_id, submitted_date, created_at").eq("status", "pending").order("created_at", { ascending: true });
    if (fetchError) setError(fetchError.message);
    else setPayments((data as PendingPayment[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void loadPayments(); }, [loadPayments]);

  const reviewPayment = async (paymentId: string, decision: PaymentDecision) => {
    if (!user) return;
    setReviewingId(paymentId);
    setError(null);
    setMessage(null);
    const { error: reviewError } = await supabase.rpc("review_vip_payment", {
      p_payment_id: paymentId,
      p_decision: decision,
      p_admin_note: notes[paymentId]?.trim() || null,
    });
    setReviewingId(null);
    if (reviewError) {
      setError(reviewError.message);
      return;
    }
    setPayments((current) => current.filter((payment) => payment.id !== paymentId));
    setMessage(`${paymentDecisionLabel(decision)}. ${decision === "approved" ? "VIP access has been activated for 30 days." : "The user’s payment status was updated."}`);
  };

  return <section className="mt-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-white">Pending payment reviews</p><p className="mt-1 text-sm text-slate-400">Only verified references should be approved.</p></div><button type="button" onClick={() => void loadPayments()} disabled={loading} className="soft-button inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-700/65 bg-slate-950/30 px-3 text-sm font-bold text-slate-200 hover:border-orange-300/50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d]"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh</button></div>{error ? <p role="alert" className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">{error}</p> : null}{message ? <p role="status" className="mt-4 rounded-xl border border-orange-300/20 bg-orange-400/8 px-4 py-3 text-sm leading-6 text-orange-100">{message}</p> : null}{loading ? <p className="mt-5 text-sm text-slate-400">Loading pending payments…</p> : payments.length === 0 ? <div className="mt-5 rounded-2xl border border-slate-700/60 bg-slate-950/20 p-6 text-sm leading-6 text-slate-400">There are no pending payment references to review.</div> : <div className="mt-5 space-y-4">{payments.map((payment) => <article key={payment.id} className="panel-border rounded-2xl bg-[#0b1323]/80 p-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">Amount</p><p className="mt-1 text-sm font-bold text-white">{payment.currency} {payment.amount}</p></div><div><p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">Method</p><p className="mt-1 text-sm text-slate-300">{payment.payment_method}</p></div><div><p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">Reference</p><p className="mt-1 break-all text-sm text-slate-300">{payment.transaction_id}</p></div><div><p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">User ID</p><p className="mt-1 break-all text-xs text-slate-500">{payment.user_id}</p></div></div><label className="mt-5 block"><span className="mb-2 block text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">Administrator note (optional)</span><input value={notes[payment.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [payment.id]: event.target.value }))} maxLength={500} className="min-h-11 w-full rounded-xl border border-slate-700/70 bg-slate-950/35 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-300/70" placeholder="Visible in the payment record" /></label><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={reviewingId === payment.id} onClick={() => void reviewPayment(payment.id, "approved")} className="soft-button inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#ff6b00] px-4 text-sm font-extrabold text-[#1c0b00] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70]"><BadgeCheck className="size-4" aria-hidden="true" />Approve & Activate</button><button type="button" disabled={reviewingId === payment.id} onClick={() => void reviewPayment(payment.id, "more_info")} className="soft-button min-h-10 rounded-xl border border-slate-600/60 px-4 text-sm font-bold text-slate-200 hover:border-orange-300/50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d]">Need Info</button><button type="button" disabled={reviewingId === payment.id} onClick={() => void reviewPayment(payment.id, "rejected")} className="soft-button min-h-10 rounded-xl border border-red-400/30 px-4 text-sm font-bold text-red-200 hover:bg-red-500/10 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-300">Reject</button></div></article>)}</div>}</section>;
}

export default function Admin() {
  const [location] = useLocation();
  const section = getAdminSection(location);
  const content = ADMIN_COPY[section] ?? ADMIN_COPY.overview;
  const activeLabel = getNavigationLabel(ADMIN_NAV_ITEMS, location, "Admin Overview");
  return <DashboardLayout items={ADMIN_NAV_ITEMS} navigationLabel="Administration" requireAdmin><section className="mx-auto max-w-5xl py-3 sm:py-6"><p className="text-xs font-extrabold tracking-[0.16em] text-orange-300 uppercase">Administrator workspace</p><h1 className="font-display mt-3 text-3xl font-extrabold tracking-[-0.05em] text-white sm:text-4xl">{content.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">{content.description}</p>{section === "payments" ? <PaymentReviewPanel /> : <div className="mt-8 grid gap-4 md:grid-cols-3"><article className="panel-border rounded-2xl bg-[#0b1323]/80 p-5 md:col-span-2"><FileText className="size-5 text-orange-300" aria-hidden="true" /><p className="mt-4 text-sm font-bold text-white">{activeLabel}</p><p className="mt-2 text-sm leading-6 text-slate-400">This protected page structure is ready for the corresponding management tools and verified data forms.</p></article><article className="panel-border rounded-2xl bg-orange-400/[0.055] p-5"><ClipboardCheck className="size-5 text-orange-300" aria-hidden="true" /><p className="mt-4 text-sm font-bold text-white">Audit-ready workflow</p><p className="mt-2 text-sm leading-6 text-slate-400">Administrative content should be published with clear status and timestamps.</p></article><article className="rounded-2xl border border-slate-700/60 bg-slate-950/20 p-5"><UsersRound className="size-5 text-slate-300" aria-hidden="true" /><p className="mt-4 text-sm font-bold text-white">Role separation</p><p className="mt-2 text-sm leading-6 text-slate-400">Only accounts with the administrator role can reach these routes.</p></article></div>}</section></DashboardLayout>;
}
