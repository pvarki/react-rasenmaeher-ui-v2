import { useCallback, useState } from "react";
import { CopyToClipboard } from "./CopyToClipboard";

export type ShareOutcome = "shared" | "copied" | "dismissed";

interface SharePayload {
  url: string;
  title?: string;
  text?: string;
}

/**
 * Hands a link to the platform share sheet when there is one, and falls back to
 * the clipboard when there is not. The share sheet is preferred because it lists
 * the messaging apps the user actually has installed, which explains "send this
 * to your admin" better than any copy we could write.
 */
export function useShareOrCopy() {
  const [outcome, setOutcome] = useState<ShareOutcome | null>(null);
  const [copyError, setCopyError] = useState<Error | null>(null);

  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const share = useCallback(
    async ({ url, title, text }: SharePayload) => {
      setCopyError(null);
      if (canShare) {
        try {
          await navigator.share({ url, title, text });
          setOutcome("shared");
          return;
        } catch (error) {
          // Dismissing the sheet is a choice, not a failure, so leave the
          // button alone and let the user try again.
          if ((error as Error)?.name === "AbortError") {
            setOutcome("dismissed");
            return;
          }
          // Anything else means the sheet did not work here; copying still does.
        }
      }

      // Only report "copied" once the clipboard write has actually succeeded.
      // navigator.clipboard is missing on plain http, which throws before the
      // promise exists, so that case goes through the same error path.
      const onError = (error: unknown) => {
        setOutcome(null);
        setCopyError(error as Error);
      };
      try {
        CopyToClipboard(url, () => setOutcome("copied"), onError);
      } catch (error) {
        onError(error);
      }
    },
    [canShare],
  );

  return { canShare, share, outcome, copyError };
}
