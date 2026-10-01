"use client";

import { Fragment } from "react";
import QRCode from "react-qr-code";
import { Check, Link2, MessageSquare, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useShareOrCopy } from "@/hooks/helpers/useShareOrCopy";

interface HandoffRoutesProps {
  approvalUrl: string;
  callsign?: string;
}

function Branch({
  label,
  tone = "default",
  grow = false,
  children,
}: {
  label: string;
  tone?: "default" | "success";
  /** Takes the height left over on the screen. */
  grow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border bg-card p-4",
        tone === "success" ? "border-success" : "border-border",
        grow && "min-h-0 flex-1",
      )}
      data-testid={`handoff-branch-${tone}`}
    >
      <p className="text-sm font-bold uppercase tracking-[0.1em] text-primary">
        {label}
      </p>
      {children}
    </div>
  );
}

/** Copy the link, send it in a chat, they tap it. Drawn as icons, not written out. */
function SendStrip() {
  const { t } = useTranslation();
  const panels = [
    { icon: Link2, label: t("waitingRoom.strip.link"), tone: "text-primary" },
    {
      icon: MessageSquare,
      label: t("waitingRoom.strip.chat"),
      tone: "text-primary",
    },
    { icon: Check, label: t("waitingRoom.strip.tap"), tone: "text-success" },
  ];

  return (
    <div
      className="flex w-full items-center gap-1.5 [@media(max-height:780px)]:hidden"
      data-testid="send-strip"
    >
      {panels.map(({ icon: Icon, label, tone }, i) => (
        <Fragment key={label}>
          <div className="flex flex-1 flex-col items-center gap-1.5 rounded-lg border border-border bg-background py-3">
            <Icon className={cn("h-6 w-6", tone)} />
            <span className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              {label}
            </span>
          </div>
          {i < panels.length - 1 && (
            <span className="text-sm text-muted-foreground" aria-hidden="true">
              &gt;
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}

export function HandoffRoutes({ approvalUrl, callsign }: HandoffRoutesProps) {
  const { t } = useTranslation();
  const { canShare, share, outcome, copyError } = useShareOrCopy();

  const handed = outcome === "shared" || outcome === "copied";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Branch label={t("waitingRoom.routes.present")} grow>
        {/* Square, and as tall as the leftover space allows. The floor keeps
            it scannable on the shortest phones; the cap stops it looking like
            a poster on tablets. */}
        <div className="flex min-h-[7.5rem] w-full flex-1 items-center justify-center">
          <div
            className="aspect-square h-full max-h-72 rounded-lg bg-white p-2"
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
        </div>
        <p className="text-lg [@media(max-height:600px)]:hidden">
          {t("waitingRoom.routes.showThem")}
        </p>
      </Branch>

      <div className="flex items-center gap-2.5">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
          {t("waitingRoom.routes.or")}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Branch
        label={t("waitingRoom.routes.away")}
        tone={outcome === "copied" ? "success" : "default"}
      >
        <SendStrip />

        <button
          type="button"
          onClick={() =>
            void share({
              url: approvalUrl,
              title: t("waitingRoom.share.title"),
              text: t("waitingRoom.share.text", { callsign: callsign ?? "" }),
            })
          }
          data-testid="handoff-send-button"
          data-share-outcome={outcome ?? ""}
          className={cn(
            "flex h-16 w-full items-center justify-center gap-2.5 rounded-xl border text-lg font-bold uppercase tracking-[0.04em] transition-colors",
            outcome === "copied"
              ? "border-success bg-success text-background"
              : "border-primary bg-primary-light text-primary-foreground hover:bg-primary-light/90",
          )}
        >
          {outcome === "copied" ? (
            <>
              <Check className="h-6 w-6" />
              {t("waitingRoom.share.copied")}
            </>
          ) : (
            <>
              <Share2 className="h-6 w-6" />
              {t("waitingRoom.share.send")}
            </>
          )}
        </button>

        <p
          className={cn(
            "text-center text-xs uppercase tracking-[0.06em] [@media(max-height:600px)]:hidden",
            outcome === "copied" ? "text-success" : "text-muted-foreground",
          )}
        >
          {outcome === "copied"
            ? t("waitingRoom.share.thenSend")
            : canShare
              ? t("waitingRoom.share.opensApps")
              : t("waitingRoom.share.willCopy")}
        </p>

        {copyError && (
          <p className="text-center text-xs text-destructive">
            {t("waitingRoom.actionFailed", { error: copyError.message })}
          </p>
        )}
      </Branch>

      <span className="sr-only" data-testid="handoff-handed">
        {handed ? "handed" : "pending"}
      </span>
    </div>
  );
}
