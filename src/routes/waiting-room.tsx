"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useOwnEnrollmentStatus } from "@/hooks/api/useOwnEnrollmentStatus";
import { useCopyToClipboard } from "@/hooks/helpers/useCopyToClipboard";
import QRCode from "react-qr-code";
import { useTranslation } from "react-i18next";
import { WaitingRoomHeader } from "@/components/waiting-room/WaitingRoomHeader";
import { ApprovalCodeDisplay } from "@/components/waiting-room/ApprovalCodeDisplay";
export const Route = createFileRoute("/waiting-room")({
  component: WaitingRoomPage,
});

function WaitingRoomPage() {
  const navigate = useNavigate();
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
      <div className="w-full max-w-2xl space-y-6 md:space-y-8 mt-8">
        <WaitingRoomHeader
          isLoading={isLoading}
          appDesc={t("waitingRoom.description")}
        />

        <div className="flex justify-center">
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
            <QRCode value={approvalUrl} bgColor="#FFFFFF" size={240} />
          </div>
        </div>

        <ApprovalCodeDisplay
          callsign={callsign || ""}
          approveCode={approveCode || ""}
        />

        <Button
          onClick={() => handleCopy(approvalUrl)}
          variant={"outline"}
          className="w-full bg-primary-light hover:bg-primary-light/90 h-14 md:h-12 text-sm md:text-base font-medium rounded-xl relative overflow-hidden"
        >
          <span
            className={
              cn("transition-all", isCopied && "opacity-0") + " text-xs"
            }
          >
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
      </div>
    </div>
  );
}
