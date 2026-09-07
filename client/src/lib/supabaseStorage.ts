import { supabase } from "./supabase";

export const PAYMENT_PROOF_BUCKET = "payment-proofs";
export const PUBLIC_MEDIA_BUCKET = "public-media";

function safeName(name: string, fallback: string) {
  const clean = name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/\.[^.]+$/, "").slice(0, 70);
  return clean || fallback;
}

function extensionFor(contentType: string) {
  return contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
}

export async function uploadPaymentProof(file: File, userId: string) {
  const extension = extensionFor(file.type);
  const fileName = `${safeName(file.name, "payment-proof")}.${extension}`;
  const path = `${userId}/${crypto.randomUUID()}-${fileName}`;
  const { error } = await supabase.storage.from(PAYMENT_PROOF_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return { key: path, fileName, contentType: file.type };
}

export async function createPaymentProofSignedUrl(path: string) {
  const { data, error } = await supabase.storage.from(PAYMENT_PROOF_BUCKET).createSignedUrl(path, 300);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadDailyPhoto(file: File) {
  const extension = extensionFor(file.type);
  const fileName = `${safeName(file.name, "daily-photo")}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from(PUBLIC_MEDIA_BUCKET).upload(`daily-photos/${fileName}`, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(`daily-photos/${fileName}`);
  return { key: `daily-photos/${fileName}`, url: data.publicUrl, fileName, contentType: file.type };
}
