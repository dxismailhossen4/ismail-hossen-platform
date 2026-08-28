export const DAILY_PHOTO_EMPTY_STATE = {
  title: "Daily photo post",
  description: "A dedicated place for one fresh photo each day. The next image will appear here when it is ready.",
  badge: "No photo posted yet",
} as const;

export function getDailyPhotoState(hasPhoto: boolean) {
  return hasPhoto ? "photo-ready" : "awaiting-photo";
}
