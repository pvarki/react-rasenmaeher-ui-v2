import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { Copy, ExternalLink } from "lucide-react";
import { useUserType } from "@/hooks/auth/useUserType";
import {
  setMdmEnrolmentWindow,
  useMdmDevices,
  useMdmSettings,
} from "@/hooks/api/useMdmEnrollments";
import { Button } from "@/components/ui/button";
import { mdmSettingsLine, openInMdmConnector } from "@/lib/mdmSettingsLine";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/mdm")({
  component: MdmPage,
});

/** How long opening enrolment lasts before it closes itself */
const ENROLMENT_HOURS = 2;

function MdmPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { userType, isLoading: userTypeLoading } = useUserType();
  const { data: devices, isLoading, isError } = useMdmDevices();
  const { data: settings } = useMdmSettings();
  const [switching, setSwitching] = useState(false);

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

  const isOpen = Boolean(settings?.open_until);
  // Never shown: it carries the challenge
  const connectorLine = settings ? mdmSettingsLine(settings) : null;

  const switchWindow = async () => {
    setSwitching(true);
    try {
      await setMdmEnrolmentWindow(isOpen ? 0 : ENROLMENT_HOURS);
    } catch {
      toast.error(t("mdm.windowFailed"));
    }
    setSwitching(false);
    void queryClient.invalidateQueries("mdmSettings");
  };

  const copy = (name: string) => {
    navigator.clipboard
      .writeText(name)
      .catch(() => toast.error(t("mdm.copyFailed")));
  };

  return (
    <div data-testid="mdm-page" className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("mdm.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("mdm.subtitle")}</p>
      </header>

      {settings && (
        <section
          data-testid="mdm-enrolment"
          data-open={isOpen ? "true" : "false"}
          className="rounded-2xl border border-border p-4 space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium">
              {settings.open_until
                ? t("mdm.enrolmentOpen", {
                    time: new Date(settings.open_until).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  })
                : t("mdm.enrolmentClosed")}
            </p>
            <Button
              data-testid="mdm-window"
              variant={isOpen ? "destructive" : "default"}
              className={
                isOpen
                  ? undefined
                  : "bg-green-600! text-white! hover:bg-green-700!"
              }
              onClick={() => void switchWindow()}
              disabled={switching}
            >
              {isOpen ? t("mdm.close") : t("mdm.open")}
            </Button>
          </div>
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 text-sm">
            {(
              [
                ["mdm.scepUrl", settings.scep_url],
                // Opening makes a new one, so the closed window's challenge is a trap to copy
                ...(isOpen ? [["mdm.challenge", settings.challenge]] : []),
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{t(label)}</dt>
                <dd className="font-mono break-all">
                  {value}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-7 w-7"
                    aria-label={t("mdm.copy")}
                    onClick={() => copy(value)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </dd>
              </div>
            ))}
          </dl>
          {isOpen && (
            <p className="text-sm text-muted-foreground">
              {t("mdm.challengeNew")}
            </p>
          )}
          {connectorLine && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  data-testid="mdm-open-connector"
                  className="h-auto! max-w-full whitespace-normal! text-left"
                  onClick={() => openInMdmConnector(connectorLine)}
                >
                  <ExternalLink className="w-4 h-4 mr-2 shrink-0" />
                  {t("mdm.openConnector")}
                </Button>
                <Button
                  data-testid="mdm-copy-connector"
                  variant="outline"
                  className="h-auto! max-w-full whitespace-normal! text-left"
                  aria-label={t("mdm.copyConnector")}
                  onClick={() => copy(connectorLine)}
                >
                  <Copy className="w-4 h-4 mr-2 shrink-0" />
                  {t("mdm.copyConnector")}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("mdm.openConnectorNote")}
              </p>
            </div>
          )}
        </section>
      )}

      <section data-testid="mdm-devices" className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t("mdm.devicesDesc", { count: devices?.length ?? 0 })}
        </p>
        {isLoading || userTypeLoading ? (
          <div className="w-8 h-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
        ) : isError ? (
          <p data-testid="mdm-load-failed" className="text-sm text-destructive">
            {t("mdm.loadFailed")}
          </p>
        ) : !devices?.length ? (
          <p data-testid="mdm-empty" className="text-sm text-muted-foreground">
            {t("mdm.emptyTitle")}
          </p>
        ) : (
          <div className="rounded-2xl border border-border overflow-x-auto">
            <Table data-testid="mdm-device-table">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("mdm.columnCallsign")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow
                    data-testid="mdm-device-row"
                    data-callsign={device.callsign}
                    key={device.callsign}
                  >
                    <TableCell className="font-mono">
                      {device.callsign}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
