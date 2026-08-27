import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { storageGetSignedUrl, storagePut } from "./storage";

const supabaseUrl = "https://pfyviyhdyjztqvvvibby.supabase.co";
const supabasePublishableKey = "sb_publishable_V8BlsMfB5VakOyFo8V2K5A_HpS4hVUU";
const allowedProofTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxProofBytes = 3 * 1024 * 1024;

type SupabaseProfile = { id: string; role: "user" | "admin" };
type SupabasePayment = { user_id: string; payment_proof_key: string | null };

async function getSupabaseUser(accessToken: string) {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new TRPCError({ code: "UNAUTHORIZED", message: "Your session has expired. Please sign in again." });
  return (await response.json()) as { id: string };
}

async function getSupabaseProfile(accessToken: string, userId: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,role`, {
    headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new TRPCError({ code: "FORBIDDEN", message: "Unable to verify account access." });
  const profiles = (await response.json()) as SupabaseProfile[];
  return profiles[0] ?? null;
}

async function getSupabasePayment(accessToken: string, paymentId: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/payments?id=eq.${encodeURIComponent(paymentId)}&select=user_id,payment_proof_key`, {
    headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new TRPCError({ code: "FORBIDDEN", message: "Unable to verify payment access." });
  const payments = (await response.json()) as SupabasePayment[];
  return payments[0] ?? null;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  paymentProof: router({
    upload: publicProcedure
      .input(z.object({ accessToken: z.string().min(20), fileName: z.string().min(1).max(120), contentType: z.string(), base64: z.string().min(4).max(4_200_000) }))
      .mutation(async ({ input }) => {
        const user = await getSupabaseUser(input.accessToken);
        if (!allowedProofTypes.has(input.contentType)) throw new TRPCError({ code: "BAD_REQUEST", message: "Only JPG, PNG, and WEBP proof images are supported." });
        if (!/^[A-Za-z0-9+/]+={0,2}$/.test(input.base64)) throw new TRPCError({ code: "BAD_REQUEST", message: "The payment proof format is invalid." });
        const fileBuffer = Buffer.from(input.base64, "base64");
        if (fileBuffer.length === 0 || fileBuffer.length > maxProofBytes) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Payment proof images must be 3 MB or smaller." });
        const extension = input.contentType === "image/png" ? "png" : input.contentType === "image/webp" ? "webp" : "jpg";
        const cleanBaseName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/\.[^.]+$/, "").slice(0, 70) || "payment-proof";
        const { key } = await storagePut(`private/payment-proofs/${user.id}/${cleanBaseName}.${extension}`, fileBuffer, input.contentType);
        return { key, fileName: `${cleanBaseName}.${extension}`, contentType: input.contentType };
      }),
    getSignedUrl: publicProcedure
      .input(z.object({ accessToken: z.string().min(20), paymentId: z.string().uuid() }))
      .query(async ({ input }) => {
        const user = await getSupabaseUser(input.accessToken);
        const [profile, payment] = await Promise.all([getSupabaseProfile(input.accessToken, user.id), getSupabasePayment(input.accessToken, input.paymentId)]);
        if (!payment?.payment_proof_key) throw new TRPCError({ code: "NOT_FOUND", message: "No payment proof is available for this record." });
        if (payment.user_id !== user.id && profile?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this payment proof." });
        return { url: await storageGetSignedUrl(payment.payment_proof_key) };
      }),
  }),
});

export type AppRouter = typeof appRouter;
