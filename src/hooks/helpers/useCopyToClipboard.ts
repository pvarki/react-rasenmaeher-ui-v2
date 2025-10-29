import { useCallback, useState } from "react";
import { CopyToClipboard } from "./CopyToClipboard"; // Adjust the path as necessary

export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState<Error | null>(null);

  const handleCopy = useCallback((text: string) => {
    CopyToClipboard(
      text,
      () => {
        setIsCopied(true);
        setCopyError(null);
        // Optionally reset the copied status after a certain delay
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      },
      (error: unknown) => {
        setIsCopied(false);
        setCopyError(error as Error);
      },
    );
  }, []);

  return { isCopied, copyError, handleCopy };
}
