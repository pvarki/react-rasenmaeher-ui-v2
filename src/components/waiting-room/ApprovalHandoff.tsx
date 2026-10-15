"use client";

import QRCode from "react-qr-code";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ApprovalLinkSteps } from "@/components/waiting-room/ApprovalLinkSteps";

interface ApprovalHandoffProps {
  approvalUrl: string;
  callsign: string;
  className?: string;
}

const optionTitle =
  "text-center text-lg font-bold leading-tight text-foreground text-balance md:text-xl";

export function ApprovalHandoff({
  approvalUrl,
  callsign,
  className,
}: ApprovalHandoffProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6",
        className,
      )}
    >
      <section
        aria-labelledby="approval-present"
        className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 md:p-6"
      >
        <h2 id="approval-present" className={optionTitle}>
          {t("waitingRoom.present.title")}
        </h2>
        <div
          className="aspect-square w-40 rounded-lg bg-white p-2 md:w-full md:max-w-64"
          data-testid="approval-qr"
        >
          <QRCode
            value={approvalUrl}
            bgColor="#FFFFFF"
            size={256}
            style={{ width: "100%", height: "100%" }}
            viewBox="0 0 256 256"
          />
        </div>
        <p className="text-base">{t("waitingRoom.present.caption")}</p>
      </section>

      <div
        aria-hidden="true"
        className="flex items-center gap-3 text-xs uppercase tracking-[0.1em] text-muted-foreground md:flex-col"
      >
        <span className="h-px flex-1 bg-border md:w-px" />
        {t("waitingRoom.or")}
        <span className="h-px flex-1 bg-border md:w-px" />
      </div>

      <section
        aria-labelledby="approval-remote"
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:p-6"
      >
        <h2 id="approval-remote" className={optionTitle}>
          {t("waitingRoom.remote.title")}
        </h2>
        <div className="flex flex-col md:flex-1 md:justify-center">
          <ApprovalLinkSteps approvalUrl={approvalUrl} callsign={callsign} />
        </div>
      </section>
    </div>
  );
}
