import HowItWorks from "@/components/HowItWorks";
import SocialContactPanel from "@/components/SocialContactPanel";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { getMembershipPath, PROOF_SECTION_ID } from "@/lib/membership";
import { supabase } from "@/lib/supabase";
import { DAILY_PHOTO_EMPTY_STATE } from "@/lib/dailyMedia";
import { PUBLIC_NAV_ITEMS } from "@/lib/navigation";
import { ArrowRight, CalendarDays, Check, CirclePlay, ImageIcon, LockKeyhole, Menu, Play, Sparkles, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

const MEMBER_BENEFITS = ["Focused daily updates", "A disciplined member flow", "Clear access pathway"];
const PLATFORM_LOGO_URL = "/assets/singapore-pools-4d6d-logo_aa58b28a.png";
const PROOF_MEDIA_URL = "/assets/proof-media_40227d60.mp4";
const SUPPORTING_LOGOS = [
  { src: "/assets/magnum-logo_29ab8008.png", alt: "Magnum logo", className: "-rotate-3" },
  { src: "/assets/toto-style-mark_9f47c151.png", alt: "TOTO-style red and gold mark", className: "translate-y-2 rotate-2" },
  { src: "/assets/nine-lotto-mark-clean_647d2236.png", alt: "Nine Lotto logo mark", className: "rotate-3" },
];

export default function Home() {
  const { isAuthenticated, loading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [proofPlaying, setProofPlaying] = useState(false);
  const [dailyPhotoUrl, setDailyPhotoUrl] = useState<string | null>(null);
  const proofVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let active = true;
    void supabase.rpc("get_daily_photo").then(({ data }) => {
      const value = data as { url?: string } | null;
      if (active) setDailyPhotoUrl(value?.url ?? null);
    });
    return () => { active = false; };
  }, []);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const goToMembership = () => setLocation(getMembershipPath());

  const showProof = () => {
    document.getElementById(PROOF_SECTION_ID)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const toggleProofVideo = () => {
    const video = proofVideoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  };

  const handleSignIn = () => {
    if (isAuthenticated) {
      setLocation("/account");
      return;
    }
    setLocation("/auth");
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
          aria-label="Return to the beginning of the SINGAPORE POOLS 4D6D landing page"
        >
          SINGAPORE POOLS 4D6D<span className="text-[#ff6b00]">.</span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Public navigation">
          {PUBLIC_NAV_ITEMS.slice(0, 5).map((item) => <button key={item.path} type="button" onClick={() => setLocation(item.path)} className="soft-button rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8a3d]">{item.label}</button>)}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <button type="button" onClick={handleSignIn} className="soft-button inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-500/45 bg-slate-950/20 px-3 py-2 text-sm font-bold text-slate-100 hover:border-orange-300/60 hover:bg-slate-900/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d] sm:px-4"><UserRound className="size-4" aria-hidden="true" /><span>{loading ? "Loading" : isAuthenticated ? "My Account" : "Sign In"}</span></button>
          <button type="button" onClick={goToMembership} className="soft-button orange-glow inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#ff6b00] px-3 py-2 text-sm font-extrabold text-[#1c0b00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70] sm:px-4"><span className="hidden sm:inline">Get Started</span><ArrowRight className="size-4" aria-hidden="true" /></button>
          <button type="button" onClick={() => setMobileNavOpen((open) => !open)} className="soft-button grid size-10 place-items-center rounded-xl border border-slate-500/45 bg-slate-950/20 text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d] lg:hidden" aria-expanded={mobileNavOpen} aria-controls="home-mobile-navigation" aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}>{mobileNavOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}</button>
        </div>
        {mobileNavOpen ? <div id="home-mobile-navigation" className="panel-border absolute inset-x-5 top-[4.8rem] grid gap-1 rounded-2xl bg-[#0c1425]/98 p-3 shadow-2xl backdrop-blur-xl sm:inset-x-8 lg:hidden">{PUBLIC_NAV_ITEMS.map((item) => <button key={item.path} type="button" onClick={() => { setMobileNavOpen(false); setLocation(item.path); }} className="soft-button rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-orange-400/10 hover:text-orange-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8a3d]">{item.label}</button>)}</div> : null}
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-5.5rem)] max-w-7xl place-items-center px-5 pb-16 pt-18 text-center sm:px-8 sm:pb-20 sm:pt-24 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-24 hidden h-40 sm:block" aria-hidden="true">
          <div className="relative mx-auto h-full max-w-6xl">
            <div className="absolute left-6 top-3 grid size-20 place-items-center rounded-2xl border border-pink-300/25 bg-[#0a1120]/80 p-3 shadow-[0_14px_35px_rgba(236,72,153,0.16)] backdrop-blur-xl lg:left-16">
              <img src={SUPPORTING_LOGOS[0].src} alt="" width={200} height={148} loading="lazy" decoding="async" className={`max-h-full max-w-full object-contain ${SUPPORTING_LOGOS[0].className}`} />
            </div>
            <div className="absolute right-8 top-12 grid size-20 place-items-center rounded-full border border-red-300/25 bg-[#0a1120]/80 p-2.5 shadow-[0_14px_35px_rgba(239,68,68,0.16)] backdrop-blur-xl lg:right-24">
              <img src={SUPPORTING_LOGOS[1].src} alt="" width={225} height={225} loading="lazy" decoding="async" className={`size-full rounded-full object-contain ${SUPPORTING_LOGOS[1].className}`} />
            </div>
            <div className="absolute bottom-0 left-[31%] grid size-16 place-items-center rounded-2xl border border-orange-300/25 bg-[#0a1120]/80 p-2 shadow-[0_14px_35px_rgba(249,115,22,0.16)] backdrop-blur-xl">
              <img src={SUPPORTING_LOGOS[2].src} alt="" width={1920} height={1920} loading="lazy" decoding="async" className={`size-full object-contain ${SUPPORTING_LOGOS[2].className}`} />
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-4xl">
          <div className="mx-auto mb-5 flex flex-col items-center gap-3 sm:mb-8 sm:gap-4">
            <div className="rounded-[1.65rem] border border-orange-300/35 bg-[#0a1120]/80 p-2 shadow-[0_0_0_8px_rgba(255,107,0,0.05),0_18px_42px_rgba(0,0,0,0.3)] backdrop-blur-xl">
              <img src={PLATFORM_LOGO_URL} alt="SINGAPORE POOLS 4D6D 4D and TOTO logo" width={225} height={225} fetchPriority="high" decoding="async" className="size-24 rounded-2xl object-cover sm:size-28" />
            </div>
            <div className="flex items-center justify-center gap-2 sm:hidden" role="group" aria-label="Additional lottery brand marks">
              {SUPPORTING_LOGOS.map((logo) => <span key={logo.src} className="grid size-12 place-items-center rounded-xl border border-white/10 bg-[#0a1120]/80 p-1.5 shadow-lg backdrop-blur-xl"><img src={logo.src} alt={logo.alt} width={225} height={225} loading="lazy" decoding="async" className={`size-full object-contain ${logo.className}`} /></span>)}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/8 px-3.5 py-2 text-[0.68rem] font-extrabold tracking-[0.16em] text-orange-200 uppercase backdrop-blur-sm">
            <Sparkles className="size-3.5 text-[#ff8b3d]" aria-hidden="true" />
              Private membership experience
            </div>
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

      <HowItWorks />

      <section id={PROOF_SECTION_ID} tabIndex={-1} className="relative mx-auto max-w-6xl scroll-mt-8 pb-12 outline-none sm:pb-16">
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="panel-border overflow-hidden rounded-[1.65rem] bg-[#0a1120]/84 p-2 backdrop-blur-xl sm:rounded-[2rem] sm:p-3">
          <div className="relative grid min-h-[21rem] overflow-hidden rounded-[1.25rem] border border-white/8 bg-[#070c16] sm:min-h-[28rem] sm:rounded-[1.45rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,0,0.16),transparent_12rem),radial-gradient(circle_at_52%_38%,rgba(51,117,214,0.23),transparent_20rem),linear-gradient(135deg,#050811_0%,#101a30_52%,#060a12_100%)]" />
            <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(126,160,217,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(126,160,217,0.13)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
            <video
              ref={proofVideoRef}
              controls
              playsInline
              preload="metadata"
              poster={PLATFORM_LOGO_URL}
              onPlay={() => setProofPlaying(true)}
              onPause={() => setProofPlaying(false)}
              className="absolute inset-0 size-full bg-black/30 object-contain"
              aria-label="SINGAPORE POOLS 4D6D proof media video"
            >
              <source src={PROOF_MEDIA_URL} type="video/mp4" />
              Your browser does not support the proof media video. Please use the playback controls or try a modern browser.
            </video>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050914]/90 via-transparent to-[#050914]/25" />
            <div className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full border border-slate-500/25 bg-[#08101e]/75 px-3 py-1.5 text-xs font-bold text-slate-300 backdrop-blur sm:left-8 sm:top-8">
              <span className="size-2 rounded-full bg-[#ff6b00] shadow-[0_0_12px_#ff6b00]" />
              PROOF MEDIA
            </div>
            <div className="relative z-10 m-auto flex max-w-sm flex-col items-center px-6 pt-8 text-center">
              <button
                type="button"
                onClick={toggleProofVideo}
                aria-pressed={proofPlaying}
                aria-label={proofPlaying ? "Pause proof media video" : "Play proof media video"}
                className="soft-button relative grid size-20 place-items-center rounded-full border border-orange-200/50 bg-[#ff6b00] text-[#1c0b00] shadow-[0_0_0_15px_rgba(255,107,0,0.08),0_16px_45px_rgba(255,107,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-6 focus-visible:outline-[#ffad70] sm:size-22"
              >
                <span className="pulse-ring absolute inset-0 rounded-full border border-orange-300/75" />
                {proofPlaying ? <span className="flex gap-1" aria-hidden="true"><span className="h-7 w-2 rounded-sm bg-current" /><span className="h-7 w-2 rounded-sm bg-current" /></span> : <Play className="ml-1 size-7 fill-current" aria-hidden="true" />}
              </button>
              <h2 className="font-display mt-7 text-2xl font-extrabold tracking-[-0.04em] text-white sm:text-3xl">See the process in action.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">{proofPlaying ? "Proof media is playing. Use the player controls to pause or review." : "Watch the supplied proof media before choosing your membership path."}</p>
            </div>
            <div className="absolute bottom-5 left-6 z-10 text-xs font-semibold tracking-[0.1em] text-slate-300/80 uppercase sm:bottom-7 sm:left-8">SINGAPORE POOLS 4D6D • Member proof</div>
          </div>
          </div>

          <aside aria-labelledby="daily-photo-title" className="panel-border flex min-h-[21rem] flex-col overflow-hidden rounded-[1.65rem] bg-[#0a1120]/84 p-2 backdrop-blur-xl sm:min-h-[28rem] sm:rounded-[2rem] sm:p-3">
            <div className="relative flex flex-1 flex-col overflow-hidden rounded-[1.25rem] border border-white/8 bg-[#070c16] p-6 sm:rounded-[1.45rem] sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,107,0,0.14),transparent_12rem),linear-gradient(145deg,#101a30_0%,#070c16_70%)]" />
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-500/25 bg-[#08101e]/75 px-3 py-1.5 text-xs font-bold text-slate-300 backdrop-blur">
                  <span className="size-2 rounded-full bg-[#ff6b00] shadow-[0_0_12px_#ff6b00]" />
                  DAILY PHOTO
                </div>
                <CalendarDays className="size-5 text-orange-300" aria-hidden="true" />
              </div>
              <div className="relative z-10 m-auto w-full text-center">
                {dailyPhotoUrl ? <img src={dailyPhotoUrl} alt="Today’s SINGAPORE POOLS 4D6D daily photo" className="mx-auto max-h-56 w-full rounded-2xl border border-white/10 object-cover shadow-2xl sm:max-h-64" /> : <div className="mx-auto grid size-20 place-items-center rounded-2xl border border-dashed border-orange-300/35 bg-orange-400/[0.07] text-orange-200 shadow-[0_0_0_10px_rgba(255,107,0,0.04)] sm:size-24"><ImageIcon className="size-9 sm:size-10" aria-hidden="true" /></div>}
                <h2 id="daily-photo-title" className="font-display mt-6 text-2xl font-extrabold tracking-[-0.04em] text-white">{DAILY_PHOTO_EMPTY_STATE.title}</h2>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-300">{dailyPhotoUrl ? "Today’s photo is now published. Check back tomorrow for the next daily update." : DAILY_PHOTO_EMPTY_STATE.description}</p>
                {!dailyPhotoUrl ? <div className="mt-6 inline-flex items-center rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-slate-400">{DAILY_PHOTO_EMPTY_STATE.badge}</div> : null}
              </div>
              <p className="relative z-10 mt-6 text-xs font-semibold tracking-[0.1em] text-slate-500 uppercase">SINGAPORE POOLS 4D6D • Daily update</p>
            </div>
          </aside>
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

      <SocialContactPanel />

      <footer className="relative border-t border-slate-700/40 bg-[#050914]/45 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-5 text-sm leading-6 text-slate-400 sm:grid-cols-[auto_1fr] sm:gap-8"><p className="font-display font-bold tracking-[-0.03em] text-slate-200">SINGAPORE POOLS 4D6D<span className="text-[#ff6b00]">.</span></p><div className="sm:justify-self-end sm:text-right"><p className="max-w-3xl"><strong className="font-bold text-slate-200">Responsible use:</strong> Membership content is informational only. Outcomes are not guaranteed, past results do not predict future results, and you should participate only within your own limits.</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-500 sm:justify-end">{PUBLIC_NAV_ITEMS.slice(5).map((item) => <button type="button" key={item.path} onClick={() => setLocation(item.path)} className="soft-button hover:text-orange-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8a3d]">{item.label}</button>)}</div></div></div>
      </footer>
    </main>
  );
}
