import DashboardLayout from "@/components/DashboardLayout";
import { ADMIN_NAV_ITEMS, getAdminSection, getNavigationLabel } from "@/lib/navigation";
import { ClipboardCheck, FileText, UsersRound } from "lucide-react";
import { useLocation } from "wouter";

const ADMIN_COPY: Record<string, { title: string; description: string }> = {
  overview: { title: "Admin overview", description: "A protected workspace for managing users, content, membership operations, and audit-friendly platform records." },
  users: { title: "Users", description: "Search, review, and manage account status through the administrator-only user-management workflow." },
  predictions: { title: "Predictions", description: "Create, review, publish, archive, and distinguish free versus member-only prediction records." },
  results: { title: "Results", description: "Enter and maintain verified historical results with a clear distinction between prediction records and actual outcomes." },
  memberships: { title: "Memberships", description: "Create packages, review eligibility, and manage membership duration or current access state." },
  payments: { title: "Payments", description: "Review payment verification status and maintain the records that determine premium-content access." },
  "site-content": { title: "Site Content", description: "Manage hero messaging, selected public content, FAQs, announcements, and other homepage sections without altering verified records." },
  support: { title: "Support", description: "Review account and member support requests through a secure administrator workflow." },
};

export default function Admin() {
  const [location] = useLocation();
  const section = getAdminSection(location);
  const content = ADMIN_COPY[section] ?? ADMIN_COPY.overview;
  const activeLabel = getNavigationLabel(ADMIN_NAV_ITEMS, location, "Admin Overview");

  return (
    <DashboardLayout items={ADMIN_NAV_ITEMS} navigationLabel="Administration" requireAdmin>
      <section className="mx-auto max-w-5xl py-3 sm:py-6">
        <p className="text-xs font-extrabold tracking-[0.16em] text-orange-300 uppercase">Administrator workspace</p>
        <h1 className="font-display mt-3 text-3xl font-extrabold tracking-[-0.05em] text-white sm:text-4xl">{content.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">{content.description}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="panel-border rounded-2xl bg-[#0b1323]/80 p-5 md:col-span-2"><FileText className="size-5 text-orange-300" aria-hidden="true" /><p className="mt-4 text-sm font-bold text-white">{activeLabel}</p><p className="mt-2 text-sm leading-6 text-slate-400">This protected page structure is ready for the corresponding management tools and verified data forms.</p></article>
          <article className="panel-border rounded-2xl bg-orange-400/[0.055] p-5"><ClipboardCheck className="size-5 text-orange-300" aria-hidden="true" /><p className="mt-4 text-sm font-bold text-white">Audit-ready workflow</p><p className="mt-2 text-sm leading-6 text-slate-400">Administrative content should be published with clear status and timestamps.</p></article>
          <article className="rounded-2xl border border-slate-700/60 bg-slate-950/20 p-5"><UsersRound className="size-5 text-slate-300" aria-hidden="true" /><p className="mt-4 text-sm font-bold text-white">Role separation</p><p className="mt-2 text-sm leading-6 text-slate-400">Only accounts with the administrator role can reach these routes.</p></article>
        </div>
      </section>
    </DashboardLayout>
  );
}
