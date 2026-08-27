import { describe, expect, it } from "vitest";
import { getMembershipPath, MEMBERSHIP_PATH, PROOF_SECTION_ID } from "./membership";

describe("membership landing navigation", () => {
  it("keeps every membership call to action on the defined next step", () => {
    expect(getMembershipPath()).toBe(MEMBERSHIP_PATH);
    expect(MEMBERSHIP_PATH).toBe("/membership");
  });

  it("uses a stable target for the proof call to action", () => {
    expect(PROOF_SECTION_ID).toBe("proof-media");
  });
});
