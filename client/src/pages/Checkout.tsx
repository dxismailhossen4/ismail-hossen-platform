import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { VIP_PAYMENT_PLAN, isValidPaymentReference, normalizePaymentReference } from "@/lib/payment";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ArrowRight, BadgeCheck, CircleAlert, CreditCard, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation } from "wouter";

const PAYMENT_METHODS = ["Bank Transfer", "DuitNow", "Other approved method"];

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading, refreshDashboard } = useSupabaseAuth();
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [reference, setReference] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedReference = normalizePaymentReference(reference);
    if (!isValidPaymentReference(normalizedReference)) {
      setError("Enter a valid payment reference between 6 and 80 characters.");
      return;
    }
    if (!acknowledged) {
      setError("Please confirm the responsible-use and payment-verification notice.");
      return;
    }
    if (!user) return;

    setSubmitting(true);
    setError(null);
    const { error: insertError } = await supabase.from("payments").insert({
      user_id: user.id,
      amount: VIP_PAYMENT_PLAN.amount,
      currency: VIP_PAYMENT_PLAN.currency,
      payment_method: method,
      transaction_id: normalizedReference,
      status: "pending",
    });
    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    await refreshDashboard();
    setSubmitted(true);
  };

  if (loading) return <main className="site-shell grid min-h-screen place-items-center"><p className="text-sm text-slate-400">Checking your secure account…</p></main>;

  if (!isAuthenticated) return <main className="site-shell flex min-h-screen items-center justify-center px-5 py-10"><section className="panel-border w-full max-w-md rounded-[2rem] bg-[#0c1425]/90 p-8 text-center"><LockKeyhole className="mx-auto size-8 text-orange-300" aria-hidden="true" /><h1 className="font-display mt-5 text-3xl font-extrabold tracking-[-0.05em] text-white">Sign in before payment submission.</h1><p className="mt-4 text-sm leading-6 text-slate-400">Payment references can only be submitted from the authenticated account that will receive the membership access.</p><button type="button" onClick={() => setLocation("/auth")} className="orange-glow mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-[#1c0b00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70]">Sign In or Sign Up<ArrowRight className="size-4" aria-hidden="true" /></button><button type="button" onClick={() => setLocation("/membership")} className="soft-button mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white"><ArrowLeft className="size-4" aria-hidden="true" />Back to membership</button></section></main>;

  if (submitted) return <main className="site-shell flex min-h-screen items-center justify-center px-5 py-10"><section className="panel-border w-full max-w-md rounded-[2rem] bg-[#0c1425]/90 p-8 text-center"><BadgeCheck className="mx-auto size-10 text-orange-300" aria-hidden="true" /><p className="mt-5 text-xs font-extrabold tracking-[0.16em] text-orange-300 uppercase">Payment submitted</p><h1 className="font-display mt-3 text-3xl font-extrabold tracking-[-0.05em] text-white">Awaiting verification.</h1><p className="mt-4 text-sm leading-6 text-slate-400">Your payment reference is pending administrator review. VIP access will activate only after the payment is approved.</p><button type="button" onClick={() => setLocation("/account/payment-history")} className="orange-glow mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-[#1c0b00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70]">View payment history<ArrowRight className="size-4" aria-hidden="true" /></button></section></main>;

  return <main className="site-shell min-h-screen px-5 py-8 sm:px-8 sm:py-12"><section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]"><div className="panel-border rounded-[2rem] bg-[#0c1425]/88 p-6 sm:p-8"><button type="button" onClick={() => setLocation("/membership")} className="soft-button inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d]"><ArrowLeft className="size-4" aria-hidden="true" />Back to membership</button><div className="mt-10"><p className="text-xs font-extrabold tracking-[0.16em] text-orange-300 uppercase">Membership checkout</p><h1 className="font-display mt-4 text-3xl font-extrabold tracking-[-0.05em] text-white sm:text-4xl">Submit your payment reference.</h1><p className="mt-4 text-sm leading-6 text-slate-400">Use this form only after paying through your approved payment channel. No membership is activated until an administrator completes verification.</p></div><div className="mt-8 rounded-2xl border border-orange-300/18 bg-orange-400/[0.055] p-5"><p className="text-sm font-bold text-orange-200">{VIP_PAYMENT_PLAN.name}</p><p className="font-display mt-1 text-3xl font-extrabold tracking-[-0.05em] text-white">{VIP_PAYMENT_PLAN.currency} {VIP_PAYMENT_PLAN.amount}</p><p className="mt-2 text-sm text-slate-400">{VIP_PAYMENT_PLAN.durationDays}-day VIP access after verified approval</p></div><div className="mt-6 flex gap-3 rounded-xl border border-slate-700/60 bg-slate-950/25 p-4 text-sm leading-6 text-slate-400"><CircleAlert className="mt-1 size-4 shrink-0 text-orange-300" aria-hidden="true" /><p>Payment submission is a verification request. Approval is manual, and membership access is not granted automatically by this form.</p></div></div><section className="panel-border rounded-[2rem] bg-[#0b1323]/90 p-6 sm:p-8"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-orange-400/10 text-orange-300"><CreditCard className="size-5" aria-hidden="true" /></span><div><h2 className="font-display text-xl font-extrabold tracking-[-0.04em] text-white">Payment verification</h2><p className="text-sm text-slate-400">Submit a traceable reference for review.</p></div></div><form className="mt-8 space-y-5" onSubmit={submitPayment}><label className="block"><span className="mb-2 block text-sm font-bold text-slate-200">Payment method</span><select value={method} onChange={(event) => setMethod(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-950/35 px-3 text-sm text-white outline-none focus:border-orange-300/70">{PAYMENT_METHODS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-200">Transaction reference</span><input value={reference} onChange={(event) => setReference(event.target.value)} required maxLength={80} className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-950/35 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-300/70" placeholder="Example: TXN-2026-000123" /><span className="mt-2 block text-xs leading-5 text-slate-500">Use the reference from your completed payment. Do not enter bank-account credentials or card details.</span></label><label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-950/20 p-4"><input checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} type="checkbox" className="mt-1 size-4 accent-[#ff6b00]" /><span className="text-sm leading-6 text-slate-300">I confirm that this payment reference is accurate and understand that access is granted only after manual verification. I acknowledge the platform’s responsible-use notice.</span></label>{error ? <p role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-3 text-sm leading-6 text-red-200">{error}</p> : null}<button type="submit" disabled={submitting} className="soft-button orange-glow inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-[#1c0b00] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70]">{submitting ? "Submitting…" : "Submit for Verification"}<ArrowRight className="size-4" aria-hidden="true" /></button></form></section></section></main>;
}
