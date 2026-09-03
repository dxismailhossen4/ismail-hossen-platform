import { BadgeCheck, CalendarClock, Clock3, ExternalLink, RefreshCw, Search, UsersRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type MembershipStatus = "inactive" | "pending" | "active" | "expired";
type Filter = "all" | MembershipStatus;

type MembershipRow = {
  id: string;
  user_id: string;
  status: MembershipStatus;
  starts_at: string | null;
  expires_at: string | null;
  updated_at: string;
  plan_id: string | null;
};

function membershipStatusLabel(status: MembershipStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusClass(status: MembershipStatus) {
  if (status === "active") return "border-emerald-300/25 bg-emerald-400/10 text-emerald-200";
  if (status === "expired") return "border-red-300/25 bg-red-400/10 text-red-200";
  if (status === "pending") return "border-orange-300/25 bg-orange-400/10 text-orange-200";
  return "border-slate-500/30 bg-slate-400/10 text-slate-300";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function shortId(value: string) {
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

export default function MembershipApprovalDashboard() {
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMemberships = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase.from("memberships").select("id, user_id, status, starts_at, expires_at, updated_at, plan_id").order("updated_at", { ascending: false });
    if (fetchError) setError(fetchError.message);
    else setMemberships((data as MembershipRow[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void loadMemberships(); }, [loadMemberships]);

  const counts = useMemo(() => ({
    all: memberships.length,
    active: memberships.filter((membership) => membership.status === "active" && (!membership.expires_at || new Date(membership.expires_at) > new Date())).length,
    pending: memberships.filter((membership) => membership.status === "pending").length,
    expired: memberships.filter((membership) => membership.status === "expired" || (membership.expires_at ? new Date(membership.expires_at) <= new Date() : false)).length,
    inactive: memberships.filter((membership) => membership.status === "inactive").length,
  }), [memberships]);

  const visibleMemberships = useMemo(() => {
    const term = search.trim().toLowerCase();
    return memberships.filter((membership) => (filter === "all" || membership.status === filter) && (!term || membership.user_id.toLowerCase().includes(term) || membership.id.toLowerCase().includes(term)));
  }, [filter, memberships, search]);

  const metricCards = [
    { label: "Active members", value: counts.active, Icon: BadgeCheck, target: "active" as Filter },
    { label: "Pending access", value: counts.pending, Icon: Clock3, target: "pending" as Filter },
    { label: "Expired access", value: counts.expired, Icon: CalendarClock, target: "expired" as Filter },
    { label: "All membership records", value: counts.all, Icon: UsersRound, target: "all" as Filter },
  ];

  return (
    <section className="mt-8 space-y-6" aria-label="Membership approval dashboard">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ label, value, Icon, target }) => (
          <button key={label} type="button" onClick={() => setFilter(target)} className="panel-border rounded-2xl bg-[#0b1323]/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-300/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d]">
            <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span><Icon className="size-4 text-orange-300" aria-hidden="true" /></div>
            <p className="mt-3 font-display text-3xl font-extrabold text-white">{value}</p>
          </button>
        ))}
      </div>

      <div className="panel-border rounded-2xl bg-[#0b1323]/80 p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><p className="text-sm font-bold text-white">Membership access overview</p><p className="mt-1 text-sm leading-6 text-slate-400">Use Payment verification to approve new access; this page tracks the resulting member state and expiry.</p></div><div className="flex flex-wrap gap-2"><a href="/admin/payments" className="soft-button inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-3 text-sm font-extrabold text-[#1c0b00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70]">Review payments <ExternalLink className="size-4" aria-hidden="true" /></a><button type="button" onClick={() => void loadMemberships()} disabled={loading} className="soft-button inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-700/65 bg-slate-950/30 px-3 text-sm font-bold text-slate-200 hover:border-orange-300/50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d]"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh</button></div></div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="relative block"><span className="sr-only">Search memberships</span><Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-slate-500" aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user ID or membership ID" className="min-h-11 w-full rounded-xl border border-slate-700/70 bg-slate-950/35 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-300/70" /></label>
          <div className="flex flex-wrap gap-2" aria-label="Membership status filters">{(["all", "active", "pending", "expired", "inactive"] as Filter[]).map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`min-h-10 rounded-xl border px-3 text-xs font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8a3d] ${filter === item ? "border-orange-300/60 bg-orange-400/15 text-orange-100" : "border-slate-700/70 text-slate-400 hover:text-white"}`}>{item === "all" ? `All (${counts.all})` : `${membershipStatusLabel(item)} (${counts[item]})`}</button>)}</div>
        </div>
      </div>

      {error ? <p role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">{error}</p> : null}
      {loading ? <div className="rounded-2xl border border-slate-700/60 bg-slate-950/20 p-6 text-sm text-slate-400">Loading membership records…</div> : visibleMemberships.length === 0 ? <div className="rounded-2xl border border-slate-700/60 bg-slate-950/20 p-6 text-sm leading-6 text-slate-400">No membership records match this filter. Approved payments will appear here after activation.</div> : <div className="space-y-3">{visibleMemberships.map((membership) => <article key={membership.id} className="panel-border rounded-2xl bg-[#0b1323]/80 p-5"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(membership.status)}`}>{membershipStatusLabel(membership.status)}</span><span className="text-xs text-slate-500">Updated {formatDate(membership.updated_at)}</span></div><p className="mt-3 text-sm font-bold text-white">User <span className="font-mono text-slate-300">{shortId(membership.user_id)}</span></p><p className="mt-1 text-xs text-slate-500">Membership <span className="font-mono">{shortId(membership.id)}</span></p></div><div className="grid grid-cols-2 gap-5 text-right text-sm"><div><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Starts</p><p className="mt-1 text-slate-300">{formatDate(membership.starts_at)}</p></div><div><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Expires</p><p className="mt-1 font-bold text-white">{formatDate(membership.expires_at)}</p></div></div></div></article>)}</div>}
    </section>
  );
}
