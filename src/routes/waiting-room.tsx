"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useOwnEnrollmentStatus } from "@/hooks/api/useOwnEnrollmentStatus";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";
import { CompactHeader } from "@/components/CompactHeader";
import { HandoffRoutes } from "@/components/waiting-room/HandoffRoutes";
import { ApprovalStatus } from "@/components/waiting-room/ApprovalStatus";
import { ApprovalCodeDisplay } from "@/components/waiting-room/ApprovalCodeDisplay";

export const Route = createFileRoute("/waiting-room")({
  component: WaitingRoomPage,
});

function WaitingRoomPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { deployment } = useHealthCheck();

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

  const { data: enrolled } = useOwnEnrollmentStatus({
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
    <div
      data-testid="waiting-room-page"
      className="flex h-dvh flex-col bg-background px-4 pb-4 pt-4"
    >
      {/* Exactly one screen: the QR takes whatever height is left, so a tall
          phone gets a bigger code and a short one never has to scroll. */}
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col gap-4">
        <CompactHeader deployment={deployment} />

        <div className="space-y-1">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-balance [@media(max-height:640px)]:text-2xl">
            {t("waitingRoom.title")}
          </h1>
          <p className="text-lg leading-snug text-muted-foreground [@media(max-height:640px)]:hidden">
            {t("waitingRoom.description")}
          </p>
        </div>

        <HandoffRoutes approvalUrl={approvalUrl} callsign={callsign} />

        <div className="space-y-2">
          <ApprovalStatus polling={shouldPoll} />
          <ApprovalCodeDisplay
            callsign={callsign || ""}
            approveCode={approveCode || ""}
          />
        </div>
      </div>
    </div>
  );
}

export default WaitingRoomPage;
