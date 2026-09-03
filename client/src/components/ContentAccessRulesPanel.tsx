import { LockKeyhole, RefreshCw, Save, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { accessTierLabel, type AccessTier } from "@/lib/accessRules";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";

type Rule = { id: string; content_key: string; label: string; minimum_tier: AccessTier; description: string | null; is_active: boolean };
const tiers: AccessTier[] = ["free", "member", "vip"];

export default function ContentAccessRulesPanel() {
  const { user } = useSupabaseAuth();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadRules = useCallback(async () => {
    setLoading(true); setError(null);
    const { data, error: loadError } = await supabase.from("content_access_rules").select("id, content_key, label, minimum_tier, description, is_active").order("minimum_tier").order("label");
    if (loadError) setError(loadError.message); else setRules((data as Rule[] | null) ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { void loadRules(); }, [loadRules]);
  const saveRule = async (rule: Rule, minimumTier: AccessTier, isActive = rule.is_active) => {
    if (!user) return;
    setSavingKey(rule.content_key); setMessage(null); setError(null);
    const { error: saveError } = await supabase.from("content_access_rules").update({ minimum_tier: minimumTier, is_active: isActive, updated_by: user.id, updated_at: new Date().toISOString() }).eq("id", rule.id);
    if (saveError) setError(saveError.message); else { setRules((current) => current.map((item) => item.id === rule.id ? { ...item, minimum_tier: minimumTier, is_active: isActive } : item)); setMessage(`${rule.label} access updated to ${accessTierLabel(minimumTier)}.`); }
    setSavingKey(null);
  };
  return <section className="mt-8 panel-border rounded-2xl bg-[#0b1323]/80 p-5 sm:p-6" aria-label="Content access rules"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><ShieldCheck className="size-5 text-orange-300" aria-hidden="true" /><h2 className="font-display text-xl font-extrabold text-white">Content access rules</h2></div><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Choose the minimum tier for each content category. These rules are stored in Supabase and enforced separately from the visual labels.</p></div><button type="button" onClick={() => void loadRules()} disabled={loading} className="soft-button inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-700/65 px-3 text-sm font-bold text-slate-200 hover:border-orange-300/50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8a3d]"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh rules</button></div>{error ? <p role="alert" className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}{message ? <p role="status" className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-400/[0.07] px-4 py-3 text-sm text-emerald-100">{message}</p> : null}{loading ? <p className="mt-6 text-sm text-slate-400">Loading access rules…</p> : rules.length === 0 ? <div className="mt-6 rounded-xl border border-slate-700/60 p-5 text-sm text-slate-400">No access rules are configured yet.</div> : <div className="mt-6 space-y-3">{rules.map((rule) => <article key={rule.id} className="rounded-2xl border border-slate-700/60 bg-slate-950/25 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" /><div><p className="text-sm font-extrabold text-white">{rule.label}</p><p className="mt-1 text-sm leading-6 text-slate-400">{rule.description ?? "No description provided."}</p><p className="mt-1 font-mono text-[11px] text-slate-600">{rule.content_key}</p></div></div><div className="flex flex-wrap items-center gap-2">{tiers.map((tier) => <button key={tier} type="button" onClick={() => void saveRule(rule, tier)} disabled={savingKey === rule.content_key} className={`min-h-10 rounded-xl border px-3 text-xs font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8a3d] ${rule.minimum_tier === tier ? "border-orange-300/60 bg-orange-400/15 text-orange-100" : "border-slate-700/70 text-slate-400 hover:text-white"}`}>{accessTierLabel(tier)}</button>)}<button type="button" onClick={() => void saveRule(rule, rule.minimum_tier, !rule.is_active)} disabled={savingKey === rule.content_key} className="soft-button inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-700/70 px-3 text-xs font-bold text-slate-300 hover:border-orange-300/50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8a3d]"><Save className="size-3.5" aria-hidden="true" />{rule.is_active ? "Enabled" : "Disabled"}</button></div></div></article>)}</div>}</section>;
}
