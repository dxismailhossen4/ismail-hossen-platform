import { describe, expect, it } from "vitest";
import { HOW_IT_WORKS_STEPS } from "./HowItWorks";

describe("HOW_IT_WORKS_STEPS", () => {
  it("keeps the four public membership steps in the intended order", () => {
    expect(HOW_IT_WORKS_STEPS.map((step) => step.title)).toEqual([
      "Explore free tips",
      "Create account",
      "Choose membership",
      "Access after verification",
    ]);
  });

  it("provides numbered, accessible step content", () => {
    expect(HOW_IT_WORKS_STEPS.map((step) => step.number)).toEqual(["01", "02", "03", "04"]);
    expect(HOW_IT_WORKS_STEPS.every((step) => step.description.length > 0)).toBe(true);
  });
});
