import SocialContactPanel from "@/components/SocialContactPanel";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { FOOTER_NAV_ITEMS, PUBLIC_NAV_ITEMS } from "@/lib/navigation";
import { ArrowRight, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (path: string) => {
    setMenuOpen(false);
    setLocation(path);
  };

  const handleAccount = () => {
    if (isAuthenticated) {
      goTo("/account");
      return;
    }
    setLocation("/auth");
  };

  return (
    <div className="site-shell relative">
      <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7 lg:px-10">
        <button
          type="button"
          onClick={() => goTo("/")}
          className="font-display text-lg font-extrabold tracking-[-0.04em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d] sm:text-xl"
          aria-label="Go to Ismail Hossen home"
        >
          Ismail Hossen<span className="text-[#ff6b00]">.</span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Public navigation">
          {PUBLIC_NAV_ITEMS.slice(0, 5).map((item) => (
            <button key={item.path} type="button" onClick={() => goTo(item.path)} className="soft-button rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8a3d]">
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button type="button" onClick={handleAccount} className="soft-button inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-500/45 bg-slate-950/20 px-3 py-2 text-sm font-bold text-slate-100 hover:border-orange-300/60 hover:bg-slate-900/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d] sm:px-4">
            <UserRound className="size-4" aria-hidden="true" />
            <span>{loading ? "Loading" : isAuthenticated ? "My Account" : "Sign In"}</span>
          </button>
          <button type="button" onClick={() => goTo("/membership")} className="soft-button orange-glow hidden min-h-10 items-center gap-2 rounded-xl bg-[#ff6b00] px-4 py-2 text-sm font-extrabold text-[#1c0b00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70] sm:inline-flex">
            Get Started <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="soft-button grid size-10 place-items-center rounded-xl border border-slate-500/45 bg-slate-950/20 text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d] lg:hidden" aria-expanded={menuOpen} aria-controls="public-mobile-navigation" aria-label={menuOpen ? "Close navigation" : "Open navigation"}>
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>

        {menuOpen ? (
          <div id="public-mobile-navigation" className="panel-border absolute inset-x-5 top-[4.8rem] grid gap-1 rounded-2xl bg-[#0c1425]/98 p-3 shadow-2xl backdrop-blur-xl sm:inset-x-8 lg:hidden">
            {PUBLIC_NAV_ITEMS.map((item) => (
              <button key={item.path} type="button" onClick={() => goTo(item.path)} className="soft-button rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-orange-400/10 hover:text-orange-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8a3d]">
                {item.label}
              </button>
            ))}
            <button type="button" onClick={() => goTo("/membership")} className="soft-button mt-2 rounded-xl bg-[#ff6b00] px-4 py-3 text-left text-sm font-extrabold text-[#1c0b00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffad70]">Get Started</button>
          </div>
        ) : null}
      </header>

      {children}

      <SocialContactPanel />

      <footer className="relative mt-4 border-t border-slate-700/40 bg-[#050914]/45 px-5 py-9 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-7 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="font-display font-bold tracking-[-0.03em] text-slate-200">Ismail Hossen<span className="text-[#ff6b00]">.</span></p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400"><strong className="font-bold text-slate-200">Responsible use:</strong> Content is informational only. Outcomes are not guaranteed, and past results do not predict future results.</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-400 sm:justify-end" aria-label="Footer navigation">
            {[...PUBLIC_NAV_ITEMS.slice(5), ...FOOTER_NAV_ITEMS].map((item) => (
              <button type="button" key={item.path} onClick={() => goTo(item.path)} className="soft-button hover:text-orange-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8a3d]">{item.label}</button>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
