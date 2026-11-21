// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  chooseConnectorFile,
  connectorFileUrl,
  connectorManifestUrl,
  connectorSystemLabel,
  detectSystem,
  pythonCommand,
  readConnectorManifest,
  validateConnectorManifest,
  type ConnectorFile,
} from "./mdmConnectorFiles";

const HASH = "0123456789abcdef".repeat(4);
const file = (
  os: string,
  arch: string,
  name: string,
  size = 10381696,
): Record<string, unknown> => ({ os, arch, file: name, size, sha256: HASH });
const FILES = [
  file("windows", "x64", "odmdm-connector-1.2.0+261121-windows-x64.exe"),
  file("macos", "arm64", "odmdm-connector-1.2.0+261121-macos-arm64.zip"),
  file("linux", "x64", "odmdm-connector-1.2.0+261121-linux-x64.tar.gz"),
  file("any", "any", "odmdm-connector-1.2.0+261121.pyz"),
];
const manifest = (): Record<string, unknown> => ({
  version: "1.2.0+261121",
  mdms: [{ name: "fleet", title: "Fleet" }],
  files: FILES.map((f) => ({ ...f })),
});

describe("validateConnectorManifest", () => {
  it("accepts the contract's example", () => {
    expect(validateConnectorManifest(manifest())).toEqual(manifest());
  });

  const broken: [string, (m: Record<string, unknown>) => unknown][] = [
    ["not an object", () => "<!doctype html>"],
    ["an array", () => [manifest()]],
    ["an extra top-level key", (m) => ({ ...m, url: "https://example.fi" })],
    [
      "no version",
      (m) => {
        delete m.version;
        return m;
      },
    ],
    ["a version with spaces", (m) => ({ ...m, version: "1.2 beta" })],
    ["a long version", (m) => ({ ...m, version: "1".repeat(41) })],
    ["no MDMs", (m) => ({ ...m, mdms: [] })],
    [
      "21 MDMs",
      (m) => ({
        ...m,
        mdms: Array.from({ length: 21 }, (_, i) => ({
          name: `m${i}`,
          title: `M${i}`,
        })),
      }),
    ],
    [
      "markup in a title",
      (m) => ({ ...m, mdms: [{ name: "fleet", title: "<b>Fleet</b>" }] }),
    ],
    [
      "a long title",
      (m) => ({ ...m, mdms: [{ name: "fleet", title: "F".repeat(41) }] }),
    ],
    [
      "an upper-case MDM name",
      (m) => ({ ...m, mdms: [{ name: "Fleet", title: "Fleet" }] }),
    ],
    [
      "an extra MDM key",
      (m) => ({
        ...m,
        mdms: [{ name: "fleet", title: "Fleet", url: "https://example.fi" }],
      }),
    ],
    [
      "the same MDM twice",
      (m) => ({
        ...m,
        mdms: [
          { name: "fleet", title: "Fleet" },
          { name: "fleet", title: "Fleet 2" },
        ],
      }),
    ],
    ["no files", (m) => ({ ...m, files: [] })],
    [
      "13 files",
      (m) => ({
        ...m,
        files: Array.from({ length: 13 }, (_, i) =>
          file("linux", "x64", `f${i}`),
        ),
      }),
    ],
    ["an unknown os", (m) => ({ ...m, files: [file("bsd", "x64", "f")] })],
    ["an unknown arch", (m) => ({ ...m, files: [file("linux", "x86", "f")] })],
    ["a path", (m) => ({ ...m, files: [file("linux", "x64", "../f")] })],
    ["a slash", (m) => ({ ...m, files: [file("linux", "x64", "a/f")] })],
    ["dot-dot", (m) => ({ ...m, files: [file("linux", "x64", "..")] })],
    ["a hidden name", (m) => ({ ...m, files: [file("linux", "x64", ".f")] })],
    [
      "a full address",
      (m) => ({
        ...m,
        files: [file("linux", "x64", "https://example.fi/f")],
      }),
    ],
    [
      "a 121-character name",
      (m) => ({ ...m, files: [file("linux", "x64", "f".repeat(121))] }),
    ],
    ["size zero", (m) => ({ ...m, files: [file("linux", "x64", "f", 0)] })],
    [
      "a fractional size",
      (m) => ({ ...m, files: [file("linux", "x64", "f", 1.5)] }),
    ],
    [
      "a size as text",
      (m) => ({
        ...m,
        files: [{ ...file("linux", "x64", "f"), size: "1" }],
      }),
    ],
    [
      "an upper-case hash",
      (m) => ({
        ...m,
        files: [{ ...file("linux", "x64", "f"), sha256: HASH.toUpperCase() }],
      }),
    ],
    [
      "a short hash",
      (m) => ({
        ...m,
        files: [{ ...file("linux", "x64", "f"), sha256: HASH.slice(1) }],
      }),
    ],
    [
      "an extra file key",
      (m) => ({
        ...m,
        files: [{ ...file("linux", "x64", "f"), url: "https://example.fi/f" }],
      }),
    ],
    [
      "one name twice",
      (m) => ({
        ...m,
        files: [file("linux", "x64", "f"), file("linux", "arm64", "f")],
      }),
    ],
    [
      "one system twice",
      (m) => ({
        ...m,
        files: [file("linux", "x64", "f"), file("linux", "x64", "g")],
      }),
    ],
  ];

  it.each(broken)("drops the whole manifest for %s", (_, breakIt) => {
    expect(validateConnectorManifest(breakIt(manifest()))).toBeNull();
  });

  it("keeps an arm64 build and a plus in the name", () => {
    const m = manifest();
    m.files = [file("linux", "arm64", "odmdm-connector-1.2.0+261121-x.tgz")];
    expect(validateConnectorManifest(m)).not.toBeNull();
  });
});

