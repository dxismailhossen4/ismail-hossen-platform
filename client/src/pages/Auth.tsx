import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";

type Mode = "sign-in" | "sign-up";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading, signIn, signUp } = useSupabaseAuth();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) setLocation("/account");
  }, [isAuthenticated, loading, setLocation]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    const result = mode === "sign-in" ? await signIn(email, password) : await signUp(fullName, email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsEmailConfirmation) {
      setMessage("Check your email to confirm your account, then return here to sign in.");
      return;
    }
    setLocation("/account");
  };

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
    setMessage(null);
  };

  return <main className="site-shell flex min-h-screen items-center justify-center px-5 py-9 sm:px-8"><section className="panel-border relative w-full max-w-md overflow-hidden rounded-[2rem] bg-[#0c1425]/92 p-6 backdrop-blur-xl sm:p-9"><div className="absolute -right-20 -top-20 size-56 rounded-full bg-orange-600/13 blur-3xl" /><button type="button" onClick={() => setLocation("/")} className="soft-button relative inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8a3d]"><ArrowLeft className="size-4" aria-hidden="true" />Back to home</button><div className="relative mt-10"><div className="inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/8 px-3 py-1.5 text-xs font-extrabold tracking-[0.14em] text-orange-200 uppercase"><LockKeyhole className="size-3.5" aria-hidden="true" />Secure account</div><h1 className="font-display mt-4 text-3xl font-extrabold tracking-[-0.055em] text-white">{mode === "sign-in" ? "Welcome back." : "Create your account."}</h1><p className="mt-3 text-sm leading-6 text-slate-400">{mode === "sign-in" ? "Sign in to view the account data and membership access available to you." : "Register to access your private dashboard and manage your membership journey."}</p></div><div className="relative mt-7 grid grid-cols-2 rounded-xl border border-slate-700/70 bg-slate-950/40 p-1"><button type="button" onClick={() => switchMode("sign-in")} className={`soft-button rounded-lg px-3 py-2 text-sm font-bold ${mode === "sign-in" ? "bg-orange-400/12 text-orange-200" : "text-slate-400 hover:text-white"}`}>Sign In</button><button type="button" onClick={() => switchMode("sign-up")} className={`soft-button rounded-lg px-3 py-2 text-sm font-bold ${mode === "sign-up" ? "bg-orange-400/12 text-orange-200" : "text-slate-400 hover:text-white"}`}>Sign Up</button></div><form onSubmit={submit} className="relative mt-6 space-y-4">{mode === "sign-up" ? <label className="block"><span className="mb-2 block text-sm font-bold text-slate-200">Full name</span><span className="flex items-center rounded-xl border border-slate-700/70 bg-slate-950/35 px-3 focus-within:border-orange-300/70"><UserRound className="size-4 text-slate-500" aria-hidden="true" /><input value={fullName} onChange={(event) => setFullName(event.target.value)} required autoComplete="name" className="min-h-12 w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-600" placeholder="Your full name" /></span></label> : null}<label className="block"><span className="mb-2 block text-sm font-bold text-slate-200">Email address</span><span className="flex items-center rounded-xl border border-slate-700/70 bg-slate-950/35 px-3 focus-within:border-orange-300/70"><Mail className="size-4 text-slate-500" aria-hidden="true" /><input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" autoComplete="email" className="min-h-12 w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-600" placeholder="you@example.com" /></span></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-200">Password</span><span className="flex items-center rounded-xl border border-slate-700/70 bg-slate-950/35 px-3 focus-within:border-orange-300/70"><LockKeyhole className="size-4 text-slate-500" aria-hidden="true" /><input value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} type={showPassword ? "text" : "password"} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} className="min-h-12 w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-600" placeholder="At least 6 characters" /><button type="button" onClick={() => setShowPassword((show) => !show)} className="rounded-md p-1 text-slate-500 hover:text-white focus-visible:outline-2 focus-visible:outline-[#ff8a3d]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}</button></span></label>{error ? <p role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2.5 text-sm leading-6 text-red-200">{error}</p> : null}{message ? <p role="status" className="rounded-xl border border-orange-300/20 bg-orange-400/8 px-3 py-2.5 text-sm leading-6 text-orange-100">{message}</p> : null}<button type="submit" disabled={submitting} className="soft-button orange-glow inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-5 py-3 text-sm font-extrabold text-[#1c0b00] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffad70]">{submitting ? "Please wait…" : mode === "sign-in" ? "Sign In" : "Create Account"}<ArrowRight className="size-4" aria-hidden="true" /></button></form><p className="relative mt-6 text-center text-xs leading-5 text-slate-500">By continuing, you acknowledge the platform’s responsible-use positioning. Membership access does not guarantee any outcome.</p></section></main>;
}
