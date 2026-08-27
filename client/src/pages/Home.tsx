import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { getMembershipPath, PROOF_SECTION_ID } from "@/lib/membership";
import { ArrowRight, Check, CirclePlay, LockKeyhole, Play, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const MEMBER_BENEFITS = ["Focused daily updates", "A disciplined member flow", "Clear access pathway"];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [proofActivated, setProofActivated] = useState(false);

  const goToMembership = () => setLocation(getMembershipPath());

  const showProof = () => {
    document.getElementById(PROOF_SECTION_ID)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setProofActivated(true);
  };

  const handleSignIn = () => {
    if (isAuthenticated) {
      goToMembership();
      return;
    }
    startLogin();
  };

  return (
    <main className="site-shell relative">
      <div className="orb float-slow -right-28 top-28 h-80 w-80 bg-blue-600/20 blur-3xl" />
      <div className="orb left-[-8rem] top-[30rem] h-80 w-80 bg-orange-600/12 blur-3xl" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7 lg:px-10">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-display text-lg font-extrabold tracking-[-0.04em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d] sm:text-xl"
          aria-label="Return to the beginning of the Ismail Hossen landing page"
        >
          Ismail Hossen<span className="text-[#ff6b00]">.</span>
        </button>

        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Primary navigation">
          <button
            type="button"
            onClick={handleSignIn}
            className="soft-button inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-500/45 bg-slate-950/20 px-3 py-2 text-sm font-bold text-slate-100 hover:border-orange-300/60 hover:bg-slate-900/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d] sm:px-4"
          >
            <UserRound className="size-4" aria-hidden="true" />
            <span>{loading ? "Loading" : "Sign In"}</span>
          </button>
          <button
            type="button"
            onClick={goToMembership}
            className="soft-button orange-glow inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#ff6b00] px-3 py-2 text-sm font-extrabold text-[#1c0b00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70] sm:px-4"
          >
            <span className="hidden sm:inline">Get Started</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </nav>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-5.5rem)] max-w-7xl place-items-center px-5 pb-16 pt-18 text-center sm:px-8 sm:pb-20 sm:pt-24 lg:px-10">
        <div className="relative max-w-4xl">
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/8 px-3.5 py-2 text-[0.68rem] font-extrabold tracking-[0.16em] text-orange-200 uppercase backdrop-blur-sm sm:mb-9">
            <Sparkles className="size-3.5 text-[#ff8b3d]" aria-hidden="true" />
            Private membership experience
          </div>

          <h1 className="font-display text-balance text-5xl font-extrabold tracking-[-0.065em] text-white sm:text-6xl md:text-7xl lg:text-[5.35rem] lg:leading-[0.98]">
            1st Direct Win <span className="text-[#ff6b00]">1000%</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-7 text-slate-300 sm:mt-8 sm:text-lg sm:leading-8">
            Join our platform for top-tier predictions and daily updates. A focused membership experience built around a disciplined process and transparent proof media.
          </p>

          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={goToMembership}
              className="soft-button orange-glow inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#ff6b00] px-6 py-4 text-[0.95rem] font-extrabold text-[#1c0b00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70]"
            >
              Start Your Membership
              <ArrowRight className="size-4.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showProof}
              className="soft-button inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-slate-500/45 bg-slate-950/25 px-6 py-4 text-[0.95rem] font-bold text-slate-100 hover:border-orange-300/60 hover:bg-slate-900/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d]"
            >
              <CirclePlay className="size-[1.1rem] text-orange-400" aria-hidden="true" />
              Watch Proof
            </button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-slate-400 sm:mt-12">
            {MEMBER_BENEFITS.map((benefit) => (
              <span key={benefit} className="inline-flex items-center gap-2">
                <Check className="size-4 text-orange-400" aria-hidden="true" />
                {benefit}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id={PROOF_SECTION_ID} tabIndex={-1} className="relative mx-auto max-w-6xl scroll-mt-8 px-5 pb-12 outline-none sm:px-8 sm:pb-16 lg:px-10">
        <div className="panel-border overflow-hidden rounded-[1.65rem] bg-[#0a1120]/84 p-2 backdrop-blur-xl sm:rounded-[2rem] sm:p-3">
          <div className="relative grid min-h-[21rem] overflow-hidden rounded-[1.25rem] border border-white/8 bg-[#070c16] sm:min-h-[28rem] sm:rounded-[1.45rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,0,0.16),transparent_12rem),radial-gradient(circle_at_52%_38%,rgba(51,117,214,0.23),transparent_20rem),linear-gradient(135deg,#050811_0%,#101a30_52%,#060a12_100%)]" />
            <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(126,160,217,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(126,160,217,0.13)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
            <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-slate-500/25 bg-[#08101e]/75 px-3 py-1.5 text-xs font-bold text-slate-300 backdrop-blur sm:left-8 sm:top-8">
              <span className="size-2 rounded-full bg-[#ff6b00] shadow-[0_0_12px_#ff6b00]" />
              PROOF MEDIA
            </div>
            <div className="relative z-10 m-auto flex max-w-sm flex-col items-center px-6 text-center">
              <button
                type="button"
                onClick={() => setProofActivated((active) => !active)}
                aria-pressed={proofActivated}
                aria-label={proofActivated ? "Hide proof media placeholder status" : "Show proof media placeholder status"}
                className="soft-button relative grid size-20 place-items-center rounded-full border border-orange-200/50 bg-[#ff6b00] text-[#1c0b00] shadow-[0_0_0_15px_rgba(255,107,0,0.08),0_16px_45px_rgba(255,107,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-6 focus-visible:outline-[#ffad70] sm:size-22"
              >
                <span className="pulse-ring absolute inset-0 rounded-full border border-orange-300/75" />
                <Play className="ml-1 size-7 fill-current" aria-hidden="true" />
              </button>
              <h2 className="font-display mt-7 text-2xl font-extrabold tracking-[-0.04em] text-white sm:text-3xl">See the process in action.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                {proofActivated ? "Proof video placeholder activated. Add the final promotional video to publish this media." : "A dedicated space for your verified promotional proof video."}
              </p>
            </div>
            <div className="absolute bottom-5 left-6 text-xs font-semibold tracking-[0.1em] text-slate-500 uppercase sm:bottom-7 sm:left-8">Ismail Hossen • Member proof</div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-5 pb-12 sm:px-8 sm:pb-16 lg:px-10">
        <div className="grid gap-6 rounded-[1.5rem] border border-orange-300/12 bg-orange-400/[0.055] px-6 py-7 text-left sm:grid-cols-[1fr_auto] sm:items-center sm:px-8 sm:py-8">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-bold text-orange-300"><LockKeyhole className="size-4" aria-hidden="true" /> Member access</div>
            <h2 className="font-display mt-2 text-2xl font-extrabold tracking-[-0.04em] text-white">Ready to enter the membership flow?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Use your account to continue through the available membership steps.</p>
          </div>
          <button type="button" onClick={goToMembership} className="soft-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#101829] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            Continue
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      <footer className="relative border-t border-slate-700/40 bg-[#050914]/45 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-4 text-sm leading-6 text-slate-400 sm:grid-cols-[auto_1fr] sm:gap-8">
          <p className="font-display font-bold tracking-[-0.03em] text-slate-200">Ismail Hossen<span className="text-[#ff6b00]">.</span></p>
          <p className="max-w-3xl sm:justify-self-end sm:text-right"><strong className="font-bold text-slate-200">Responsible use:</strong> Membership content is informational only. Outcomes are not guaranteed, past results do not predict future results, and you should participate only within your own limits.</p>
        </div>
      </footer>
    </main>
  );
}
