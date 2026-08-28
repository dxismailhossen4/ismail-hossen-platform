export const DAILY_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const DAILY_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export type DailyPhotoIssue = "type" | "size";

export const DAILY_PHOTO_EMPTY_STATE = {
  title: "Daily photo post",
  description: "A dedicated place for one fresh photo each day. The next image will appear here when it is ready.",
  badge: "No photo posted yet",
} as const;

export function getDailyPhotoState(hasPhoto: boolean) {
  return hasPhoto ? "photo-ready" : "awaiting-photo";
}

export function validateDailyPhotoFile(file: Pick<File, "type" | "size">): DailyPhotoIssue | null {
  if (!DAILY_PHOTO_TYPES.includes(file.type as (typeof DAILY_PHOTO_TYPES)[number])) return "type";
  if (file.size <= 0 || file.size > DAILY_PHOTO_MAX_BYTES) return "size";
  return null;
}

export function dailyPhotoValidationMessage(issue: DailyPhotoIssue | null) {
  if (issue === "type") return "Upload a JPG, PNG, or WEBP image file.";
  if (issue === "size") return "Daily photos must be between 1 byte and 5 MB.";
  return "";
}

export function readDailyPhotoAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The selected daily photo could not be read."));
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        reject(new Error("The selected daily photo could not be read."));
        return;
      }
      const [, base64 = ""] = dataUrl.split(",", 2);
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}
