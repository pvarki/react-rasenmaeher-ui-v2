"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ApprovalCodeDisplay } from "@/components/waiting-room/ApprovalCodeDisplay";
import { ApprovalDetailsDrawer } from "@/components/waiting-room/ApprovalDetailsDrawer";

interface ApprovalStatusProps {
  callsign: string;
  approveCode: string;
  approvalUrl: string;
  /** When the last approval check got an answer, 0 if none has yet. */
  lastCheckedAt: number;
  failing: boolean;
  className?: string;
}

/** A failing connection is never folded away: the page could miss the approval. */
export function ApprovalStatus({
  callsign,
  approveCode,
  approvalUrl,
  lastCheckedAt,
  failing,
  className,
}: ApprovalStatusProps) {
  const { t, i18n } = useTranslation();
  const isPhone = useIsMobile();
  const [open, setOpen] = useState(false);

  const state = failing ? "failing" : lastCheckedAt ? "ok" : "connecting";
  const connection =
    state === "ok"
      ? t("waitingRoom.status.lastChecked", {
          time: new Date(lastCheckedAt).toLocaleTimeString(i18n.language),
        })
      : t("waitingRoom.status.connecting");

  const details = (
    <>
      <ApprovalCodeDisplay callsign={callsign} approveCode={approveCode} />
      <label className="block rounded-xl border border-border bg-card px-4 py-3">
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {t("waitingRoom.status.link")}
        </span>
        <input
          readOnly
          value={approvalUrl}
          onFocus={(e) => e.currentTarget.select()}
          data-testid="approval-link-field"
          className="block w-full truncate bg-transparent font-mono text-sm outline-none"
        />
      </label>
      <p className="text-center text-xs text-muted-foreground">{connection}</p>
    </>
  );

  const Chevron = isPhone ? ChevronUp : ChevronDown;

  return (
    <div
      className={cn("space-y-3", className)}
      data-testid="approval-status"
      data-state={state}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
          <span
            className={cn(
              "flex items-center gap-2",
              state === "failing"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-2 w-2 rounded-full",
                state === "ok" && "animate-pulse bg-success",
                state === "failing" && "bg-destructive",
                state === "connecting" && "animate-pulse bg-muted-foreground",
              )}
            />
            {state === "failing"
              ? t("waitingRoom.status.failing")
              : t("waitingRoom.status.waiting")}
          </span>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={isPhone ? undefined : "approval-details"}
            data-testid="approval-details-toggle"
            className={cn(
              "flex items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
              isPhone && "min-h-11 px-2",
            )}
          >
            {open && !isPhone
              ? t("waitingRoom.status.hideDetails")
              : t("waitingRoom.status.details")}
            <Chevron
              className={cn(
                "h-4 w-4 transition-transform",
                open && !isPhone && "rotate-180",
              )}
            />
          </button>
        </div>
        {isPhone && (
          <p className="text-center text-sm text-muted-foreground text-balance">
            {t("waitingRoom.status.keepOpen")}
          </p>
        )}
      </div>

      {!isPhone && open && (
        <div id="approval-details" className="space-y-2">
          {details}
        </div>
      )}

      {isPhone && (
        <ApprovalDetailsDrawer
          open={open}
          onOpenChange={setOpen}
          callsign={callsign}
          approveCode={approveCode}
          approvalUrl={approvalUrl}
          state={state}
          connection={connection}
        />
      )}
    </div>
  );
}
