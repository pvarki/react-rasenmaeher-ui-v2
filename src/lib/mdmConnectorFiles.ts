/**
 * The ODMDM connector's downloads, when a deployment serves them beside the UI in
 * `mdm-connector/`. Its `connector.json` is read from this origin only and trusted
 * for nothing: any field that is not exactly as expected drops the whole manifest.
 */

export type ConnectorOs = "windows" | "macos" | "linux" | "any";
export type ConnectorArch = "x64" | "arm64" | "any";

export interface ConnectorMdm {
  /** Short code, e.g. `fleet` */
  name: string;
  /** Shown to the operator, e.g. `Fleet` */
  title: string;
}

export interface ConnectorFile {
  os: ConnectorOs;
  arch: ConnectorArch;
  /** Bare file name in the manifest's own folder */
  file: string;
  /** Bytes */
  size: number;
  /** Lower-case hex of the file as served */
  sha256: string;
}

export interface ConnectorManifest {
  version: string;
  mdms: ConnectorMdm[];
  files: ConnectorFile[];
}

export const CONNECTOR_MANIFEST_PATH = "mdm-connector/connector.json";

const OSES: readonly string[] = ["windows", "macos", "linux", "any"];
const ARCHES: readonly string[] = ["x64", "arm64", "any"];
const MAX_MDMS = 20;
const MAX_FILES = 12;
/** A manifest is a few hundred bytes; anything far larger is not one */
const MAX_MANIFEST_BYTES = 16_384;
/** Larger than any one-file build of a small tool should ever be */
const MAX_FILE_BYTES = 500_000_000;

const VERSION = /^[A-Za-z0-9.+-]{1,40}$/;
const MDM_NAME = /^[a-z0-9][a-z0-9-]{0,31}$/;
// Letters, digits, spaces and a little punctuation: nothing that reads as markup or a link
const MDM_TITLE = /^[\p{L}\p{N}][\p{L}\p{N} .()&+-]{0,39}$/u;
// The contract's pattern, minus a leading dot so `.` and `..` can never be a name
const FILE_NAME = /^[A-Za-z0-9_+-][A-Za-z0-9._+-]{0,119}$/;
const SHA256 = /^[0-9a-f]{64}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactly(value: Record<string, unknown>, keys: string[]): boolean {
  const own = Object.keys(value);
  return (
    own.length === keys.length && keys.every((key) => Object.hasOwn(value, key))
  );
}

function matches(value: unknown, pattern: RegExp): value is string {
  return typeof value === "string" && pattern.test(value);
}

function validMdm(value: unknown): value is ConnectorMdm {
  return (
    isRecord(value) &&
    hasExactly(value, ["name", "title"]) &&
    matches(value.name, MDM_NAME) &&
    matches(value.title, MDM_TITLE)
  );
}

function validFile(value: unknown): value is ConnectorFile {
  return (
    isRecord(value) &&
    hasExactly(value, ["os", "arch", "file", "size", "sha256"]) &&
    typeof value.os === "string" &&
    OSES.includes(value.os) &&
    typeof value.arch === "string" &&
    ARCHES.includes(value.arch) &&
    matches(value.file, FILE_NAME) &&
    Number.isSafeInteger(value.size) &&
    (value.size as number) > 0 &&
    (value.size as number) <= MAX_FILE_BYTES &&
    matches(value.sha256, SHA256)
  );
}

function unique(values: string[]): boolean {
  return new Set(values).size === values.length;
}

/** The manifest exactly as the contract says, or null on any surprise. */
export function validateConnectorManifest(
  value: unknown,
): ConnectorManifest | null {
  if (
    !isRecord(value) ||
    !hasExactly(value, ["version", "mdms", "files"]) ||
    !matches(value.version, VERSION) ||
    !Array.isArray(value.mdms) ||
    !Array.isArray(value.files) ||
    value.mdms.length < 1 ||
    value.mdms.length > MAX_MDMS ||
    value.files.length < 1 ||
    value.files.length > MAX_FILES ||
    !value.mdms.every(validMdm) ||
    !value.files.every(validFile)
  ) {
    return null;
  }
  const mdms = value.mdms as ConnectorMdm[];
  const files = value.files as ConnectorFile[];
  if (
    !unique(mdms.map((mdm) => mdm.name)) ||
    !unique(files.map((file) => file.file)) ||
    !unique(files.map((file) => `${file.os}/${file.arch}`))
  ) {
    return null;
  }
  // Copied field by field, so nothing else from the server travels on
  return {
    version: value.version,
    mdms: mdms.map(({ name, title }) => ({ name, title })),
    files: files.map(({ os, arch, file, size, sha256 }) => ({
      os,
      arch,
      file,
      size,
      sha256,
    })),
  };
}

