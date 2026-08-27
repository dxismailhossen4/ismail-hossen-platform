import { describe, expect, it } from "vitest";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabase";

describe("Supabase browser configuration", () => {
  it("reaches the configured Supabase authentication service with the public publishable key", async () => {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    });

    expect(response.ok).toBe(true);
  });
});
