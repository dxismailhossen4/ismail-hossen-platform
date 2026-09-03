import { CheckCircle2, CircleAlert, FlaskConical, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import { demoPaymentMessage, nextDemoPaymentStatus, type DemoPaymentStatus } from "@/lib/demoPayment";

type DemoStatus = DemoPaymentStatus;

const demoCopy: Record<DemoStatus, { label: string; tone: string }> = {
  pending: { label: "Pending review", tone: "border-orange-300/25 bg-orange-400/10 text-orange-100" },
  approved: { label: "Approved", tone: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100" },
  rejected: { label: "Rejected", tone: "border-red-300/25 bg-red-500/10 text-red-100" },
};

export default function DemoPaymentSimulator() {
  const [status, setStatus] = useState<DemoStatus>("pending");
  const state = demoCopy[status];
  const StatusIcon = status === "approved" ? CheckCircle2 : status === "rejected" ? XCircle : CircleAlert;
  return (
    <section className="panel-border rounded-2xl border-dashed bg-[#101a2c]/70 p-4 sm:p-5" aria-label="Demo payment simulator">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex items-center gap-2"><FlaskConical className="size-5 text-orange-300" aria-hidden="true" /><p className="text-sm font-extrabold text-white">Demo payment simulator</p><span className="rounded-full border border-slate-600/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Synthetic only</span></div><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Use this safe walkthrough to demonstrate both decisions. It is local UI state only; it never creates, approves, rejects, or alters a real payment record.</p></div><button type="button" onClick={() => setStatus(nextDemoPaymentStatus("reset"))} className="soft-button inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-700/70 px-3 text-sm font-bold text-slate-300 hover:border-orange-300/50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8a3d]"><RotateCcw className="size-4" aria-hidden="true" />Reset demo</button></div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center"><div className={`rounded-xl border p-4 ${state.tone}`}><div className="flex items-center gap-2"><StatusIcon className="size-4" aria-hidden="true" /><p className="text-sm font-extrabold">{state.label}</p></div><p className="mt-2 text-sm leading-6 opacity-90">{demoPaymentMessage(status)}</p><div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-3"><span>Demo user: DEMO-USER</span><span>Reference: DEMO-4D-001</span><span>Amount: MYR 50</span></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setStatus(nextDemoPaymentStatus("approve"))} className="soft-button inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#ff6b00] px-3 text-sm font-extrabold text-[#1c0b00] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ffad70]"><CheckCircle2 className="size-4" aria-hidden="true" />Approve demo</button><button type="button" onClick={() => setStatus(nextDemoPaymentStatus("reject"))} className="soft-button inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-400/30 px-3 text-sm font-bold text-red-200 hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-red-300"><XCircle className="size-4" aria-hidden="true" />Reject demo</button></div></div>
    </section>
  );
}