/** Where this deployment serves the manifest: the UI's own origin and base. */
export function connectorManifestUrl(
  origin: string = window.location.origin,
  base: string = import.meta.env.BASE_URL,
): URL {
  return new URL(CONNECTOR_MANIFEST_PATH, new URL(base, origin));
}

/** A file's link: the manifest's folder, the name percent-encoded. */
export function connectorFileUrl(manifestUrl: URL, file: string): string {
  return new URL(encodeURIComponent(file), manifestUrl).href;
}

/**
 * Reads the manifest, or null when the deployment has none. A deployment without
 * the files may answer with the app's own page and 200, so anything that does not
 * parse and validate counts as none.
 */
export async function readConnectorManifest(
  url: URL = connectorManifestUrl(),
): Promise<ConnectorManifest | null> {
  if (url.origin !== window.location.origin) return null;
  try {
    const res = await fetch(url, {
      mode: "same-origin",
      credentials: "same-origin",
      redirect: "error",
      cache: "no-cache",
    });
    if (res.status !== 200) return null;
    const text = await res.text();
    if (text.length > MAX_MANIFEST_BYTES) return null;
    return validateConnectorManifest(JSON.parse(text));
  } catch {
    return null;
  }
}

export interface BrowserSystem {
  os: ConnectorOs | null;
  /** Null when the browser does not tell */
  arch: ConnectorArch | null;
}

/** What the browser says about this computer, in the manifest's words. */
export function detectSystem(nav: {
  userAgentData?: { platform?: string };
  platform?: string;
  userAgent?: string;
}): BrowserSystem {
  const hint = nav.userAgentData?.platform || nav.platform || "";
  const ua = nav.userAgent ?? "";
  // Chrome freezes its user agent to "Linux x86_64"; navigator.platform still
  // tells arm64, so it is read for the architecture even beside userAgentData
  const said = `${hint} ${nav.platform ?? ""} ${ua}`;
  // Phones and tablets cannot run the connector, whatever else they claim
  if (/Android|iPhone|iPad|iPod|CrOS|Chrome OS/i.test(said)) {
    return { os: null, arch: null };
  }
  const os: ConnectorOs | null = /^Win|Windows/i.test(hint || ua)
    ? "windows"
    : /^Mac|macOS|Macintosh/i.test(hint || ua)
      ? "macos"
      : /Linux|X11/i.test(hint || ua)
        ? "linux"
        : null;
  const arch: ConnectorArch | null = /aarch64|arm64|armv8/i.test(said)
    ? "arm64"
    : /x86_64|x64|amd64|Win64|WOW64/i.test(said)
      ? "x64"
      : null;
  return { os, arch };
}

/**
 * The file this computer should download first, never one that cannot run on
 * it. Linux takes only its own architecture, Windows on ARM also runs x64, and
 * a browser cannot tell an Apple Silicon Mac from an Intel one, so on macOS
 * arm64 comes first. Falls back to the file for any system; with no system
 * known, to the first one listed.
 */
export function chooseConnectorFile(
  files: ConnectorFile[],
  system: BrowserSystem,
): ConnectorFile | null {
  const archs: Record<ConnectorOs, ConnectorArch[]> = {
    macos: ["arm64", "x64", "any"],
    windows: system.arch === "arm64" ? ["arm64", "x64", "any"] : ["x64", "any"],
    linux: system.arch ? [system.arch, "any"] : ["any"],
    any: [],
  };
  for (const arch of system.os ? archs[system.os] : []) {
    const found = files.find((f) => f.os === system.os && f.arch === arch);
    if (found) return found;
  }
  const any = files.find((file) => file.os === "any");
  if (any || system.os) return any ?? null;
  return files[0] ?? null;
}

/**
 * The system a file is for, as the reader sees it. A Mac file always names its
 * processor, because the browser cannot tell the two Macs apart, and a Linux
 * file its architecture, because it starts on no other. Windows names one only
 * when there are two files to choose from: Windows on ARM runs x64 programs.
 */
export function connectorSystemLabel(
  file: ConnectorFile,
  files: ConnectorFile[],
): string | null {
  if (file.os === "any") return null;
  const name = OS_NAMES[file.os];
  if (file.os === "macos" && file.arch !== "any")
    return `${name} (${MAC_ARCH[file.arch]})`;
  if (file.os === "linux" && file.arch !== "any")
    return `${name} (${file.arch})`;
  if (files.filter((f) => f.os === file.os).length < 2) return name;
  return `${name} (${file.arch})`;
}

/** The command that starts the file for any system on this computer. */
export function pythonCommand(file: ConnectorFile, system: BrowserSystem) {
  return `${system.os === "windows" ? "py" : "python3"} ${file.file}`;
}

const OS_NAMES = { windows: "Windows", macos: "macOS", linux: "Linux" };
const MAC_ARCH = { arm64: "Apple Silicon", x64: "Intel" };
