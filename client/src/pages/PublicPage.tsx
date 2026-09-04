import PublicLayout from "@/components/PublicLayout";
import type { PublicPageKey } from "@/lib/navigation";
import { formatFreeTipDate } from "@/lib/freeTips";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Check, CircleHelp, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

type ContentBlock = { title: string; body: string; icon: "check" | "shield" | "help" | "mail" | "lock" };
type PageContent = { eyebrow: string; title: string; intro: string; blocks: ContentBlock[]; cta?: { label: string; path: string } };

const PAGE_CONTENT: Record<PublicPageKey, PageContent> = {
  "free-tips": {
    eyebrow: "Open access", title: "Free Tips", intro: "Explore the format, categories, and publishing standard behind selected free content before you decide whether membership is right for you.",
    blocks: [
      { title: "Clear categories", body: "Free content is organised by category and date so visitors can understand the publishing approach without searching through unstructured posts.", icon: "check" },
      { title: "Published context", body: "Every published item should clearly distinguish its release date, category, and explanatory context from actual historical outcomes.", icon: "shield" },
      { title: "No exaggerated claims", body: "The public area is intended to explain the platform, not to promise a particular result or financial outcome.", icon: "help" },
    ], cta: { label: "Create an account", path: "/membership" },
  },
  results: {
    eyebrow: "Transparent records", title: "Results", intro: "This page is reserved for verified historical results and corresponding reference details. Records should be published only after they can be checked.",
    blocks: [
      { title: "Verified history", body: "The final record view should pair a draw date, category, published prediction reference, actual result, and a clear hit or miss status.", icon: "shield" },
      { title: "No fabricated records", body: "Until real, verifiable data is supplied, this site intentionally displays no sample winning claims, ratings, reviews, or simulated performance data.", icon: "lock" },
      { title: "Clear distinction", body: "Predictions and historical results should always be shown as separate fields so a visitor can understand what happened and when.", icon: "check" },
    ], cta: { label: "View performance approach", path: "/performance" },
  },
  performance: {
    eyebrow: "Performance archive", title: "Performance", intro: "A structured location for documented historical performance. It is designed to support transparency, not a guarantee of future outcomes.",
    blocks: [
      { title: "Record format", body: "A complete performance entry should include date, classification, result status, source reference, and the original publication context.", icon: "check" },
      { title: "Review standard", body: "Only records that can be reasonably checked should be published. Any correction should retain an audit-friendly timestamp.", icon: "shield" },
      { title: "Responsible context", body: "Past information is not a prediction of a future outcome. This principle remains visible wherever performance is discussed.", icon: "help" },
    ], cta: { label: "Read responsible-use notice", path: "/responsible-use" },
  },
  vip: {
    eyebrow: "Private membership", title: "VIP Membership", intro: "A private member area for people who want access to the full platform experience, clear membership information, and gated content where eligible.",
    blocks: [
      { title: "Clear before payment", body: "Each membership package should show its duration, included access, price, and renewal terms before the visitor reaches checkout.", icon: "check" },
      { title: "Protected access", body: "Paid content remains locked until membership and payment status are successfully verified through the configured account system.", icon: "lock" },
      { title: "Membership is not a guarantee", body: "Membership provides access to designated information and features; it does not guarantee any outcome or return.", icon: "shield" },
    ], cta: { label: "Continue to membership", path: "/membership" },
  },
  about: {
    eyebrow: "About the platform", title: "Designed for clarity, not noise.", intro: "SINGAPORE POOLS 4D6D is structured around disciplined publishing, clear account access, and an honest distinction between information, records, and outcomes.",
    blocks: [
      { title: "Focused process", body: "The information architecture keeps public content, member content, payment records, and administrative work in their own appropriate spaces.", icon: "check" },
      { title: "Transparent positioning", body: "Performance and historical information should be shown with proper context and never framed as a guaranteed future result.", icon: "shield" },
      { title: "Member-first access", body: "Registered users should see a clean account area with their own membership, payment, support, and permitted content pathways.", icon: "lock" },
    ], cta: { label: "Explore free tips", path: "/free-tips" },
  },
  faq: {
    eyebrow: "Helpful answers", title: "Frequently asked questions", intro: "This page groups the questions a visitor should be able to answer before registering, joining membership, or accessing restricted content.",
    blocks: [
      { title: "What can visitors view?", body: "Visitors can browse selected public information and platform explanations. Member-only content requires the appropriate account and access status.", icon: "help" },
      { title: "How is access determined?", body: "Access is based on the user’s authenticated account and, where relevant, verified membership status and applicable access rules.", icon: "lock" },
      { title: "Are outcomes guaranteed?", body: "No. Content is informational only, and past performance does not guarantee future results.", icon: "shield" },
    ], cta: { label: "Contact support", path: "/contact" },
  },
  contact: {
    eyebrow: "Support", title: "Contact", intro: "A dedicated support route for account, membership, payment, or content questions. A secure support form can be connected here when the support workflow is activated.",
    blocks: [
      { title: "Account support", body: "Use this area for sign-in, profile, security, and access questions once the account system is active.", icon: "mail" },
      { title: "Membership support", body: "Membership duration, access activation, and payment verification questions should be resolved through a documented support process.", icon: "check" },
      { title: "Responsible contact", body: "Support communications should never make promises about results or encourage behaviour beyond a user’s own limits.", icon: "shield" },
    ], cta: { label: "Open my account", path: "/account" },
  },
  terms: {
    eyebrow: "Terms", title: "Terms & Conditions", intro: "A dedicated legal page for the final operating terms, membership conditions, payment terms, content access rules, and jurisdiction-specific requirements.",
    blocks: [
      { title: "Membership terms", body: "Before launch, state package duration, billing or renewal rules, delivery terms, and cancellation or refund treatment in clear language.", icon: "check" },
      { title: "Content usage", body: "Define permitted personal use of platform information and restrictions on sharing protected member content.", icon: "lock" },
      { title: "No guarantee", body: "Terms should repeat that outcomes, winnings, and profits are never guaranteed by the platform or its content.", icon: "shield" },
    ], cta: { label: "Read responsible use", path: "/responsible-use" },
  },
  privacy: {
    eyebrow: "Privacy", title: "Privacy Policy", intro: "A dedicated location for the final explanation of what account, profile, payment, and support data is collected, why it is used, and how it is secured.",
    blocks: [
      { title: "Minimal collection", body: "Only collect data that is needed for account management, membership access, payment verification, and requested support.", icon: "check" },
      { title: "User-specific access", body: "Personal information should be protected by authenticated, user-specific database access policies.", icon: "shield" },
      { title: "Clear requests", body: "The final policy should state how a user can request access, correction, or deletion, subject to applicable legal obligations.", icon: "mail" },
    ], cta: { label: "Go to my account", path: "/account/profile" },
  },
  "responsible-use": {
    eyebrow: "Responsible use", title: "Keep participation within your limits.", intro: "This platform is designed to present informational content with transparency. Participation should be lawful, informed, and always within the user’s own limits.",
    blocks: [
      { title: "No guaranteed results", body: "No page, membership, prediction, or historic record should be interpreted as a promise of a future result, profit, or win.", icon: "shield" },
      { title: "Use informed judgment", body: "Users should consider their own circumstances, avoid chasing losses, and stop if participation is causing distress or financial harm.", icon: "help" },
      { title: "Age and local rules", body: "Only use the platform where participation is lawful and after meeting any applicable age, eligibility, and local compliance requirements.", icon: "check" },
    ], cta: { label: "Return home", path: "/" },
  },
};

