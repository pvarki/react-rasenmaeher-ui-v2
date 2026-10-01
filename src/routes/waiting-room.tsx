"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useOwnEnrollmentStatus } from "@/hooks/api/useOwnEnrollmentStatus";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";
import { CompactHeader } from "@/components/CompactHeader";
import { ApprovalHandoff } from "@/components/waiting-room/ApprovalHandoff";
import { ApprovalStatus } from "@/components/waiting-room/ApprovalStatus";

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

  const {
    data: enrolled,
    dataUpdatedAt,
    isError,
    failureCount,
  } = useOwnEnrollmentStatus({
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
      className="flex min-h-dvh flex-col bg-background p-4 md:p-8"
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 md:max-w-4xl md:gap-8">
        <CompactHeader deployment={deployment} />

        <div className="flex flex-col gap-4 md:my-auto md:gap-6">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
              {t("waitingRoom.title")}
            </h1>
            <p className="text-base leading-snug text-muted-foreground text-balance md:text-lg">
              {t("waitingRoom.description")}
            </p>
          </div>

          <ApprovalHandoff
            approvalUrl={approvalUrl}
            callsign={callsign || ""}
          />

          {/* isError only flips after react-query's retries run out. */}
          <ApprovalStatus
            callsign={callsign || ""}
            approveCode={approveCode || ""}
            approvalUrl={approvalUrl}
            lastCheckedAt={dataUpdatedAt}
            failing={isError || failureCount > 0}
            className="mx-auto w-full max-w-md"
          />
        </div>
      </div>
    </div>
  );
}

export default WaitingRoomPage;
