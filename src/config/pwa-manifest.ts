const MANIFEST_URL = "/manifest.json";

/** Same derivation as the document title in index.html. */
export const getDeploymentName = (): string =>
  window.location.hostname.replace(/^mtls\./, "").split(".")[0];

/**
 * Attach the PWA manifest, named after this deployment.
 *
 * One image serves every deployment, so the build cannot know the name — we
 * patch the served manifest in the browser and hand Chrome a blob copy.
 *
 * ponytail: every URL has to be absolutised, because relative ones would
 * resolve against the blob: URL instead of the origin. If a serving mode ever
 * gains per-request templating, generate the manifest there and drop this.
 */
export async function attachManifest(): Promise<void> {
  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = MANIFEST_URL;

  try {
    const response = await fetch(MANIFEST_URL);
    if (!response.ok) throw new Error(`manifest ${response.status}`);
    const manifest = (await response.json()) as Record<string, unknown>;
    const name = getDeploymentName();

    const absolute = (url: string) => new URL(url, window.location.origin).href;
    const absoluteSrc = (entries: unknown) =>
      (Array.isArray(entries) ? entries : []).map((entry) => ({
        ...entry,
        src: absolute(entry.src),
      }));

    const patched = {
      ...manifest,
      name,
      short_name: name,
      id: absolute((manifest.id as string) ?? "/"),
      start_url: absolute((manifest.start_url as string) ?? "/"),
      scope: absolute((manifest.scope as string) ?? "/"),
      icons: absoluteSrc(manifest.icons),
      screenshots: absoluteSrc(manifest.screenshots),
      protocol_handlers: (
        (manifest.protocol_handlers as { url: string }[]) ?? []
      ).map((handler) => ({ ...handler, url: absolute(handler.url) })),
    };

    link.href = URL.createObjectURL(
      new Blob([JSON.stringify(patched)], {
        type: "application/manifest+json",
      }),
    );
  } catch {
    console.debug(
      "Serving the manifest unpatched, without the deployment name",
    );
  }

  document.head.appendChild(link);
}