describe("addresses", () => {
  it("reads the manifest beside the app", () => {
    expect(connectorManifestUrl("https://unit.example.fi", "/").href).toBe(
      "https://unit.example.fi/mdm-connector/connector.json",
    );
    expect(connectorManifestUrl("https://unit.example.fi", "/ui/").href).toBe(
      "https://unit.example.fi/ui/mdm-connector/connector.json",
    );
  });

  it("links a file in the manifest's folder, percent-encoded", () => {
    const at = connectorManifestUrl("https://unit.example.fi", "/");
    expect(connectorFileUrl(at, "odmdm-connector-1.2.0+261121.pyz")).toBe(
      "https://unit.example.fi/mdm-connector/odmdm-connector-1.2.0%2B261121.pyz",
    );
  });
});

describe("readConnectorManifest", () => {
  afterEach(() => vi.unstubAllGlobals());
  const here = () => connectorManifestUrl(window.location.origin, "/");
  const answer = (status: number, body: string) =>
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(body, { status })),
    );

  it("returns a valid manifest", async () => {
    answer(200, JSON.stringify(manifest()));
    expect(await readConnectorManifest(here())).toEqual(manifest());
    expect(fetch).toHaveBeenCalledWith(
      here(),
      expect.objectContaining({ mode: "same-origin", redirect: "error" }),
    );
  });

  it("treats the app's own page with 200 as none", async () => {
    answer(200, "<!doctype html><html></html>");
    expect(await readConnectorManifest(here())).toBeNull();
  });

  it("treats a 404 as none", async () => {
    answer(404, JSON.stringify(manifest()));
    expect(await readConnectorManifest(here())).toBeNull();
  });

  it("treats a network error as none", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("offline");
      }),
    );
    expect(await readConnectorManifest(here())).toBeNull();
  });

  it("treats an invalid manifest as none", async () => {
    answer(200, JSON.stringify({ ...manifest(), version: "" }));
    expect(await readConnectorManifest(here())).toBeNull();
  });

  it("treats a huge answer as none", async () => {
    answer(200, " ".repeat(20_000) + JSON.stringify(manifest()));
    expect(await readConnectorManifest(here())).toBeNull();
  });

  it("never asks another host", async () => {
    answer(200, JSON.stringify(manifest()));
    const elsewhere = connectorManifestUrl("https://other.example.fi", "/");
    expect(await readConnectorManifest(elsewhere)).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});

const WIN_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36";
const MAC_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15";
const LINUX_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36";
const LINUX_ARM_UA = "Mozilla/5.0 (X11; Linux aarch64; rv:132.0) Firefox/132.0";
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; SM-A356B) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36";

describe("detectSystem", () => {
  it.each([
    [
      { userAgentData: { platform: "Windows" }, userAgent: WIN_UA },
      "windows",
      "x64",
    ],
    [{ platform: "Win32", userAgent: WIN_UA }, "windows", "x64"],
    [
      { userAgentData: { platform: "macOS" }, userAgent: MAC_UA },
      "macos",
      null,
    ],
    [{ platform: "MacIntel", userAgent: MAC_UA }, "macos", null],
    [
      { userAgentData: { platform: "Linux" }, userAgent: LINUX_UA },
      "linux",
      "x64",
    ],
    [{ platform: "Linux aarch64", userAgent: LINUX_ARM_UA }, "linux", "arm64"],
    [
      {
        userAgentData: { platform: "Linux" },
        platform: "Linux aarch64",
        userAgent: LINUX_UA,
      },
      "linux",
      "arm64",
    ],
    [{ userAgent: WIN_UA }, "windows", "x64"],
    [
      {
        userAgentData: { platform: "Android" },
        platform: "Linux armv8l",
        userAgent: ANDROID_UA,
      },
      null,
      null,
    ],
    [{ platform: "iPhone", userAgent: "Mozilla/5.0 (iPhone)" }, null, null],
    [{}, null, null],
  ])("reads %j", (nav, os, arch) => {
    expect(detectSystem(nav)).toEqual({ os, arch });
  });
});

