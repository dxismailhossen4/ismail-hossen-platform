import DashboardLayout from "@/components/DashboardLayout";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { ADMIN_NAV_ITEMS, getAdminSection, getNavigationLabel } from "@/lib/navigation";
import { DAILY_PHOTO_MAX_BYTES, DAILY_PHOTO_TYPES, dailyPhotoValidationMessage, readDailyPhotoAsBase64, validateDailyPhotoFile } from "@/lib/dailyMedia";
import { paymentDecisionLabel, type PaymentDecision } from "@/lib/payment";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { BadgeCheck, CalendarDays, CheckCircle2, ClipboardCheck, FileText, Image, ImageUp, LoaderCircle, RefreshCw, Upload, UsersRound, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

type PendingPayment = { id: string; user_id: string; amount: string | number; currency: string; payment_method: string; transaction_id: string; submitted_date: string; created_at: string; payment_proof_key: string | null; payment_proof_filename: string | null };

type DailyPhotoRecord = { url?: string; key?: string; fileName?: string; contentType?: string };

function DailyPhotoManager() {
  const { user, session } = useSupabaseAuth();
  const uploadDailyPhoto = trpc.dailyPhoto.upload.useMutation();
  const [currentPhoto, setCurrentPhoto] = useState<DailyPhotoRecord | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void supabase.rpc("get_daily_photo").then(({ data }) => {
      if (!active) return;
      setCurrentPhoto((data as DailyPhotoRecord | null) ?? null);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const selectPhoto = (file: File | null) => {
    setError(null);
    setMessage(null);
    if (!file) return;
    const issue = validateDailyPhotoFile(file);
    if (issue) {
      setSelectedFile(null);
      setPreviewUrl(null);
      if (photoInputRef.current) photoInputRef.current.value = "";
      setError(dailyPhotoValidationMessage(issue));
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const publishPhoto = async () => {
    if (!selectedFile || !session?.access_token || !user || uploading) return;
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const base64 = await readDailyPhotoAsBase64(selectedFile);
      const uploaded = await uploadDailyPhoto.mutateAsync({ accessToken: session.access_token, fileName: selectedFile.name, contentType: selectedFile.type, base64 });
      const { error: settingsError } = await supabase.from("admin_settings").upsert({ key: "daily_photo", value: { url: uploaded.url, key: uploaded.key, fileName: uploaded.fileName, contentType: uploaded.contentType }, updated_by: user.id }, { onConflict: "key" });
      if (settingsError) throw settingsError;
      setCurrentPhoto(uploaded);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (photoInputRef.current) photoInputRef.current.value = "";
      setMessage(currentPhoto?.url ? "Daily photo replaced and published for visitors." : "Daily photo uploaded and published for visitors.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The daily photo could not be published. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return <section className="mt-8 panel-border rounded-2xl bg-[#0b1323]/80 p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><CalendarDays className="size-5 text-orange-300" aria-hidden="true" /><h2 className="font-display text-xl font-extrabold text-white">Daily photo post</h2></div><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Upload one image for today. Uploading another image later replaces the current public daily photo.</p></div><span className="rounded-full border border-orange-300/20 bg-orange-400/[0.07] px-3 py-1.5 text-xs font-bold text-orange-200">Admin only</span></div>{error ? <p role="alert" className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">{error}</p> : null}{message ? <p role="status" className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-400/[0.07] px-4 py-3 text-sm leading-6 text-emerald-100"><CheckCircle2 className="mr-2 inline size-4" aria-hidden="true" />{message}</p> : null}<div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center"><div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30">{loading ? <div className="grid min-h-56 place-items-center text-sm text-slate-500">Loading current daily photo…</div> : previewUrl || currentPhoto?.url ? <img src={previewUrl ?? currentPhoto?.url} alt={previewUrl ? "Selected replacement daily photo preview" : "Currently published daily photo"} className="max-h-72 min-h-56 w-full object-cover" /> : <div className="grid min-h-56 place-items-center p-6 text-center"><ImageUp className="size-10 text-slate-600" aria-hidden="true" /><p className="mt-3 text-sm text-slate-500">No daily photo is published yet.</p></div>}</div><div className="flex min-w-52 flex-col gap-3"><input ref={photoInputRef} id="daily-photo-upload" type="file" accept={DAILY_PHOTO_TYPES.join(",")} onChange={(event) => selectPhoto(event.target.files?.[0] ?? null)} className="sr-only" /><label htmlFor="daily-photo-upload" className="soft-button inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-orange-300/50 bg-orange-400/[0.08] px-4 text-sm font-extrabold text-orange-100 hover:bg-orange-400/[0.16] focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[#ff8a3d]"><Upload className="size-4" aria-hidden="true" />{currentPhoto?.url ? "Choose replacement" : "Upload photo"}</label>{selectedFile ? <button type="button" onClick={() => void publishPhoto()} disabled={uploading} className="soft-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-4 text-sm font-extrabold text-[#1c0b00] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70]">{uploading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}{uploading ? "Publishing…" : currentPhoto?.url ? "Replace current photo" : "Publish photo"}</button> : null}<p className="text-center text-xs leading-5 text-slate-500">JPG, PNG, or WEBP · maximum {(DAILY_PHOTO_MAX_BYTES / 1024 / 1024).toFixed(0)} MB</p></div></div></section>;
}

const ADMIN_COPY: Record<string, { title: string; description: string }> = { overview: { title: "Admin overview", description: "A protected workspace for managing users, content, membership operations, and audit-friendly platform records." }, users: { title: "Users", description: "Search, review, and manage account status through the administrator-only user-management workflow." }, predictions: { title: "Predictions", description: "Create, review, publish, archive, and distinguish free versus member-only prediction records." }, results: { title: "Results", description: "Enter and maintain verified historical results with a clear distinction between prediction records and actual outcomes." }, memberships: { title: "Memberships", description: "Create packages, review eligibility, and manage membership duration or current access state." }, payments: { title: "Payment verification", description: "Review each submitted payment reference and its private proof screenshot before making an access decision." }, "site-content": { title: "Site Content", description: "Manage hero messaging, selected public content, FAQs, announcements, and other homepage sections without altering verified records." }, support: { title: "Support", description: "Review account and member support requests through a secure administrator workflow." } };

function PaymentReviewPanel() {
  const { user, session } = useSupabaseAuth(); const [payments, setPayments] = useState<PendingPayment[]>([]); const [loading, setLoading] = useState(true); const [reviewingId, setReviewingId] = useState<string | null>(null); const [notes, setNotes] = useState<Record<string, string>>({}); const [error, setError] = useState<string | null>(null); const [message, setMessage] = useState<string | null>(null); const [proofPaymentId, setProofPaymentId] = useState<string | null>(null);
  const proofQuery = trpc.paymentProof.getSignedUrl.useQuery({ accessToken: session?.access_token ?? "", paymentId: proofPaymentId ?? "00000000-0000-0000-0000-000000000000" }, { enabled: Boolean(session?.access_token && proofPaymentId), retry: false });
  const loadPayments = useCallback(async () => { setLoading(true); setError(null); const { data, error: fetchError } = await supabase.from("payments").select("id, user_id, amount, currency, payment_method, transaction_id, submitted_date, created_at, payment_proof_key, payment_proof_filename").eq("status", "pending").order("created_at", { ascending: true }); if (fetchError) setError(fetchError.message); else setPayments((data as PendingPayment[] | null) ?? []); setLoading(false); }, []);
  useEffect(() => { void loadPayments(); }, [loadPayments]);
  const reviewPayment = async (paymentId: string, decision: PaymentDecision) => { if (!user) return; setReviewingId(paymentId); setError(null); setMessage(null); const { error: reviewError } = await supabase.rpc("review_vip_payment", { p_payment_id: paymentId, p_decision: decision, p_admin_note: notes[paymentId]?.trim() || null }); setReviewingId(null); if (reviewError) { setError(reviewError.message); return; } setPayments((current) => current.filter((payment) => payment.id !== paymentId)); setMessage(`${paymentDecisionLabel(decision)}. ${decision === "approved" ? "VIP access has been activated for 30 days." : "The user’s payment status was updated."}`); };
  return <section className="mt-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-white">Pending payment reviews</p><p className="mt-1 text-sm text-slate-400">Check the reference and private proof before approving access.</p></div><button type="button" onClick={() => void loadPayments()} disabled={loading} className="soft-button inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-700/65 bg-slate-950/30 px-3 text-sm font-bold text-slate-200 hover:border-orange-300/50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d]"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh</button></div>{error ? <p role="alert" className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">{error}</p> : null}{message ? <p role="status" className="mt-4 rounded-xl border border-orange-300/20 bg-orange-400/8 px-4 py-3 text-sm leading-6 text-orange-100">{message}</p> : null}{loading ? <p className="mt-5 text-sm text-slate-400">Loading pending payments…</p> : payments.length === 0 ? <div className="mt-5 rounded-2xl border border-slate-700/60 bg-slate-950/20 p-6 text-sm leading-6 text-slate-400">There are no pending payment references to review.</div> : <div className="mt-5 space-y-4">{payments.map((payment) => <article key={payment.id} className="panel-border rounded-2xl bg-[#0b1323]/80 p-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">Amount</p><p className="mt-1 text-sm font-bold text-white">{payment.currency} {payment.amount}</p></div><div><p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">Method</p><p className="mt-1 text-sm text-slate-300">{payment.payment_method}</p></div><div><p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">Reference</p><p className="mt-1 break-all text-sm text-slate-300">{payment.transaction_id}</p></div><div><p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">Proof</p>{payment.payment_proof_key ? <button type="button" onClick={() => setProofPaymentId(payment.id)} className="soft-button mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-orange-200 hover:text-orange-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8a3d]"><Image className="size-4" aria-hidden="true" />View proof</button> : <p className="mt-1 text-sm text-slate-500">No file</p>}</div></div><label className="mt-5 block"><span className="mb-2 block text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">Administrator note (optional)</span><input value={notes[payment.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [payment.id]: event.target.value }))} maxLength={500} className="min-h-11 w-full rounded-xl border border-slate-700/70 bg-slate-950/35 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-300/70" placeholder="Visible in the payment record" /></label><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={reviewingId === payment.id} onClick={() => void reviewPayment(payment.id, "approved")} className="soft-button inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#ff6b00] px-4 text-sm font-extrabold text-[#1c0b00] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70]"><BadgeCheck className="size-4" aria-hidden="true" />Approve & Activate</button><button type="button" disabled={reviewingId === payment.id} onClick={() => void reviewPayment(payment.id, "more_info")} className="soft-button min-h-10 rounded-xl border border-slate-600/60 px-4 text-sm font-bold text-slate-200 hover:border-orange-300/50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d]">Need Info</button><button type="button" disabled={reviewingId === payment.id} onClick={() => void reviewPayment(payment.id, "rejected")} className="soft-button min-h-10 rounded-xl border border-red-400/30 px-4 text-sm font-bold text-red-200 hover:bg-red-500/10 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-300">Reject</button></div></article>)}</div>}{proofPaymentId ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-5" role="dialog" aria-modal="true" aria-label="Payment proof preview"><div className="panel-border relative w-full max-w-3xl rounded-2xl bg-[#0b1323] p-4 sm:p-6"><button type="button" onClick={() => setProofPaymentId(null)} className="soft-button absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-lg bg-slate-950/80 text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8a3d]" aria-label="Close proof preview"><X className="size-4" aria-hidden="true" /></button><h3 className="font-display pr-10 text-lg font-extrabold text-white">Private payment proof</h3>{proofQuery.isLoading ? <p className="mt-6 text-sm text-slate-400">Loading secure proof…</p> : proofQuery.error ? <p role="alert" className="mt-5 text-sm leading-6 text-red-200">{proofQuery.error.message}</p> : proofQuery.data?.url ? <img src={proofQuery.data.url} alt="Payment proof submitted for administrator review" className="mt-5 max-h-[70vh] w-full rounded-xl object-contain" /> : null}</div></div> : null}</section>;
}
export default function Admin() { const [location] = useLocation(); const section = getAdminSection(location); const content = ADMIN_COPY[section] ?? ADMIN_COPY.overview; const activeLabel = getNavigationLabel(ADMIN_NAV_ITEMS, location, "Admin Overview"); return <DashboardLayout items={ADMIN_NAV_ITEMS} navigationLabel="Administration" requireAdmin><section className="mx-auto max-w-5xl py-3 sm:py-6"><p className="text-xs font-extrabold tracking-[0.16em] text-orange-300 uppercase">Administrator workspace</p><h1 className="font-display mt-3 text-3xl font-extrabold tracking-[-0.05em] text-white sm:text-4xl">{content.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">{content.description}</p>{section === "payments" ? <PaymentReviewPanel /> : section === "site-content" ? <DailyPhotoManager /> : <div className="mt-8 grid gap-4 md:grid-cols-3"><article className="panel-border rounded-2xl bg-[#0b1323]/80 p-5 md:col-span-2"><FileText className="size-5 text-orange-300" aria-hidden="true" /><p className="mt-4 text-sm font-bold text-white">{activeLabel}</p><p className="mt-2 text-sm leading-6 text-slate-400">This protected page structure is ready for the corresponding management tools and verified data forms.</p></article><article className="panel-border rounded-2xl bg-orange-400/[0.055] p-5"><ClipboardCheck className="size-5 text-orange-300" aria-hidden="true" /><p className="mt-4 text-sm font-bold text-white">Audit-ready workflow</p><p className="mt-2 text-sm leading-6 text-slate-400">Administrative content should be published with clear status and timestamps.</p></article><article className="rounded-2xl border border-slate-700/60 bg-slate-950/20 p-5"><UsersRound className="size-5 text-slate-300" aria-hidden="true" /><p className="mt-4 text-sm font-bold text-white">Role separation</p><p className="mt-2 text-sm leading-6 text-slate-400">Only accounts with the administrator role can reach these routes.</p></article></div>}</section></DashboardLayout>; }
