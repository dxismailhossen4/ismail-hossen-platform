import { Facebook, Instagram, MessageCircle, ArrowUpRight } from "lucide-react";
import { SOCIAL_LINKS, WHATSAPP_CONTACTS } from "@/lib/socialLinks";

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
};

export default function SocialContactPanel() {
  return (
    <section aria-labelledby="social-contact-title" className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 sm:pb-16 lg:px-10">
      <div className="grid gap-5 rounded-[1.75rem] border border-slate-700/45 bg-[#08101f]/78 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.16em] text-orange-300 uppercase">
            <MessageCircle className="size-4" aria-hidden="true" />
            Stay connected
          </div>
          <h2 id="social-contact-title" className="font-display mt-3 text-2xl font-extrabold tracking-[-0.045em] text-white sm:text-3xl">
            WhatsApp / IMO contact
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Connect through the official social profiles or message one of the available WhatsApp / IMO contacts.
          </p>
          <div className="mt-5 flex flex-wrap gap-3" aria-label="Official social profiles">
            {SOCIAL_LINKS.map((link) => {
              const Icon = SOCIAL_ICONS[link.id];
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="soft-button inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-600/60 bg-slate-950/30 px-3.5 py-2 text-sm font-bold text-slate-200 hover:border-orange-300/60 hover:bg-orange-400/10 hover:text-orange-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8a3d]"
                  aria-label={`Open SINGAPORE POOLS 4D6D ${link.label} ${link.handle} in a new tab`}
                >
                  <Icon className="size-4 text-orange-300" aria-hidden="true" />
                  <span>{link.label}</span>
                  <ArrowUpRight className="size-3.5 text-slate-500" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {WHATSAPP_CONTACTS.map((contact) => (
            <a
              key={contact.id}
              href={contact.href}
              target="_blank"
              rel="noreferrer"
              className="soft-button group rounded-2xl border border-emerald-300/20 bg-emerald-400/[0.055] p-4 hover:border-emerald-200/45 hover:bg-emerald-400/[0.1] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-200"
              aria-label={`Message ${contact.displayNumber} on WhatsApp in a new tab`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-emerald-200 uppercase">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp / IMO
                </span>
                <ArrowUpRight className="size-4 text-emerald-200/65 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
              <span className="font-display mt-4 block text-lg font-extrabold tracking-[-0.02em] text-white">{contact.displayNumber}</span>
              <span className="mt-1 block text-xs text-emerald-100/65">Tap to start a WhatsApp chat</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
