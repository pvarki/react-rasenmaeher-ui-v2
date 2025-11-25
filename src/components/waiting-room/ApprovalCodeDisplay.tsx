"use client";

import { useTranslation } from "react-i18next";

interface ApprovalCodeDisplayProps {
  callsign: string;
  approveCode: string;
}

export function ApprovalCodeDisplay({
  callsign,
  approveCode,
}: ApprovalCodeDisplayProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 bg-card border border-border rounded-xl p-4 md:p-6 text-center">
      <p className="font-semibold text-lg md:text-xl">{callsign}</p>
      <p className="text-sm text-muted-foreground pt-2">
        {t("waitingRoom.yourApprovalCodeLabel")}{" "}
        <span className="font-mono font-bold text-foreground text-base">
          {approveCode}
        </span>
      </p>
    </div>
  );
}
