/**
 * Fetch the Apple configuration profile by navigating to it.
 *
 * This cannot use downloadBlob like the PFX does. iOS and macOS only hand a .mobileconfig to
 * the profile installer when the browser itself navigates to the URL and sees the response
 * content type; a blob: URL has no response headers, so the profile would just land in Files.
 *
 * A navigation carries no Authorization header, so the JWT cookie has to carry the auth. The
 * cookie is minted unconditionally: people enrolled with an admin code never had one at all,
 * and it is httpOnly, so the page cannot inspect it to decide.
 */
export async function downloadProfile(url: string): Promise<void> {
  const jwt = localStorage.getItem("token");
  const res = await fetch("/api/v1/enduserpfx/session", {
    method: "POST",
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
  });
  if (!res.ok) {
    throw new Error(`Could not start the download (${res.status})`);
  }
  window.location.href = url;
}

/** The profile URL for a callsign, matching the .pfx and .pem naming. */
export function profileUrl(callsign: string, deployment: string): string {
  return `/api/v1/enduserpfx/${callsign}_${deployment}.mobileconfig`;
}
