"use client";

import { useTranslation } from "react-i18next";

interface ApprovalCodeDisplayProps {
  callsign: string;
  approveCode: string;
}

/**
 * Callsign and approval code as text, big enough to read off the screen. This
 * is the way in when there is no camera to scan the QR code, and it shows the
 * user the callsign they will later use as the certificate password.
 */
export function ApprovalCodeDisplay({
  callsign,
  approveCode,
}: ApprovalCodeDisplayProps) {
  const { t } = useTranslation();

  return (
    <dl
      data-testid="approval-code-display"
      data-callsign={callsign}
      data-approve-code={approveCode}
      className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card px-4 py-3"
    >
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {t("waitingRoom.callsignLabel")}
        </dt>
        <dd className="truncate font-mono text-xl font-bold">{callsign}</dd>
      </div>
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {t("waitingRoom.codeLabel")}
        </dt>
        <dd className="truncate font-mono text-xl font-bold">{approveCode}</dd>
      </div>
    </dl>
  );
}
