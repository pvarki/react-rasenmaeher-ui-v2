const MANIFEST_URL = "/manifest.json";

interface SourcedEntry {
  src: string;
  [key: string]: unknown;
}

interface WebManifest {
  id?: string;
  start_url?: string;
  scope?: string;
  icons?: SourcedEntry[];
  screenshots?: SourcedEntry[];
  protocol_handlers?: { url: string; [key: string]: unknown }[];
  [key: string]: unknown;
}

/** Same derivation as the document title in index.html. */
export const deploymentNameFrom = (hostname: string): string =>
  hostname.replace(/^mtls\./, "").split(".")[0];

export const getDeploymentName = (): string =>
  deploymentNameFrom(window.location.hostname);

/**
 * Name the manifest after this deployment, and make every URL in it absolute.
 *
 * ponytail: the absolutising is not decoration. The patched copy is served to
 * the browser from a blob: URL, and relative URLs in it would resolve against
 * that blob rather than the origin, which breaks the scope check and with it
 * installability.
 */
export function patchManifest(
  manifest: WebManifest,
  name: string,
  origin: string,
): WebManifest {
  const absolute = (url: string) => new URL(url, origin).href;
  const absoluteSrc = (entries: SourcedEntry[] | undefined) =>
    (entries ?? []).map((entry) => ({ ...entry, src: absolute(entry.src) }));

  return {
    ...manifest,
    name,
    short_name: name,
    id: absolute(manifest.id ?? "/"),
    start_url: absolute(manifest.start_url ?? "/"),
    scope: absolute(manifest.scope ?? "/"),
    icons: absoluteSrc(manifest.icons),
    screenshots: absoluteSrc(manifest.screenshots),
    protocol_handlers: (manifest.protocol_handlers ?? []).map((handler) => ({
      ...handler,
      url: absolute(handler.url),
    })),
  };
}

/**
 * Attach the PWA manifest, named after this deployment.
 *
 * One image serves every deployment, so the build cannot know the name — we
 * patch the served manifest in the browser and hand the result over as a blob.
 * If a serving mode ever gains per-request templating, generate the manifest
 * there and drop this.
 */
export async function attachManifest(): Promise<void> {
  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = MANIFEST_URL;

  try {
    const response = await fetch(MANIFEST_URL);
    if (!response.ok) throw new Error(`manifest ${response.status}`);
    const patched = patchManifest(
      (await response.json()) as WebManifest,
      getDeploymentName(),
      window.location.origin,
    );
    link.href = URL.createObjectURL(
      new Blob([JSON.stringify(patched)], {
        type: "application/manifest+json",
      }),
    );
  } catch {
    // An unnamed manifest still installs; no manifest at all does not.
    console.debug(
      "Serving the manifest unpatched, without the deployment name",
    );
  }

  document.head.appendChild(link);
}
