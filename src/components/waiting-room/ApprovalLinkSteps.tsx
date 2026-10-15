"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/helpers/useCopyToClipboard";
import { useIsMobile } from "@/hooks/use-mobile";

interface ApprovalLinkStepsProps {
  approvalUrl: string;
  callsign: string;
  className?: string;
}

export function ApprovalLinkSteps({
  approvalUrl,
  callsign,
  className,
}: ApprovalLinkStepsProps) {
  const { t } = useTranslation();
  const isPhone = useIsMobile();
  const { isCopied, copyError, handleCopy } = useCopyToClipboard();
  // isCopied resets after two seconds; the steps should stay moved on.
  const [hasCopied, setHasCopied] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    if (isCopied) setHasCopied(true);
  }, [isCopied]);

  const canShare = isPhone && typeof navigator.share === "function";
  const current = hasShared ? 2 : hasCopied ? 1 : 0;
  const used = isPhone && (hasShared || hasCopied);

  const send = async () => {
    if (canShare) {
      try {
        // iOS drops `url` when copying if `text` is also set.
        await navigator.share({
          title: t("waitingRoom.remote.phone.shareTitle"),
          text: `${t("waitingRoom.remote.phone.shareText", { callsign })}\n\n${approvalUrl}`,
        });
        setHasShared(true);
        return;
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
      }
    }
    handleCopy(approvalUrl);
  };

  const sendStep = !isPhone
    ? t("waitingRoom.remote.steps.send")
    : canShare && !(hasCopied && !hasShared)
      ? t("waitingRoom.remote.phone.pickApp")
      : t("waitingRoom.remote.phone.paste");

  let icon = <Copy className="h-5 w-5" />;
  let label = t("waitingRoom.remote.copy");
  if (isCopied) {
    icon = <Check className="h-5 w-5" />;
    label = t("waitingRoom.remote.copied");
  } else if (canShare) {
    icon = <Share2 className="h-5 w-5" />;
    label = used
      ? t("waitingRoom.remote.phone.sendAgain")
      : t("waitingRoom.remote.phone.send");
  } else if (used) {
    label = t("waitingRoom.remote.phone.copyAgain");
  }

  return (
    <div className={cn("space-y-2", className)}>
      <ol
        className="space-y-3"
        data-testid="approval-link-steps"
        data-step={current}
      >
        <Step n={1} current={current}>
          <button
            type="button"
            onClick={() => void send()}
            data-testid="copy-approval-link"
            data-copied={isCopied ? "true" : "false"}
            data-shared={hasShared ? "true" : "false"}
            className={cn(
              "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-base font-bold transition-colors",
              isCopied
                ? "bg-success/20 text-success"
                : used
                  ? "border border-border text-muted-foreground hover:bg-muted"
                  : "bg-primary-light text-foreground hover:bg-primary-light/80",
            )}
          >
            {icon}
            {label}
          </button>
        </Step>
        <Step n={2} current={current}>
          {sendStep}
        </Step>
        {!isPhone && (
          <Step n={3} current={current}>
            {t("waitingRoom.remote.steps.wait")}
          </Step>
        )}
      </ol>

      {copyError && (
        <p role="status" className="text-center text-sm text-destructive">
          {t("waitingRoom.actionFailed", { error: copyError.message })}
        </p>
      )}
    </div>
  );
}

interface StepProps {
  /** 1-based position. */
  n: number;
  /** 0-based index of the step the user is on. */
  current: number;
  className?: string;
  children: ReactNode;
}

function Step({ n, current, className, children }: StepProps) {
  const done = n - 1 < current;
  const active = n - 1 === current;

  return (
    <li
      className={cn("flex items-center gap-3", className)}
      aria-current={active ? "step" : undefined}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
          done && "bg-success/15 text-success",
          active && "bg-primary-light text-foreground",
          !done && !active && "bg-muted text-muted-foreground",
        )}
      >
        {done ? <Check className="h-4 w-4" /> : n}
      </span>
      {typeof children === "string" ? (
        <span
          className={cn(
            "text-base transition-colors",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {children}
        </span>
      ) : (
        children
      )}
    </li>
  );
}