describe("chooseConnectorFile", () => {
  const files = manifest().files as ConnectorFile[];
  const name = (f: ConnectorFile | null) => f?.file;
  const macX64 = {
    ...file("macos", "x64", "odmdm-connector-macos-x64.zip"),
  } as unknown as ConnectorFile;

  it("picks this system's build", () => {
    expect(
      name(chooseConnectorFile(files, { os: "windows", arch: "x64" })),
    ).toBe(FILES[0].file);
    expect(name(chooseConnectorFile(files, { os: "linux", arch: "x64" }))).toBe(
      FILES[2].file,
    );
  });

  it("never offers a Linux file of another architecture", () => {
    expect(
      name(chooseConnectorFile(files, { os: "linux", arch: "arm64" })),
    ).toBe(FILES[3].file);
    expect(name(chooseConnectorFile(files, { os: "linux", arch: null }))).toBe(
      FILES[3].file,
    );
    expect(
      chooseConnectorFile(files.slice(0, 3), { os: "linux", arch: "arm64" }),
    ).toBeNull();
  });

  it("offers x64 to Windows on ARM, never arm64 to x64", () => {
    expect(
      name(chooseConnectorFile(files, { os: "windows", arch: "arm64" })),
    ).toBe(FILES[0].file);
    const winArm = {
      ...file("windows", "arm64", "odmdm-connector-windows-arm64.exe"),
    } as unknown as ConnectorFile;
    expect(
      name(
        chooseConnectorFile([winArm, ...files], {
          os: "windows",
          arch: "arm64",
        }),
      ),
    ).toBe(winArm.file);
    expect(
      name(
        chooseConnectorFile([winArm, files[3]], { os: "windows", arch: "x64" }),
      ),
    ).toBe(FILES[3].file);
  });

  it("offers arm64 first on any Mac", () => {
    const both = [macX64, ...files];
    expect(name(chooseConnectorFile(both, { os: "macos", arch: "x64" }))).toBe(
      FILES[1].file,
    );
    expect(
      name(chooseConnectorFile([macX64], { os: "macos", arch: null })),
    ).toBe(macX64.file);
  });

  it("falls back to the file for any system", () => {
    expect(name(chooseConnectorFile(files, { os: null, arch: null }))).toBe(
      FILES[3].file,
    );
    expect(
      name(
        chooseConnectorFile(files.slice(0, 2).concat(files[3]), {
          os: "linux",
          arch: "x64",
        }),
      ),
    ).toBe(FILES[3].file);
  });

  it("falls back to the first file only when the system is unknown", () => {
    expect(
      name(chooseConnectorFile(files.slice(0, 3), { os: null, arch: null })),
    ).toBe(FILES[0].file);
  });
});

describe("connectorSystemLabel", () => {
  const files = manifest().files as ConnectorFile[];
  const mac = (arch: string) =>
    ({
      ...file("macos", arch, `odmdm-connector-macos-${arch}.zip`),
    }) as unknown as ConnectorFile;

  it("always names the Mac's processor", () => {
    expect(connectorSystemLabel(files[1], files)).toBe("macOS (Apple Silicon)");
    const both = [...files, mac("x64")];
    expect(connectorSystemLabel(both[1], both)).toBe("macOS (Apple Silicon)");
    expect(connectorSystemLabel(both[4], both)).toBe("macOS (Intel)");
    expect(connectorSystemLabel(mac("x64"), [mac("x64")])).toBe(
      "macOS (Intel)",
    );
  });

  it("always names a Linux file's architecture: it starts on no other", () => {
    expect(connectorSystemLabel(files[2], files)).toBe("Linux (x64)");
    const arm = {
      ...file("linux", "arm64", "odmdm-connector-linux-arm64.tar.gz"),
    } as unknown as ConnectorFile;
    expect(connectorSystemLabel(arm, [...files, arm])).toBe("Linux (arm64)");
  });

  it("keeps Windows plain unless it has two files, and the Python file unnamed", () => {
    expect(connectorSystemLabel(files[0], files)).toBe("Windows");
    const arm = {
      ...file("windows", "arm64", "odmdm-connector-windows-arm64.exe"),
    } as unknown as ConnectorFile;
    expect(connectorSystemLabel(arm, [...files, arm])).toBe("Windows (arm64)");
    expect(connectorSystemLabel(files[3], files)).toBeNull();
  });
});

describe("pythonCommand", () => {
  const pyz = (manifest().files as ConnectorFile[])[3];

  it("uses py on Windows and python3 elsewhere", () => {
    expect(pythonCommand(pyz, { os: "windows", arch: "x64" })).toBe(
      `py ${pyz.file}`,
    );
    expect(pythonCommand(pyz, { os: "linux", arch: "arm64" })).toBe(
      `python3 ${pyz.file}`,
    );
    expect(pythonCommand(pyz, { os: null, arch: null })).toBe(
      `python3 ${pyz.file}`,
    );
  });
});