const ICONS = { check: Check, shield: ShieldCheck, help: CircleHelp, mail: Mail, lock: LockKeyhole };

type PublishedFreeTip = { title: string; body: string; published_at: string | null };

export default function PublicPage({ page }: { page: PublicPageKey }) {
  const [, setLocation] = useLocation();
  const content = PAGE_CONTENT[page];
  const [publishedTip, setPublishedTip] = useState<PublishedFreeTip | null>(null);
  const [tipLoading, setTipLoading] = useState(page === "free-tips");

  useEffect(() => {
    if (page !== "free-tips") return;
    let active = true;
    void supabase.from("free_tip_posts").select("title,body,published_at").eq("is_published", true).order("published_at", { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
      if (!active) return;
      setPublishedTip((data as PublishedFreeTip | null) ?? null);
      setTipLoading(false);
    });
    return () => { active = false; };
  }, [page]);

  return (
    <PublicLayout>
      <main className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-20 lg:px-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-600/30 bg-[#0b1426]/70 px-6 py-10 shadow-2xl sm:px-10 sm:py-14">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-orange-600/12 blur-3xl" />
          <p className="relative text-xs font-extrabold tracking-[0.16em] text-orange-300 uppercase">{content.eyebrow}</p>
          <h1 className="font-display relative mt-4 max-w-3xl text-4xl font-extrabold tracking-[-0.055em] text-white sm:text-5xl">{content.title}</h1>
          <p className="relative mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">{content.intro}</p>
          {content.cta ? <button type="button" onClick={() => setLocation(content.cta!.path)} className="soft-button orange-glow relative mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-[#1c0b00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70]">{content.cta.label}<ArrowRight className="size-4" aria-hidden="true" /></button> : null}
        </section>

        {page === "free-tips" ? <section className="mt-6 rounded-2xl border border-orange-300/20 bg-orange-400/[0.06] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-extrabold tracking-[0.16em] text-orange-300 uppercase">Today’s public tip</p>{publishedTip ? <span className="text-xs font-semibold text-slate-500">Published {formatFreeTipDate(publishedTip.published_at)}</span> : null}</div>
          {tipLoading ? <p className="mt-4 text-sm text-slate-400">Loading today’s tip…</p> : publishedTip ? <><h2 className="font-display mt-4 text-2xl font-extrabold tracking-[-0.04em] text-white">{publishedTip.title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">{publishedTip.body}</p></> : <p className="mt-4 text-sm leading-6 text-slate-400">No public tip has been published yet. Please check back for the next daily update.</p>}
          <p className="mt-5 border-t border-orange-300/15 pt-4 text-xs leading-5 text-slate-500">Informational content only. No result, win, or profit is guaranteed.</p>
        </section> : null}

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {content.blocks.map((block) => {
            const Icon = ICONS[block.icon];
            return <article key={block.title} className="panel-border rounded-2xl bg-[#0b1323]/80 p-6">
              <div className="grid size-10 place-items-center rounded-xl bg-orange-400/10 text-orange-300"><Icon className="size-5" aria-hidden="true" /></div>
              <h2 className="font-display mt-5 text-lg font-extrabold tracking-[-0.035em] text-white">{block.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{block.body}</p>
            </article>;
          })}
        </section>
      </main>
    </PublicLayout>
  );
}
