import { describe, expect, it } from "vitest";
import { parseProgress } from "./useWizardStep";

const COUNT = 3;

describe("parseProgress", () => {
  it("starts at the top with nothing stored", () => {
    expect(parseProgress(null, "ALPHA", COUNT)).toEqual({
      step: 0,
      furthest: 0,
    });
  });

  it("resumes the owner's own progress", () => {
    expect(parseProgress("ALPHA:1:2", "ALPHA", COUNT)).toEqual({
      step: 1,
      furthest: 2,
    });
  });

  it("ignores progress left by a different callsign", () => {
    expect(parseProgress("BRAVO:2:2", "ALPHA", COUNT)).toEqual({
      step: 0,
      furthest: 0,
    });
  });

  it("ignores progress with no owner", () => {
    expect(parseProgress(":2:2", "", COUNT)).toEqual({ step: 0, furthest: 0 });
  });

  it.each(["garbage", "ALPHA", "ALPHA:x:1", "ALPHA:1.5:2"])(
    "falls back to the top on malformed value %j",
    (stored) => {
      expect(parseProgress(stored, "ALPHA", COUNT)).toEqual({
        step: 0,
        furthest: 0,
      });
    },
  );

  it("rejects a step past the end, so a shorter flow cannot strand the user", () => {
    expect(parseProgress("ALPHA:9:9", "ALPHA", COUNT)).toEqual({
      step: 0,
      furthest: 0,
    });
  });

  it("clamps furthest to the last step", () => {
    expect(parseProgress("ALPHA:1:99", "ALPHA", COUNT)).toEqual({
      step: 1,
      furthest: COUNT - 1,
    });
  });

  it("keeps furthest at least at the current step", () => {
    // Stepping back leaves furthest ahead: the way forward stays open.
    expect(parseProgress("ALPHA:2:0", "ALPHA", COUNT)).toEqual({
      step: 2,
      furthest: 2,
    });
  });

  it("treats a missing furthest as the current step", () => {
    expect(parseProgress("ALPHA:1", "ALPHA", COUNT)).toEqual({
      step: 1,
      furthest: 1,
    });
  });
});
