import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { useUserType } from "@/hooks/auth/useUserType";
import {
  planMdmEnrollment,
  setMdmEnrolmentWindow,
  useMdmEnrollments,
  useMdmSettings,
} from "@/hooks/api/useMdmEnrollments";
import { EnrollmentState } from "@/hooks/api/model/enrollmentState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
const ENROLMENT_HOURS = 24;

function StatusBadge({ state }: { state: EnrollmentState }) {
  const { t } = useTranslation();
  if (state === EnrollmentState.PENDING) {
    return <Badge variant="secondary">{t("mdm.statusWaiting")}</Badge>;
  }
  if (state === EnrollmentState.APPROVED) {
    return <Badge>{t("mdm.statusEnrolled")}</Badge>;
  }
  return <Badge variant="destructive">{t("mdm.statusRejected")}</Badge>;
}

function MdmPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { userType, isLoading: userTypeLoading } = useUserType();
  const { data: devices, isLoading, isError } = useMdmEnrollments();
  const [callsigns, setCallsigns] = useState("");
  const [planning, setPlanning] = useState(false);
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

  // One at a time, so a refusal names its callsign. The ones refused stay in the box to fix.
  const plan = async () => {
    setPlanning(true);
    const refused: string[] = [];
    for (const callsign of callsigns.split(/[\s,;]+/).filter(Boolean)) {
      try {
        await planMdmEnrollment(callsign);
      } catch (error) {
        refused.push(callsign);
        toast.error(`${callsign}: ${(error as Error).message}`);
      }
    }
    setCallsigns(refused.join("\n"));
    setPlanning(false);
    void queryClient.invalidateQueries("mdmEnrollments");
  };

  const isOpen = Boolean(settings?.open_until);

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
                    time: new Date(settings.open_until).toLocaleString(),
                  })
                : t("mdm.enrolmentClosed")}
            </p>
            <Button
              data-testid="mdm-window"
              variant={isOpen ? "outline" : "default"}
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
                ["mdm.challenge", settings.challenge],
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
        </section>
      )}

      <section className="space-y-2">
        <Label htmlFor="mdm-callsigns">{t("mdm.callsigns")}</Label>
        <Textarea
          id="mdm-callsigns"
          data-testid="mdm-callsigns"
          value={callsigns}
          onChange={(event) => setCallsigns(event.target.value)}
          disabled={planning}
        />
        <Button
          data-testid="mdm-plan"
          onClick={() => void plan()}
          disabled={planning || !callsigns.trim()}
        >
          {t("mdm.plan")}
        </Button>
      </section>

      <section data-testid="mdm-devices" className="space-y-3">
        <p className="text-sm text-muted-foreground">{t("mdm.devicesDesc")}</p>
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
                  <TableHead>{t("mdm.columnDeviceName")}</TableHead>
                  <TableHead className="w-28 text-right">
                    {t("mdm.columnStatus")}
                  </TableHead>
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
                      {device.deviceName}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 h-7 w-7"
                        aria-label={t("mdm.copy")}
                        onClick={() => copy(device.deviceName)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge state={device.state} />
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
