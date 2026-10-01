"use client";

import { useTranslation } from "react-i18next";

interface ApprovalCodeDisplayProps {
  callsign: string;
  approveCode: string;
}

/**
 * The approval code, shown small on purpose. Admins need the link, and when
 * the code was just as prominent people sent the code instead, which doesn't
 * work. It's still here for when an admin asks for it out loud.
 */
export function ApprovalCodeDisplay({
  callsign,
  approveCode,
}: ApprovalCodeDisplayProps) {
  const { t } = useTranslation();

  return (
    <div
      data-testid="approval-code-display"
      data-callsign={callsign}
      data-approve-code={approveCode}
      className="space-y-0.5 text-center"
    >
      <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
        {t("waitingRoom.codeLabel")}{" "}
        <span className="font-mono tracking-normal text-foreground">
          {approveCode}
        </span>
      </p>
      <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground [@media(max-height:600px)]:hidden">
        {t("waitingRoom.codeHint")}
      </p>
    </div>
  );
}
