export const FREE_TIP_TITLE_MAX = 140;
export const FREE_TIP_BODY_MAX = 4000;

export type FreeTipDraft = { title: string; body: string };

export function validateFreeTipDraft(draft: FreeTipDraft): string | null {
  const title = draft.title.trim();
  const body = draft.body.trim();
  if (title.length < 3 || title.length > FREE_TIP_TITLE_MAX) return `Title must be between 3 and ${FREE_TIP_TITLE_MAX} characters.`;
  if (body.length < 10 || body.length > FREE_TIP_BODY_MAX) return `Tip content must be between 10 and ${FREE_TIP_BODY_MAX} characters.`;
  return null;
}

export function formatFreeTipDate(value: string | null | undefined): string {
  if (!value) return "Not published yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
