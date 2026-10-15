/** The three screens of the guided install, in order. */
export const CERT_STEPS = ["download", "install", "done"] as const;

/** macOS adds a Keychain step between installing and signing in. */
export const MAC_STEPS = ["download", "install", "keychain", "done"] as const;

/** Firefox on Windows keeps its own certificate store, so it gets an import step. */
export const WIN_FIREFOX_STEPS = [
  "download",
  "install",
  "firefox",
  "done",
] as const;
