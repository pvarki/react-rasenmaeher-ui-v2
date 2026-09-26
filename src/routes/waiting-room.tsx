import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/helpers/useCopyToClipboard";
import {
  useEnrollmentStatus,
  isUnauthorized,
} from "@/hooks/api/enrollment/useEnrollmentStatus";
import { clearToken, hasToken } from "@/hooks/api/enrollment/enrollmentToken";
import { WaitingRoomHeader } from "@/components/waiting-room/WaitingRoomHeader";
import { ApprovalCodeDisplay } from "@/components/waiting-room/ApprovalCodeDisplay";

const POLL_INTERVAL_MS = 5000;

export const Route = createFileRoute("/waiting-room")({
  component: WaitingRoomPage,
  beforeLoad: () => {
    if (!hasToken()) throw redirect({ to: "/login" });
  },
});

function WaitingRoomPage() {
  const navigate = useNavigate();
  const { isCopied, copyError, handleCopy } = useCopyToClipboard();
  const { t } = useTranslation();

  const {
    data: status,
    error,
    isLoading,
  } = useEnrollmentStatus({
    refetchInterval: ({ state }) =>
      state.data?.approved ? false : POLL_INTERVAL_MS,
  });

  useEffect(() => {
    if (isUnauthorized(error)) {
      clearToken();
      navigate({ to: "/login" });
    }
  }, [error, navigate]);

  useEffect(() => {
    if (status?.approved) {
      toast.success(t("waitingRoom.approvedToast"));
      navigate({ to: "/mtls-install" });
    }
  }, [status?.approved, navigate, t]);

  const callsign = status?.callsign ?? "";
  const approvalCode = status?.approvalCode ?? "";

  const { protocol, hostname, port } = window.location;
  const mtlsHostname = hostname.startsWith("mtls.")
    ? hostname
    : `mtls.${hostname}`;
  const approvalUrl = `${protocol}//${mtlsHostname}${port ? `:${port}` : ""}/approve-user?callsign=${callsign}&approvalcode=${approvalCode}`;

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

        <ApprovalCodeDisplay callsign={callsign} approvalCode={approvalCode} />

        <Button
          onClick={() => handleCopy(approvalUrl)}
          variant="outline"
          className="w-full bg-primary-light hover:bg-primary-light/90 h-14 md:h-12 text-sm md:text-base font-medium rounded-xl relative overflow-hidden"
        >
          <span
            className={cn("text-xs transition-all", isCopied && "opacity-0")}
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
