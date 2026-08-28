import { describe, expect, it } from "vitest";
import { DAILY_PHOTO_EMPTY_STATE, getDailyPhotoState } from "./dailyMedia";

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
});
