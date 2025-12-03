"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";
import { useInvitePdfExport } from "@/hooks/helpers/useInvitePdfExport";
import { InviteHeader } from "@/components/invite-code/InviteHeader";
import { InviteQRCodeCard } from "@/components/invite-code/InviteQRCodeCard";
import { InviteSteps } from "@/components/invite-code/InviteSteps";
import { ApprovalMethodsSection } from "@/components/invite-code/ApprovalMethodsSection";

export const Route = createFileRoute("/invite-code/$code")({
  component: InviteCodePage,
});

function getInviteUrl(code: string): string {
  let hostname = new URL(window.location.origin).hostname;
  hostname = hostname.replace(/^mtls\./, "");
  return (
    window.location.protocol +
    "//" +
    hostname +
    (window.location.port ? ":" + window.location.port : "") +
    "/login?code=" +
    code
  );
}

function InviteCodePage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const { deployment } = useHealthCheck();
  const { t } = useTranslation();

  const inviteUrl = getInviteUrl(code ?? "");
  const { qrRef, downloadQRCodeAsPDF } = useInvitePdfExport({
    code: code ?? "",
    inviteUrl,
    deployment,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <InviteHeader onBack={() => navigate({ to: "/add-users" })} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-8 overflow-auto">
        <div className="w-full max-w-2xl space-y-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold">{t("inviteCode.title")}</h1>
            <span className="text-3xl bg-primary/10 text-primary px-3 py-1 rounded-full font-mono">
              {code}
            </span>
          </div>

          <InviteQRCodeCard
            inviteUrl={inviteUrl}
            qrRef={qrRef}
            onDownloadPdf={downloadQRCodeAsPDF}
          />

          <InviteSteps />

          <ApprovalMethodsSection />
        </div>
      </main>
    </div>
  );
}
