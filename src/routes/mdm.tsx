"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Smartphone } from "lucide-react";
import { useUserType } from "@/hooks/auth/useUserType";
import { useMdmEnrollments } from "@/hooks/api/useMdmEnrollments";
import { usePlanMdmEnrollment } from "@/hooks/api/usePlanMdmEnrollment";
import { EnrollmentState } from "@/hooks/api/model/enrollmentState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/mdm")({
  component: MdmPage,
});

/** The responder answers on the plain host, not the mTLS one the admin is looking at. */
function scepUrl(): string {
  const host = window.location.hostname.replace(/^mtls\./, "");
  return `https://${host}/scep`;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => toast.error(t("mdm.copyFailed")),
    );
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p data-testid="mdm-copy-value" className="font-mono text-sm break-all">
          {value}
        </p>
      </div>
      <Button
        data-testid="mdm-copy-button"
        variant="ghost"
        size="icon"
        aria-label={t("mdm.copy")}
        onClick={copy}
      >
        {copied ? (
          <Check className="w-4 h-4 text-primary" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}

function MdmPage() {
  const { t } = useTranslation();
  const { userType, isLoading: userTypeLoading } = useUserType();
  const [callsign, setCallsign] = useState("");

  const { data: devices, isLoading, refetch } = useMdmEnrollments();
  const { mutate: plan, isLoading: isPlanning } = usePlanMdmEnrollment({
    onSuccess: (planned) => {
      toast.success(t("mdm.planned", { callsign: planned.callsign }));
      setCallsign("");
      void refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  if (!userTypeLoading && userType !== "admin") {
    return (
      <div
        data-testid="mdm-forbidden"
        className="max-w-4xl mx-auto space-y-6 text-center py-12"
      >
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <p className="text-xl text-muted-foreground">{t("mdm.forbidden")}</p>
      </div>
    );
  }

  if (isLoading || userTypeLoading) {
    return (
      <div data-testid="mdm-loading" className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">{t("mdm.title")}</h1>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const waiting = (devices ?? []).filter(
    (device) => device.state === EnrollmentState.PENDING,
  );
  const enrolled = (devices ?? []).filter(
    (device) => device.state !== EnrollmentState.PENDING,
  );

  return (
    <div data-testid="mdm-page" className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t("mdm.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("mdm.subtitle")}</p>
      </div>

      <section
        data-testid="mdm-service-settings"
        className="space-y-3 border border-border rounded-2xl bg-card p-6"
      >
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t("mdm.serviceTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("mdm.serviceDesc")}</p>
        <CopyField label={t("mdm.scepUrl")} value={scepUrl()} />
      </section>

      <section data-testid="mdm-plan" className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t("mdm.planTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("mdm.planDesc")}</p>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const wanted = callsign.trim();
            if (wanted) {
              plan({ callsign: wanted });
            }
          }}
        >
          <Input
            data-testid="mdm-callsign-input"
            value={callsign}
            onChange={(event) => setCallsign(event.target.value)}
            placeholder={t("mdm.callsignPlaceholder")}
            disabled={isPlanning}
          />
          <Button
            data-testid="mdm-plan-button"
            type="submit"
            disabled={isPlanning || !callsign.trim()}
          >
            {isPlanning ? t("mdm.planning") : t("mdm.plan")}
          </Button>
        </form>
      </section>

      <section data-testid="mdm-waiting" className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t("mdm.waitingTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("mdm.waitingDesc")}</p>
        {waiting.length === 0 ? (
          <p
            data-testid="mdm-waiting-empty"
            className="text-sm text-muted-foreground py-4"
          >
            {t("mdm.waitingEmpty")}
          </p>
        ) : (
          <div className="grid gap-3">
            {waiting.map((device) => (
              <div
                data-testid="mdm-waiting-item"
                data-callsign={device.callsign}
                key={device.callsign}
                className="flex items-center gap-4 border border-border rounded-2xl bg-card p-4"
              >
                <div className="p-3 rounded-xl bg-primary/10">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CopyField
                    label={t("mdm.deviceName", { callsign: device.callsign })}
                    value={device.deviceName}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {enrolled.length > 0 && (
        <section data-testid="mdm-enrolled" className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("mdm.enrolledTitle")}
          </h2>
          <div className="grid gap-2">
            {enrolled.map((device) => (
              <p
                data-testid="mdm-enrolled-item"
                data-callsign={device.callsign}
                key={device.callsign}
                className="text-sm font-mono"
              >
                {device.callsign}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
