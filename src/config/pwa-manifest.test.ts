import { describe, expect, it } from "vitest";
import { deploymentNameFrom, patchManifest } from "./pwa-manifest";

const ORIGIN = "https://mtls.kettu.dev.pvarki.fi";

// What the vite manifestPlugin writes to dist/manifest.json: every URL relative.
const SERVED = {
  id: "/",
  name: "PVARKI",
  short_name: "Deploy App",
  start_url: "/",
  scope: "/",
  display: "standalone",
  icons: [{ src: "/themes/default/icons/icon-192x192.png", sizes: "192x192" }],
  screenshots: [
    { src: "/themes/default/assets/shot.png", form_factor: "wide" },
  ],
  protocol_handlers: [{ protocol: "web+pvarki", url: "/invite-code/%s" }],
};

describe("deploymentNameFrom", () => {
  it.each([
    ["mtls.kettu.dev.pvarki.fi", "kettu"],
    ["kettu.dev.pvarki.fi", "kettu"],
    ["localhost", "localhost"],
  ])("names the deployment in %j %j", (hostname, expected) => {
    expect(deploymentNameFrom(hostname)).toBe(expected);
  });

  it("strips the mtls prefix only at the front", () => {
    expect(deploymentNameFrom("mtls.mtls.dev.pvarki.fi")).toBe("mtls");
  });
});

describe("patchManifest", () => {
  const patched = patchManifest(SERVED, "kettu", ORIGIN);

  it("names the app after the deployment", () => {
    expect(patched.name).toBe("kettu");
    expect(patched.short_name).toBe("kettu");
  });

  // A relative URL here would resolve against the blob: URL, not the origin,
  // and the scope check that gates installability would fail.
  it("absolutises the URLs the scope check depends on", () => {
    expect(patched.id).toBe(`${ORIGIN}/`);
    expect(patched.start_url).toBe(`${ORIGIN}/`);
    expect(patched.scope).toBe(`${ORIGIN}/`);
  });

  it("absolutises icons, screenshots and protocol handlers", () => {
    expect(patched.icons?.[0].src).toBe(
      `${ORIGIN}/themes/default/icons/icon-192x192.png`,
    );
    expect(patched.screenshots?.[0].src).toBe(
      `${ORIGIN}/themes/default/assets/shot.png`,
    );
    expect(patched.protocol_handlers?.[0].url).toBe(`${ORIGIN}/invite-code/%s`);
  });

  it("keeps the other fields of each entry", () => {
    expect(patched.icons?.[0].sizes).toBe("192x192");
    expect(patched.screenshots?.[0].form_factor).toBe("wide");
    expect(patched.protocol_handlers?.[0].protocol).toBe("web+pvarki");
    expect(patched.display).toBe("standalone");
  });

  it("leaves the served manifest alone", () => {
    expect(SERVED.name).toBe("PVARKI");
    expect(SERVED.start_url).toBe("/");
  });

  it("survives a manifest missing every optional field", () => {
    const bare = patchManifest({}, "kettu", ORIGIN);
    expect(bare.start_url).toBe(`${ORIGIN}/`);
    expect(bare.icons).toEqual([]);
    expect(bare.protocol_handlers).toEqual([]);
  });
});
