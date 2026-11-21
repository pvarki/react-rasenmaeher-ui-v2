import { describe, expect, it } from "vitest";
import { mdmSettingsLine } from "./mdmSettingsLine";

const settings = {
  scep_url: "https://unit.example.fi/scep",
  challenge: "0123456789abcdef0123456789abcdef", // pragma: allowlist secret
};
const VECTOR =
  "ODMDM1 https://unit.example.fi/scep 0123456789abcdef0123456789abcdef 2026-11-21T14:00:00Z";

describe("mdmSettingsLine", () => {
  it("matches the shared test vector", () => {
    expect(
      mdmSettingsLine({ ...settings, open_until: "2026-11-21T14:00:00Z" }),
    ).toBe(VECTOR);
  });

  it("drops fractions of a second", () => {
    expect(
      mdmSettingsLine({
        ...settings,
        open_until: "2026-11-21T14:00:00.987654+00:00",
      }),
    ).toBe(VECTOR);
  });

  it("converts an offset to UTC", () => {
    expect(
      mdmSettingsLine({ ...settings, open_until: "2026-11-21T16:00:00+02:00" }),
    ).toBe(VECTOR);
  });

  it("gives nothing while the window is closed", () => {
    expect(mdmSettingsLine({ ...settings, open_until: null })).toBeNull();
  });

  it("gives nothing for a time it cannot read", () => {
    expect(mdmSettingsLine({ ...settings, open_until: "soon" })).toBeNull();
  });

  it("gives nothing when a field would split the line", () => {
    expect(
      mdmSettingsLine({
        ...settings,
        challenge: "",
        open_until: "2026-11-21T14:00:00Z",
      }),
    ).toBeNull();
  });
});
