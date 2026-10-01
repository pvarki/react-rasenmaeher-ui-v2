"use client";

import { useTranslation } from "react-i18next";
import { formatElapsed, useElapsed } from "@/hooks/helpers/useElapsed";

interface ApprovalStatusProps {
  polling: boolean;
}

/**
 * A ticking counter so the user can see the page is still polling. A screen
 * where nothing moves looks broken.
 */
export function ApprovalStatus({ polling }: ApprovalStatusProps) {
  const { t } = useTranslation();
  const seconds = useElapsed(polling);

  return (
    <div
      className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
      data-testid="approval-status"
      data-elapsed-seconds={seconds}
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-info" />
      </span>
      <span>
        {t("waitingRoom.checking")} · {formatElapsed(seconds)}
      </span>
    </div>
  );
}
