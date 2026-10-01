export function CopyToClipboard(
  text: string,
  onSuccess: () => void,
  onError: (reason: unknown) => void,
) {
  // navigator.clipboard is missing on plain http. Report that through onError
  // instead of throwing before the promise exists.
  if (!navigator.clipboard) {
    onError(new Error("Clipboard is not available"));
    return;
  }
  navigator.clipboard.writeText(text).then(onSuccess).catch(onError);
}
