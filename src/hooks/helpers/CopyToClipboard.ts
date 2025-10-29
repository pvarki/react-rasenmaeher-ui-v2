export function CopyToClipboard(
  text: string,
  onSuccess: () => void,
  onError: (reason: unknown) => void,
) {
  navigator.clipboard.writeText(text).then(onSuccess).catch(onError);
}
