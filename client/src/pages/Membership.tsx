import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, ArrowRight, Check, LockKeyhole } from "lucide-react";
import { useLocation } from "wouter";

export default function Membership() {
  const { isAuthenticated, loading, user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <main className="site-shell flex min-h-screen items-center px-5 py-8 sm:px-8">
      <section className="panel-border relative mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] bg-[#0c1425]/88 p-6 backdrop-blur-xl sm:p-10">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#ff6b00]/12 blur-3xl" />
        <button
          type="button"
          onClick={() => setLocation("/")}
          className="soft-button relative inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to home
        </button>

        <div className="relative mt-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-xs font-bold tracking-[0.14em] text-orange-300 uppercase">
            <LockKeyhole className="size-3.5" aria-hidden="true" />
            Membership access
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Your next step starts here.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            Sign in to continue to the membership experience. Account access is required before membership details and available next steps can be shown.
          </p>
        </div>

        <div className="relative mt-9 rounded-2xl border border-slate-700/70 bg-slate-950/35 p-5 sm:p-6">
          {loading ? (
            <p className="text-sm text-slate-300">Checking your account status…</p>
          ) : isAuthenticated ? (
            <div>
              <p className="text-sm font-bold text-white">You are signed in{user?.name ? ` as ${user.name}` : ""}.</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Your membership status will appear here when membership management is configured.</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-white">Sign in to continue.</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Use the secure account flow to access the next stage of membership.</p>
              <button
                type="button"
                onClick={() => startLogin()}
                className="soft-button orange-glow mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-[#1c0b00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70]"
              >
                Sign In to Continue
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div className="relative mt-6 flex gap-3 text-sm leading-6 text-slate-400">
          <Check className="mt-1 size-4 shrink-0 text-orange-400" aria-hidden="true" />
          <p>Membership content is informational only. Outcomes are not guaranteed, and past results do not predict future results.</p>
        </div>
      </section>
    </main>
  );
}
