import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { FREE_TIP_BODY_MAX, FREE_TIP_TITLE_MAX, formatFreeTipDate, validateFreeTipDraft } from "@/lib/freeTips";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, FileText, LoaderCircle, RefreshCw, Send } from "lucide-react";
import { useEffect, useState } from "react";

type FreeTipPost = { id: string; title: string; body: string; published_at: string | null; updated_at: string };

export default function FreeTipsManager() {
  const { user } = useSupabaseAuth();
  const [post, setPost] = useState<FreeTipPost | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadPost = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase.from("free_tip_posts").select("id,title,body,published_at,updated_at").eq("is_published", true).order("published_at", { ascending: false }).limit(1).maybeSingle();
    if (fetchError) setError(fetchError.message);
    else {
      const next = (data as FreeTipPost | null) ?? null;
      setPost(next);
      setTitle(next?.title ?? "");
      setBody(next?.body ?? "");
    }
    setLoading(false);
  };

  useEffect(() => { void loadPost(); }, []);

  const publish = async () => {
    if (!user || publishing) return;
    const draft = { title, body };
    const validationError = validateFreeTipDraft(draft);
    if (validationError) { setError(validationError); setMessage(null); return; }
    setPublishing(true);
    setError(null);
    setMessage(null);
    const { data, error: publishError } = await supabase.rpc("publish_free_tip", { p_title: title.trim(), p_body: body.trim(), p_post_id: post?.id ?? null });
    if (publishError) setError(publishError.message);
    else {
      const next = data as FreeTipPost;
      setPost(next);
      setTitle(next.title);
      setBody(next.body);
      setMessage(post ? "Free Tip updated and published for visitors." : "Free Tip published for visitors.");
    }
    setPublishing(false);
  };

  return <section className="mt-8 panel-border rounded-2xl bg-[#0b1323]/80 p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><FileText className="size-5 text-orange-300" aria-hidden="true" /><h2 className="font-display text-xl font-extrabold text-white">Free Tips publisher</h2></div><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Write one public informational tip for today. Publishing a new tip replaces the current public tip while preserving the previous record for future history.</p></div><span className="rounded-full border border-orange-300/20 bg-orange-400/[0.07] px-3 py-1.5 text-xs font-bold text-orange-200">Admin only</span></div>
    {error ? <p role="alert" className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">{error}</p> : null}
    {message ? <p role="status" className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-400/[0.07] px-4 py-3 text-sm leading-6 text-emerald-100"><CheckCircle2 className="mr-2 inline size-4" aria-hidden="true" />{message}</p> : null}
    {loading ? <p className="mt-6 text-sm text-slate-400">Loading current Free Tip…</p> : <div className="mt-6 space-y-4">
      <label className="block"><span className="mb-2 block text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={FREE_TIP_TITLE_MAX} className="min-h-11 w-full rounded-xl border border-slate-700/70 bg-slate-950/35 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-300/70" placeholder="Today’s free tip" /></label>
      <label className="block"><span className="mb-2 block text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">Tip content</span><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={FREE_TIP_BODY_MAX} rows={6} className="w-full resize-y rounded-xl border border-slate-700/70 bg-slate-950/35 px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-orange-300/70" placeholder="Share a concise informational update…" /><span className="mt-2 block text-right text-xs text-slate-500">{body.length}/{FREE_TIP_BODY_MAX}</span></label>
      <div className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => void publish()} disabled={publishing} className="soft-button inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#ff6b00] px-4 text-sm font-extrabold text-[#1c0b00] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70]"><Send className="size-4" aria-hidden="true" />{publishing ? <><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Publishing…</> : post ? "Update & publish" : "Publish Free Tip"}</button><button type="button" onClick={() => void loadPost()} disabled={loading || publishing} className="soft-button inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700/70 px-4 text-sm font-bold text-slate-200 hover:border-orange-300/50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d]"><RefreshCw className="size-4" aria-hidden="true" />Reload</button>{post ? <span className="text-xs text-slate-500">Published {formatFreeTipDate(post.published_at)}</span> : null}</div>
      <p className="rounded-xl border border-orange-300/15 bg-orange-400/[0.05] px-4 py-3 text-xs leading-5 text-slate-400">Public notice: Free Tips are informational only. No result, win, or profit is guaranteed.</p>
    </div>}
  </section>;
}
