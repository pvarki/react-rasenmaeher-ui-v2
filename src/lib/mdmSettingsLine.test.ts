// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MDM_CONNECTOR_ORIGIN,
  mdmSettingsLine,
  openInMdmConnector,
} from "./mdmSettingsLine";

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

describe("openInMdmConnector", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function openConnector() {
    const opened = { postMessage: vi.fn() };
    const open = vi
      .spyOn(window, "open")
      .mockReturnValue(opened as unknown as Window);
    openInMdmConnector(VECTOR);
    return { opened, open };
  }

  function say(
    data: unknown,
    source: unknown,
    origin: string = MDM_CONNECTOR_ORIGIN,
  ) {
    window.dispatchEvent(
      new MessageEvent("message", {
        data,
        origin,
        source: source as MessageEventSource,
      }),
    );
  }

  it("opens the connector without the line in the address", () => {
    const { open } = openConnector();
    expect(open).toHaveBeenCalledWith(`${MDM_CONNECTOR_ORIGIN}/`, "_blank");
  });

  it("posts the line only after the opened page is ready", () => {
    const { opened } = openConnector();
    expect(opened.postMessage).not.toHaveBeenCalled();
    say("odmdm-ready", opened);
    expect(opened.postMessage).toHaveBeenCalledWith(
      { add: VECTOR },
      MDM_CONNECTOR_ORIGIN,
    );
  });

  it("posts nothing for another origin or another window", () => {
    const { opened } = openConnector();
    say("odmdm-ready", opened, "https://evil.example.fi");
    say("odmdm-ready", window);
    say("something else", opened);
    expect(opened.postMessage).not.toHaveBeenCalled();
  });

  it("posts the line only once", () => {
    const { opened } = openConnector();
    say("odmdm-ready", opened);
    say("odmdm-ready", opened);
    expect(opened.postMessage).toHaveBeenCalledTimes(1);
  });

  it("does nothing when the browser blocks the window", () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    expect(() => openInMdmConnector(VECTOR)).not.toThrow();
  });
});
