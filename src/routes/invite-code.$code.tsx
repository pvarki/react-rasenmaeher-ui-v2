"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";
import { useInvitePdfExport } from "@/hooks/helpers/useInvitePdfExport";
import { InviteHeader } from "@/components/invite-code/InviteHeader";
import { InviteQRCodeCard } from "@/components/invite-code/InviteQRCodeCard";
import { InviteSteps } from "@/components/invite-code/InviteSteps";
import { ApprovalMethodsSection } from "@/components/invite-code/ApprovalMethodsSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/invite-code/$code")({
  component: InviteCodePage,
});

function getInviteUrl(code: string, autoOpenGuides: boolean): string {
  let hostname = new URL(window.location.origin).hostname;
  hostname = hostname.replace(/^mtls\./, "");
  return (
    window.location.protocol +
    "//" +
    hostname +
    (window.location.port ? ":" + window.location.port : "") +
    "/login?code=" +
    code +
    // Carried in the link rather than stored server side: it is a default for
    // the people joining with this code, not a deployment-wide policy.
    (autoOpenGuides ? "" : "&guides=off")
  );
}

function InviteCodePage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const { deployment } = useHealthCheck();
  const { t } = useTranslation();

  const [autoOpenGuides, setAutoOpenGuides] = useState(true);
  const inviteUrl = getInviteUrl(code ?? "", autoOpenGuides);
  const { qrRef, downloadQRCodeAsPDF } = useInvitePdfExport({
    code: code ?? "",
    inviteUrl,
    deployment,
  });

  return (
    <div
      data-testid="invite-code-page"
      data-invite-code={code}
      className="min-h-screen flex flex-col bg-background text-foreground"
    >
      <InviteHeader onBack={() => navigate({ to: "/add-users" })} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-8 overflow-auto">
        <div className="w-full max-w-2xl space-y-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold">{t("inviteCode.title")}</h1>
            <span
              data-testid="invite-code-value"
              className="text-3xl bg-primary/10 text-primary px-3 py-1 rounded-full font-mono"
            >
              {code}
            </span>
          </div>

          <InviteQRCodeCard
            inviteUrl={inviteUrl}
            qrRef={qrRef}
            onDownloadPdf={downloadQRCodeAsPDF}
          />

          <div
            data-testid="invite-guides-toggle"
            data-auto-guides={autoOpenGuides ? "on" : "off"}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <Label htmlFor="invite-guides" className="cursor-pointer text-sm">
                {t("inviteCode.guides.label")}
              </Label>
              <p className="pt-1 text-xs text-muted-foreground">
                {t("inviteCode.guides.description")}
              </p>
            </div>
            <Switch
              id="invite-guides"
              checked={autoOpenGuides}
              onCheckedChange={setAutoOpenGuides}
              aria-label={t("inviteCode.guides.label")}
            />
          </div>

          <InviteSteps />

          <ApprovalMethodsSection />

          <Button
            data-testid="go-to-approve-users-button"
            onClick={() => navigate({ to: "/approve-users" })}
            className="w-full flex items-center justify-center gap-2"
          >
            {t("inviteCode.approvalMethods.goToApproveUsers")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
