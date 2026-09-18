"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronDown, Copy, Download, Settings2 } from "lucide-react";
import { useUserType } from "@/hooks/auth/useUserType";
import {
  useMdmEnrollments,
  type MdmEnrollment,
} from "@/hooks/api/useMdmEnrollments";
import {
  callsignsFrom,
  usePlanMdmDevices,
} from "@/hooks/api/usePlanMdmDevices";
import { EnrollmentState } from "@/hooks/api/model/enrollmentState";
import { devicesToCsv, downloadCsv } from "@/lib/mdmExport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

/** The responder answers on the plain host, not the mTLS one the admin is looking at. */
function scepUrl(): string {
  return `https://${window.location.hostname.replace(/^mtls\./, "")}/scep`;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  return (
    <Button
      data-testid="mdm-copy-button"
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={() =>
        navigator.clipboard.writeText(value).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          },
          () => toast.error(t("mdm.copyFailed")),
        )
      }
    >
      {copied ? (
        <Check className="w-4 h-4 text-primary" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </Button>
  );
}

/** One-time MDM configuration, folded away: it is read once and never again. */
function SetupPanel() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const url = scepUrl();
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          data-testid="mdm-setup-toggle"
          variant="ghost"
          className="w-full justify-between px-0"
        >
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings2 className="w-4 h-4" />
            {t("mdm.serviceTitle")}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent
        data-testid="mdm-setup-panel"
        className="border border-border rounded-2xl bg-card p-4 space-y-2"
      >
        <p className="text-sm text-muted-foreground">{t("mdm.serviceDesc")}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{t("mdm.scepUrl")}</p>
            <p className="font-mono text-sm break-all">{url}</p>
          </div>
          <CopyButton value={url} label={t("mdm.copy")} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function DeviceTable({ devices }: { devices: MdmEnrollment[] }) {
  const { t } = useTranslation();
  return (
    <div className="border border-border rounded-2xl overflow-x-auto">
      <Table data-testid="mdm-device-table">
        <TableHeader>
          <TableRow>
            <TableHead>{t("mdm.columnCallsign")}</TableHead>
            <TableHead>{t("mdm.columnDeviceName")}</TableHead>
            <TableHead className="text-right">
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
              <TableCell className="font-medium">{device.callsign}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs break-all">
                    {device.deviceName}
                  </span>
                  <CopyButton
                    value={device.deviceName}
                    label={t("mdm.copyFor", { callsign: device.callsign })}
                  />
                </div>
              </TableCell>
              <TableCell className="text-right">
                {device.state === EnrollmentState.PENDING ? (
                  <Badge variant="secondary">{t("mdm.statusWaiting")}</Badge>
                ) : (
                  <Badge>{t("mdm.statusEnrolled")}</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MdmPage() {
  const { t } = useTranslation();
  const { userType, isLoading: userTypeLoading } = useUserType();
  const [prefix, setPrefix] = useState("");
  const [from, setFrom] = useState("1");
  const [count, setCount] = useState("1");
  const [filter, setFilter] = useState("");
  const [lastRun, setLastRun] = useState<MdmEnrollment[]>([]);

  const { data: devices, isLoading, refetch } = useMdmEnrollments();
  const { planMany, progress, isPlanning } = usePlanMdmDevices();

  const wanted = callsignsFrom(prefix, Number(count) || 0, Number(from) || 1);

  const shown = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const all = devices ?? [];
    return needle
      ? all.filter((device) => device.callsign.toLowerCase().includes(needle))
      : all;
  }, [devices, filter]);

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

  const plan = () => {
    if (!wanted.length) {
      return;
    }
    void planMany(wanted).then((result) => {
      void refetch();
      setLastRun(
        result.planned.map((planned) => ({
          ...planned,
          state: EnrollmentState.PENDING,
        })),
      );
      if (result.failed.length) {
        toast.warning(
          t("mdm.bulkPartial", {
            planned: result.planned.length,
            failed: result.failed.length,
          }),
        );
      } else {
        toast.success(t("mdm.bulkDone", { planned: result.planned.length }));
      }
    });
  };

  return (
    <div data-testid="mdm-page" className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t("mdm.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("mdm.subtitle")}</p>
      </div>

      <SetupPanel />

      <section
        data-testid="mdm-plan"
        className="space-y-3 border border-border rounded-2xl bg-card p-6"
      >
        <h2 className="font-semibold">{t("mdm.planTitle")}</h2>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            plan();
          }}
        >
          <label className="flex-1 min-w-40 space-y-1">
            <span className="text-xs text-muted-foreground">
              {t("mdm.prefix")}
            </span>
            <Input
              data-testid="mdm-prefix-input"
              value={prefix}
              onChange={(event) => setPrefix(event.target.value)}
              placeholder={t("mdm.prefixPlaceholder")}
              disabled={isPlanning}
            />
          </label>
          <label className="w-28 space-y-1">
            <span className="text-xs text-muted-foreground">
              {t("mdm.from")}
            </span>
            <Input
              data-testid="mdm-from-input"
              type="number"
              min={1}
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              disabled={isPlanning}
            />
          </label>
          <label className="w-28 space-y-1">
            <span className="text-xs text-muted-foreground">
              {t("mdm.count")}
            </span>
            <Input
              data-testid="mdm-count-input"
              type="number"
              min={1}
              max={500}
              value={count}
              onChange={(event) => setCount(event.target.value)}
              disabled={isPlanning}
            />
          </label>
          <Button
            data-testid="mdm-plan-button"
            type="submit"
            disabled={isPlanning || !wanted.length}
          >
            {isPlanning
              ? t("mdm.bulkProgress", {
                  done: progress.done,
                  total: progress.total,
                })
              : t("mdm.plan")}
          </Button>
        </form>
        <p
          data-testid="mdm-plan-preview"
          className="text-xs text-muted-foreground min-h-4"
        >
          {wanted.length === 1
            ? t("mdm.previewOne", { callsign: wanted[0] })
            : wanted.length > 1
              ? t("mdm.preview", {
                  first: wanted[0],
                  last: wanted[wanted.length - 1],
                  count: wanted.length,
                })
              : ""}
        </p>
        {progress.failed.length > 0 && (
          <p data-testid="mdm-plan-failed" className="text-xs text-destructive">
            {t("mdm.bulkFailed", {
              callsigns: progress.failed.map((f) => f.callsign).join(", "),
            })}
          </p>
        )}
      </section>

      {lastRun.length > 0 && (
        <section
          data-testid="mdm-last-run"
          className="flex flex-wrap items-center justify-between gap-3 border border-primary/40 rounded-2xl bg-primary/5 p-4"
        >
          <p className="text-sm">
            {t("mdm.lastRun", { count: lastRun.length })}
          </p>
          <Button
            data-testid="mdm-export-last"
            onClick={() =>
              downloadCsv("mdm-devices-new.csv", devicesToCsv(lastRun))
            }
          >
            <Download className="w-4 h-4 mr-2" />
            {t("mdm.exportLast", { count: lastRun.length })}
          </Button>
        </section>
      )}

      <section data-testid="mdm-devices" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">
            {t("mdm.devicesTitle", { count: (devices ?? []).length })}
          </h2>
          {(devices ?? []).length > 0 && (
            <div className="flex items-center gap-2">
              <Input
                data-testid="mdm-filter-input"
                className="w-48"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder={t("mdm.filterPlaceholder")}
              />
              <Button
                data-testid="mdm-export-button"
                variant="outline"
                onClick={() =>
                  downloadCsv("mdm-devices.csv", devicesToCsv(shown))
                }
              >
                <Download className="w-4 h-4 mr-2" />
                {t("mdm.export", { count: shown.length })}
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{t("mdm.devicesDesc")}</p>
        {shown.length === 0 ? (
          <p
            data-testid="mdm-devices-empty"
            className="text-sm text-muted-foreground py-6"
          >
            {(devices ?? []).length === 0 ? t("mdm.empty") : t("mdm.noneMatch")}
          </p>
        ) : (
          <DeviceTable devices={shown} />
        )}
      </section>
    </div>
  );
}
