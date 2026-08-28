import { describe, expect, it } from "vitest";
import { DAILY_PHOTO_EMPTY_STATE, DAILY_PHOTO_MAX_BYTES, dailyPhotoValidationMessage, getDailyPhotoState, validateDailyPhotoFile } from "./dailyMedia";

describe("daily photo media", () => {
  it("provides a clear empty state before an image is supplied", () => {
    expect(DAILY_PHOTO_EMPTY_STATE.title).toBe("Daily photo post");
    expect(DAILY_PHOTO_EMPTY_STATE.badge).toBe("No photo posted yet");
    expect(DAILY_PHOTO_EMPTY_STATE.description).toContain("one fresh photo each day");
    expect(getDailyPhotoState(false)).toBe("awaiting-photo");
  });

  it("supports a ready state for a future daily image", () => {
    expect(getDailyPhotoState(true)).toBe("photo-ready");
  });

  it("accepts supported images and rejects unsupported or oversized files", () => {
    expect(validateDailyPhotoFile({ type: "image/jpeg", size: 1024 })).toBeNull();
    expect(validateDailyPhotoFile({ type: "image/gif", size: 1024 })).toBe("type");
    expect(validateDailyPhotoFile({ type: "image/png", size: DAILY_PHOTO_MAX_BYTES + 1 })).toBe("size");
    expect(dailyPhotoValidationMessage("size")).toContain("5 MB");
  });
});
