"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useOwnEnrollmentStatus } from "@/hooks/api/useOwnEnrollmentStatus";
import { useCopyToClipboard } from "@/hooks/helpers/useCopyToClipboard";
import QRCode from "react-qr-code";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/waiting-room")({
  component: WaitingRoomPage,
});

function WaitingRoomPage() {
  const navigate = useNavigate();
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const { isCopied, copyError, handleCopy } = useCopyToClipboard();
  const { t } = useTranslation();

  const callsign = localStorage.getItem("callsign") ?? undefined;
  const approveCode = localStorage.getItem("approveCode") ?? undefined;

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;

  let mtlsHostname = hostname;
  if (!hostname.startsWith("mtls.")) {
    mtlsHostname = `mtls.${hostname}`;
  }

  const approvalUrl = `${protocol}//${mtlsHostname}${port ? `:${port}` : ""}/approve-user?callsign=${callsign ?? ""}&approvalcode=${approveCode ?? ""}`;

  useEffect(() => {
    if (!approveCode || !callsign) {
      navigate({ to: "/login" });
    }
  }, [approveCode, callsign, navigate]);

  const [shouldPoll, setShouldPoll] = useState(true);

  const { data: enrolled, isLoading } = useOwnEnrollmentStatus({
    refetchInterval: shouldPoll ? 5000 : false,
  });

  useEffect(() => {
    if (enrolled && shouldPoll) {
      setShouldPoll(false);
      toast.success(t("waitingRoom.approvedToast"));
      window.location.replace("/mtls-install");
    }
  }, [enrolled, shouldPoll, t]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 md:p-6">
      <div className="w-full max-w-2xl space-y-6 md:space-y-8">
        <div className="text-center space-y-3 md:space-y-4">
          <h1 className="text-sm font-medium text-muted-foreground">
            {t("waitingRoom.titleShort")}
          </h1>
          <h2 className="text-2xl md:text-3xl font-medium text-balance">
            {t("waitingRoom.title")}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground text-balance max-w-lg mx-auto leading-relaxed">
            {t("waitingRoom.description")}
          </p>
          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t("waitingRoom.checkingStatus")}</span>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
            <QRCode value={approvalUrl} bgColor="#FFFFFF" size={240} />
          </div>
        </div>

        <div className="space-y-2 bg-card border border-border rounded-xl p-4 md:p-6 text-center">
          <p className="font-semibold text-lg md:text-xl">{callsign}</p>
          <p className="text-sm text-muted-foreground pt-2">
            {t("waitingRoom.yourApprovalCodeLabel")}{" "}
            <span className="font-mono font-bold text-foreground text-base">
              {approveCode}
            </span>
          </p>
        </div>

        <Button
          onClick={() => handleCopy(approvalUrl)}
          className="w-full bg-primary hover:bg-primary/90 h-11 md:h-12 text-sm md:text-base font-medium rounded-xl relative overflow-hidden"
        >
          <span className={cn("transition-all", isCopied && "opacity-0") + " text-xs"}>
            {t("waitingRoom.copyButton")}
          </span>
          {isCopied && (
            <span className="absolute inset-0 flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              {t("waitingRoom.copied")}
            </span>
          )}
        </Button>

        {copyError && (
          <span className="text-sm text-destructive">
            {t("waitingRoom.actionFailed", { error: copyError.message })}
          </span>
        )}

        <Collapsible open={instructionsOpen} onOpenChange={setInstructionsOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-3 md:p-4 bg-card border border-border rounded-xl hover:bg-accent/30 transition-colors">
            <span className="text-xs md:text-base font-medium">
              {t("waitingRoom.instructionsTitle")}
            </span>
            <ChevronDown
              className={cn(
                "w-5 h-5 transition-transform",
                instructionsOpen && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 p-4 md:p-6 bg-card border border-border rounded-xl space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>{t("waitingRoom.instructionsText")}</p>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
