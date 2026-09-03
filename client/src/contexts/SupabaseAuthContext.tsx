import { formatMembershipStatus, type MembershipRecord, type PaymentRecord } from "@/lib/dashboard";
import { livePaymentNotice } from "@/lib/accessRules";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Profile = { id: string; full_name: string | null; phone: string | null; role: "user" | "admin"; created_at: string | null };
type AuthResult = { error?: string; needsEmailConfirmation?: boolean };
export type LiveStatusNotice = { id: string; tone: "success" | "warning" | "info"; title: string; description: string };
type SupabaseAuthContextValue = { session: Session | null; user: User | null; profile: Profile | null; membership: MembershipRecord | null; payments: PaymentRecord[]; loading: boolean; dashboardLoading: boolean; isAuthenticated: boolean; membershipLabel: string; liveNotice: LiveStatusNotice | null; clearLiveNotice: () => void; signIn: (email: string, password: string) => Promise<AuthResult>; signUp: (fullName: string, email: string, password: string) => Promise<AuthResult>; signOut: () => Promise<void>; refreshDashboard: () => Promise<void> };
const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [membership, setMembership] = useState<MembershipRecord | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [liveNotice, setLiveNotice] = useState<LiveStatusNotice | null>(null);
  const clearDashboard = useCallback(() => { setProfile(null); setMembership(null); setPayments([]); setLiveNotice(null); }, []);
  const clearLiveNotice = useCallback(() => setLiveNotice(null), []);
  const refreshDashboard = useCallback(async () => {
    const currentUser = session?.user;
    if (!currentUser) { clearDashboard(); return; }
    setDashboardLoading(true);
    const [profileResult, membershipResult, paymentsResult] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, role, created_at").eq("id", currentUser.id).maybeSingle(),
      supabase.from("memberships").select("id, status, starts_at, expires_at").eq("user_id", currentUser.id).maybeSingle(),
      supabase.from("payments").select("id, amount, currency, payment_method, status, submitted_date, created_at, admin_note, payment_proof_key, payment_proof_filename, payment_proof_content_type").eq("user_id", currentUser.id).order("created_at", { ascending: false }),
    ]);
    setProfile((profileResult.data as Profile | null) ?? null);
    setMembership((membershipResult.data as MembershipRecord | null) ?? null);
    setPayments((paymentsResult.data as PaymentRecord[] | null) ?? []);
    setDashboardLoading(false);
  }, [clearDashboard, session?.user]);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session: nextSession } }) => { if (!mounted) return; setSession(nextSession); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setLoading(false); if (!nextSession) clearDashboard(); });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [clearDashboard]);
  useEffect(() => { if (session?.user) void refreshDashboard(); }, [refreshDashboard, session?.user]);
  useEffect(() => {
    const currentUser = session?.user;
    if (!currentUser) return;
    const channel = supabase.channel(`member-status-${currentUser.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "payments", filter: `user_id=eq.${currentUser.id}` }, (payload) => {
        const status = (payload.new as { status?: string }).status;
        const notice = status ? livePaymentNotice(status, `payment-${(payload.new as { id?: string }).id ?? Date.now()}`) : null;
        if (notice) setLiveNotice(notice);
        void refreshDashboard();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "memberships", filter: `user_id=eq.${currentUser.id}` }, (payload) => {
        const status = (payload.new as { status?: string }).status;
        if (status === "active") setLiveNotice({ id: `membership-${(payload.new as { id?: string }).id ?? Date.now()}`, tone: "success", title: "VIP access is active", description: "Your membership dashboard has been updated with the latest access status." });
        void refreshDashboard();
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [refreshDashboard, session?.user]);
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => { const { error } = await supabase.auth.signInWithPassword({ email, password }); return error ? { error: error.message } : {}; }, []);
  const signUp = useCallback(async (fullName: string, email: string, password: string): Promise<AuthResult> => { const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } }); if (error) return { error: error.message }; return { needsEmailConfirmation: !data.session }; }, []);
  const signOut = useCallback(async () => { await supabase.auth.signOut(); clearDashboard(); }, [clearDashboard]);
  const value = useMemo<SupabaseAuthContextValue>(() => ({ session, user: session?.user ?? null, profile, membership, payments, loading, dashboardLoading, isAuthenticated: Boolean(session?.user), membershipLabel: formatMembershipStatus(membership), liveNotice, clearLiveNotice, signIn, signUp, signOut, refreshDashboard }), [clearLiveNotice, dashboardLoading, liveNotice, loading, membership, payments, profile, refreshDashboard, session, signIn, signOut, signUp]);
  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

export function useSupabaseAuth() { const context = useContext(SupabaseAuthContext); if (!context) throw new Error("useSupabaseAuth must be used inside SupabaseAuthProvider"); return context; }
