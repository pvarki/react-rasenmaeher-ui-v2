"use client";

import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/helpers/useCopyToClipboard";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface ApprovalDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callsign: string;
  approveCode: string;
  approvalUrl: string;
  state: "ok" | "failing" | "connecting";
  connection: string;
}

export function ApprovalDetailsDrawer({
  open,
  onOpenChange,
  callsign,
  approveCode,
  approvalUrl,
  state,
  connection,
}: ApprovalDetailsDrawerProps) {
  const { t } = useTranslation();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        data-testid="approval-details-drawer"
        className="rounded-t-2xl border-border bg-card"
        overlayClassName="bg-black/70 backdrop-blur-sm"
      >
        <DrawerHeader className="px-5 pb-3 text-left!">
          <DrawerTitle className="text-xl font-bold">
            {t("waitingRoom.status.details")}
          </DrawerTitle>
          <DrawerDescription>
            {t("waitingRoom.status.detailsHint")}
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3 px-5">
          <dl
            data-testid="approval-code-display"
            data-callsign={callsign}
            data-approve-code={approveCode}
            className="divide-y divide-border rounded-xl border border-border bg-background"
          >
            <DetailRow
              label={t("waitingRoom.callsignLabel")}
              value={callsign}
            />
            <DetailRow
              label={t("waitingRoom.codeLabel")}
              value={approveCode}
              valueClassName="text-primary"
            />
            <DetailRow
              label={t("waitingRoom.status.link")}
              value={approvalUrl}
              valueClassName="text-sm font-normal text-muted-foreground"
            />
          </dl>

          <p
            className={cn(
              "flex items-center justify-center gap-2 text-xs",
              state === "failing"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                state === "ok" && "bg-success",
                state === "failing" && "bg-destructive",
                state === "connecting" && "animate-pulse bg-muted-foreground",
              )}
            />
            {state === "failing" ? t("waitingRoom.status.failing") : connection}
          </p>
        </div>

        <DrawerFooter className="px-5 pb-6">
          <DrawerClose className="h-12 rounded-xl bg-muted text-base font-bold transition-colors hover:bg-muted/70">
            {t("waitingRoom.status.close")}
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  const { t } = useTranslation();
  const { isCopied, handleCopy } = useCopyToClipboard();

  return (
    <div className="flex items-center gap-3 py-3 pl-4 pr-2">
      <div className="min-w-0 flex-1">
        <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </dt>
        <dd
          className={cn("truncate font-mono text-xl font-bold", valueClassName)}
        >
          {value}
        </dd>
      </div>
      <button
        type="button"
        onClick={() => handleCopy(value)}
        aria-label={`${t("waitingRoom.status.copy")}: ${label}`}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors",
          isCopied
            ? "text-success"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {isCopied ? (
          <Check className="h-5 w-5" />
        ) : (
          <Copy className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
