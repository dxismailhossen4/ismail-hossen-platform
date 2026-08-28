import { Check, Eye, LockKeyhole, UserRoundPlus } from "lucide-react";

const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "Explore free tips",
    description: "Start with the public updates and available platform information.",
    icon: Eye,
  },
  {
    number: "02",
    title: "Create account",
    description: "Register securely to continue through the membership pathway.",
    icon: UserRoundPlus,
  },
  {
    number: "03",
    title: "Choose membership",
    description: "Review the available membership option before continuing.",
    icon: LockKeyhole,
  },
  {
    number: "04",
    title: "Access after verification",
    description: "Access opens after payment review and administrator verification.",
    icon: Check,
  },
] as const;

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-title" className="relative mx-auto max-w-7xl px-5 pb-14 sm:px-8 sm:pb-20 lg:px-10">
      <div className="mb-8 text-center sm:mb-10">
        <p className="text-[0.68rem] font-extrabold tracking-[0.2em] text-orange-300 uppercase">A straightforward path</p>
        <h2 id="how-it-works-title" className="font-display mt-3 text-4xl font-extrabold tracking-[-0.06em] text-white sm:text-5xl">How it works</h2>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HOW_IT_WORKS_STEPS.map(({ number, title, description, icon: Icon }) => (
          <li key={number} className="group relative min-h-48 border border-white/[0.06] border-l-orange-300/65 bg-[#0a101d]/82 p-5 transition-transform duration-200 hover:-translate-y-1 hover:bg-[#0d1728]/90 sm:min-h-52 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold tracking-[0.12em] text-orange-200">{number}</span>
              <Icon className="size-4 text-slate-400 transition-colors duration-200 group-hover:text-orange-300" aria-hidden="true" />
            </div>
            <h3 className="font-display mt-8 text-xl font-bold tracking-[-0.04em] text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export { HOW_IT_WORKS_STEPS };
