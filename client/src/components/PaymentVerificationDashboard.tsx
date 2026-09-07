import { BadgeCheck, CheckCircle2, Clock3, FileImage, LoaderCircle, RefreshCw, Search, ShieldCheck, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { paymentDecisionLabel, type PaymentDecision } from "@/lib/payment";
import { adminPaymentStatusLabel, countActiveMemberships, filterAdminPayments, type AdminPaymentFilter, type AdminPaymentStatus } from "@/lib/adminDashboard";
import DemoPaymentSimulator from "@/components/DemoPaymentSimulator";
import { supabase } from "@/lib/supabase";
import { createPaymentProofSignedUrl } from "@/lib/supabaseStorage";

type PaymentStatus = AdminPaymentStatus;
type Filter = AdminPaymentFilter;

type PaymentRow = {
  id: string;
  user_id: string;
  amount: string | number;
  currency: string;
  payment_method: string;
  transaction_id: string;
  status: PaymentStatus;
  submitted_date: string;
  created_at: string;
  updated_at: string;
  admin_note: string | null;
  payment_proof_key: string | null;
  payment_proof_filename: string | null;
};

type MembershipRow = {
  id: string;
  user_id: string;
  status: "inactive" | "pending" | "active" | "expired";
  starts_at: string | null;
  expires_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function shortId(value: string) {
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

function statusClass(status: PaymentStatus) {
  if (status === "approved") return "border-emerald-300/25 bg-emerald-400/10 text-emerald-200";
  if (status === "rejected") return "border-red-300/25 bg-red-400/10 text-red-200";
  if (status === "more_info") return "border-amber-300/25 bg-amber-400/10 text-amber-200";
  return "border-orange-300/25 bg-orange-400/10 text-orange-200";
}

export default function PaymentVerificationDashboard() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [proofPaymentId, setProofPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  useEffect(() => { let active = true; setProofUrl(null); setProofError(null); if (!proofPaymentId) return; setProofLoading(true); void Promise.resolve(supabase.from("payments").select("payment_proof_key").eq("id", proofPaymentId).maybeSingle()).then(async ({ data, error }) => { if (error) throw error; if (!data?.payment_proof_key) throw new Error("No payment proof is available for this record."); const url = await createPaymentProofSignedUrl(data.payment_proof_key); if (active) setProofUrl(url); }).catch((error: unknown) => { if (active) setProofError(error instanceof Error ? error.message : "The proof preview could not be loaded."); }).finally(() => { if (active) setProofLoading(false); }); return () => { active = false; }; }, [proofPaymentId]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [paymentsResult, membershipsResult] = await Promise.all([
      supabase.from("payments").select("id, user_id, amount, currency, payment_method, transaction_id, status, submitted_date, created_at, updated_at, admin_note, payment_proof_key, payment_proof_filename").order("created_at", { ascending: false }),
      supabase.from("memberships").select("id, user_id, status, starts_at, expires_at").order("updated_at", { ascending: false }),
    ]);
    if (paymentsResult.error) setError(paymentsResult.error.message);
    else setPayments((paymentsResult.data as PaymentRow[] | null) ?? []);
    if (membershipsResult.error && !paymentsResult.error) setError(membershipsResult.error.message);
    else setMemberships((membershipsResult.data as MembershipRow[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const counts = useMemo(() => ({
    all: payments.length,
    pending: payments.filter((payment) => payment.status === "pending").length,
    approved: payments.filter((payment) => payment.status === "approved").length,
    more_info: payments.filter((payment) => payment.status === "more_info").length,
    rejected: payments.filter((payment) => payment.status === "rejected").length,
    active: countActiveMemberships(memberships),
  }), [payments, memberships]);

  const visiblePayments = useMemo(() => filterAdminPayments(payments, filter, search), [filter, payments, search]);

  const reviewPayment = async (paymentId: string, decision: PaymentDecision) => {
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
    setMessage(`${paymentDecisionLabel(decision)} completed. ${decision === "approved" ? "The membership was activated or extended." : "The payment status was updated."}`);
    await loadDashboard();
  };

  const metricCards = [
    { label: "Needs review", value: counts.pending, Icon: Clock3, target: "pending" as Filter },
    { label: "Needs information", value: counts.more_info, Icon: ShieldCheck, target: "more_info" as Filter },
    { label: "Approved payments", value: counts.approved, Icon: CheckCircle2, target: "approved" as Filter },
    { label: "Active memberships", value: counts.active, Icon: BadgeCheck, target: "all" as Filter },
  ];

  return (
    <section className="mt-8 space-y-6" aria-label="Payment verification dashboard">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ label, value, Icon, target }) => (
          <button key={label} type="button" onClick={() => setFilter(target)} className="panel-border rounded-2xl bg-[#0b1323]/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-300/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d]">
            <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span><Icon className="size-4 text-orange-300" aria-hidden="true" /></div>
            <p className="mt-3 font-display text-3xl font-extrabold text-white">{value}</p>
          </button>
        ))}
      </div>

      <DemoPaymentSimulator />

      <div className="panel-border rounded-2xl bg-[#0b1323]/80 p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div><p className="text-sm font-bold text-white">Payment review queue</p><p className="mt-1 text-sm leading-6 text-slate-400">Review the private proof and reference, then approve, request information, or reject.</p></div>
          <button type="button" onClick={() => void loadDashboard()} disabled={loading} className="soft-button inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-700/65 bg-slate-950/30 px-3 text-sm font-bold text-slate-200 hover:border-orange-300/50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d]"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh queue</button>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="relative block"><span className="sr-only">Search payment queue</span><Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-slate-500" aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, user ID, or method" className="min-h-11 w-full rounded-xl border border-slate-700/70 bg-slate-950/35 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-300/70" /></label>
          <div className="flex flex-wrap gap-2" aria-label="Payment status filters">{(["pending", "more_info", "approved", "rejected", "all"] as Filter[]).map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`min-h-10 rounded-xl border px-3 text-xs font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8a3d] ${filter === item ? "border-orange-300/60 bg-orange-400/15 text-orange-100" : "border-slate-700/70 text-slate-400 hover:text-white"}`}>{item === "all" ? `All (${counts.all})` : `${adminPaymentStatusLabel(item)} (${counts[item]})`}</button>)}</div>
        </div>
      </div>

      {error ? <p role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">{error}</p> : null}
      {message ? <p role="status" className="rounded-xl border border-emerald-300/20 bg-emerald-400/[0.07] px-4 py-3 text-sm leading-6 text-emerald-100"><CheckCircle2 className="mr-2 inline size-4" aria-hidden="true" />{message}</p> : null}

      {loading ? <div className="rounded-2xl border border-slate-700/60 bg-slate-950/20 p-6 text-sm text-slate-400">Loading the verification queue…</div> : visiblePayments.length === 0 ? <div className="rounded-2xl border border-slate-700/60 bg-slate-950/20 p-6 text-sm leading-6 text-slate-400">No payments match this filter. New submissions will appear here after the member submits a reference and proof.</div> : <div className="space-y-4">{visiblePayments.map((payment) => <article key={payment.id} className="panel-border rounded-2xl bg-[#0b1323]/80 p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(payment.status)}`}>{adminPaymentStatusLabel(payment.status)}</span><span className="text-xs text-slate-500">Submitted {formatDate(payment.created_at)}</span></div><p className="mt-3 text-lg font-extrabold text-white">{payment.currency} {payment.amount} · {payment.payment_method}</p><p className="mt-1 text-sm text-slate-400">User <span className="font-mono text-slate-300">{shortId(payment.user_id)}</span></p></div><div className="rounded-xl border border-slate-700/60 bg-slate-950/30 px-3 py-2 text-right"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Membership</p><p className="mt-1 text-sm font-bold text-white">{memberships.find((membership) => membership.user_id === payment.user_id)?.status ?? "No record"}</p></div></div><div className="mt-5 grid gap-4 md:grid-cols-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Reference</p><p className="mt-1 break-all text-sm text-slate-200">{payment.transaction_id}</p></div><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Submitted date</p><p className="mt-1 text-sm text-slate-300">{payment.submitted_date}</p></div><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Proof</p>{payment.payment_proof_key ? <button type="button" onClick={() => setProofPaymentId(payment.id)} className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-orange-200 hover:text-orange-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8a3d]"><FileImage className="size-4" aria-hidden="true" />View private proof{payment.payment_proof_filename ? ` · ${payment.payment_proof_filename}` : ""}</button> : <p className="mt-1 text-sm text-slate-500">No proof attached</p>}</div></div>{payment.status === "pending" ? <><label className="mt-5 block"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Administrator note</span><input value={notes[payment.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [payment.id]: event.target.value }))} maxLength={500} className="min-h-11 w-full rounded-xl border border-slate-700/70 bg-slate-950/35 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-300/70" placeholder="Explain approval, rejection, or missing information" /></label><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={reviewingId === payment.id} onClick={() => void reviewPayment(payment.id, "approved")} className="soft-button inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#ff6b00] px-4 text-sm font-extrabold text-[#1c0b00] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70]"><BadgeCheck className="size-4" aria-hidden="true" />{reviewingId === payment.id ? "Saving…" : "Approve & activate"}</button><button type="button" disabled={reviewingId === payment.id} onClick={() => void reviewPayment(payment.id, "more_info")} className="soft-button min-h-10 rounded-xl border border-slate-600/60 px-4 text-sm font-bold text-slate-200 hover:border-orange-300/50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d]">Request information</button><button type="button" disabled={reviewingId === payment.id} onClick={() => void reviewPayment(payment.id, "rejected")} className="soft-button min-h-10 rounded-xl border border-red-400/30 px-4 text-sm font-bold text-red-200 hover:bg-red-500/10 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-300">Reject</button></div></> : payment.admin_note ? <p className="mt-5 rounded-xl border border-slate-700/60 bg-slate-950/20 px-4 py-3 text-sm leading-6 text-slate-400">Admin note: {payment.admin_note}</p> : null}</article>)}</div>}

      {proofPaymentId ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-5" role="dialog" aria-modal="true" aria-label="Payment proof preview"><div className="panel-border relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-[#0b1323] p-4 sm:p-6"><button type="button" onClick={() => setProofPaymentId(null)} className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-lg bg-slate-950/80 text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8a3d]" aria-label="Close proof preview"><X className="size-4" aria-hidden="true" /></button><h3 className="font-display pr-10 text-lg font-extrabold text-white">Private payment proof</h3>{proofLoading ? <p className="mt-6 text-sm text-slate-400">Loading secure proof…</p> : proofError ? <p role="alert" className="mt-5 text-sm leading-6 text-red-200">{proofError}</p> : proofUrl ? <img src={proofUrl} alt="Payment proof submitted for administrator review" className="mt-5 max-h-[70vh] w-full rounded-xl object-contain" /> : <p className="mt-5 text-sm text-slate-400">No proof preview is available.</p>}</div></div> : null}
    </section>
  );
}
