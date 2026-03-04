/**
 * Utility to conditionally join class names together.  Filters out
 * falsy values (e.g. undefined, null, false) and joins the rest
 * with spaces.  Similar to the `clsx` package.
 */
export function cn(
  ...classes: Array<string | false | undefined | null>
): string {
  return classes.filter(Boolean).join(" ");
}

// Encode a string to base64, making it URL-safe by replacing + with - and / with _,
export function encodeToBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch {
    return str;
  }
}

export function withReturnParams(
  exitUrl: string,
  label = "Deploy App",
): string {
  try {
    const url = new URL(exitUrl);
    url.searchParams.set("returnUrl", encodeToBase64(window.location.origin));
    url.searchParams.set("returnLabel", encodeToBase64(label));
    return url.toString();
  } catch {
    return exitUrl;
  }
}
