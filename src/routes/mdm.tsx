"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Plus, Settings2, Smartphone } from "lucide-react";
import { useUserType } from "@/hooks/auth/useUserType";
import {
  useMdmEnrollments,
  type MdmEnrollment,
} from "@/hooks/api/useMdmEnrollments";
import { useMdmSettings } from "@/hooks/api/useMdmSettings";
import {
  callsignsFrom,
  usePlanMdmDevices,
} from "@/hooks/api/usePlanMdmDevices";
import { EnrollmentState } from "@/hooks/api/model/enrollmentState";
import { devicesToCsv, downloadCsv } from "@/lib/mdmExport";
import { ConnectionDialog } from "@/components/mdm/ConnectionDialog";
import { CopyLine } from "@/components/mdm/CopyLine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

/** The three things to do, said once, where they are needed: in the empty state.
 *
 * Not permanent furniture. An operator who has done this before does not need to be told again,
 * and a page that explains itself forever reads as documentation rather than as a tool.
 */
function HowItWorks({ onConnection }: { onConnection: () => void }) {
  const { t } = useTranslation();
  const steps = [t("mdm.step1"), t("mdm.step2"), t("mdm.step3")];
  return (
    <div
      data-testid="mdm-how-it-works"
      className="rounded-2xl border border-dashed border-border px-6 py-10 text-center"
    >
      <Smartphone className="w-8 h-8 mx-auto text-muted-foreground/60" />
      <h2 className="mt-4 text-lg font-semibold">{t("mdm.emptyTitle")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("mdm.emptyBody")}</p>
      <ol className="mt-6 mx-auto max-w-md space-y-3 text-left">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm">
            <span className="flex items-center justify-center shrink-0 w-5 h-5 mt-px rounded-full bg-muted text-xs font-medium">
              {index + 1}
            </span>
            <span className="text-muted-foreground">{step}</span>
          </li>
        ))}
      </ol>
      <Button
        data-testid="mdm-empty-connection"
        variant="outline"
        className="mt-6"
        onClick={onConnection}
      >
        <Settings2 className="w-4 h-4 mr-2" />
        {t("mdm.connectionTitle")}
      </Button>
    </div>
  );
}

function Composer({
  onPlan,
  isPlanning,
  progress,
  onCancel,
}: {
  onPlan: (callsigns: string[]) => void;
  isPlanning: boolean;
  progress: { done: number; total: number };
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [prefix, setPrefix] = useState("");
  const [from, setFrom] = useState("1");
  const [count, setCount] = useState("1");
  const wanted = callsignsFrom(prefix, Number(count) || 0, Number(from) || 1);

  return (
    <form
      data-testid="mdm-composer"
      className="rounded-2xl border border-border bg-card p-5 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (wanted.length) {
          onPlan(wanted);
        }
      }}
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-40 space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {t("mdm.prefix")}
          </span>
          <Input
            data-testid="mdm-prefix-input"
            autoFocus
            value={prefix}
            onChange={(event) => setPrefix(event.target.value)}
            placeholder={t("mdm.prefixPlaceholder")}
            disabled={isPlanning}
          />
        </label>
        <label className="w-24 space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
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
        <label className="w-24 space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
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
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          data-testid="mdm-plan-preview"
          className="text-xs text-muted-foreground"
        >
          {wanted.length === 1
            ? t("mdm.previewOne", { callsign: wanted[0] })
            : wanted.length > 1
              ? t("mdm.preview", {
                  first: wanted[0],
                  last: wanted[wanted.length - 1],
                  count: wanted.length,
                })
              : t("mdm.previewNone")}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isPlanning}
          >
            {t("mdm.cancel")}
          </Button>
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
        </div>
      </div>
    </form>
  );
}

function DeviceTable({ devices }: { devices: MdmEnrollment[] }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-border overflow-x-auto">
      <Table data-testid="mdm-device-table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">{t("mdm.columnCallsign")}</TableHead>
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
              <TableCell className="font-medium">{device.callsign}</TableCell>
              <TableCell className="py-2">
                <CopyLine label="" value={device.deviceName} />
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
  const [composing, setComposing] = useState(false);
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [lastRun, setLastRun] = useState<MdmEnrollment[]>([]);

  const { data: devices, isLoading, refetch } = useMdmEnrollments();
  const { data: settings } = useMdmSettings();
  const { planMany, progress, isPlanning } = usePlanMdmDevices();

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
        <h1 className="text-2xl font-semibold">{t("mdm.title")}</h1>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const plan = (callsigns: string[]) => {
    void planMany(callsigns).then((result) => {
      void refetch();
      setComposing(false);
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

  const total = (devices ?? []).length;

  return (
    <div data-testid="mdm-page" className="max-w-4xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("mdm.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("mdm.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-testid="mdm-connection-button"
            variant="ghost"
            size="sm"
            onClick={() => setConnectionOpen(true)}
          >
            <Settings2 className="w-4 h-4 mr-2" />
            {t("mdm.connection")}
          </Button>
          {!composing && (
            <Button
              data-testid="mdm-add-button"
              onClick={() => setComposing(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("mdm.add")}
            </Button>
          )}
        </div>
      </header>

      {composing && (
        <Composer
          onPlan={plan}
          isPlanning={isPlanning}
          progress={progress}
          onCancel={() => setComposing(false)}
        />
      )}

      {lastRun.length > 0 && (
        <div
          data-testid="mdm-last-run"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary/5 border border-primary/30 px-5 py-4"
        >
          <div className="space-y-1">
            <p className="text-sm">
              {t("mdm.lastRun", { count: lastRun.length })}
            </p>
            {progress.failed.length > 0 && (
              <p
                data-testid="mdm-plan-failed"
                className="text-xs text-muted-foreground"
              >
                {t("mdm.bulkFailed", {
                  callsigns: progress.failed.map((f) => f.callsign).join(", "),
                })}
              </p>
            )}
          </div>
          <Button
            data-testid="mdm-export-last"
            size="sm"
            onClick={() =>
              downloadCsv("mdm-devices-new.csv", devicesToCsv(lastRun))
            }
          >
            <Download className="w-4 h-4 mr-2" />
            {t("mdm.exportLast", { count: lastRun.length })}
          </Button>
        </div>
      )}

      {total === 0 && !composing ? (
        <HowItWorks onConnection={() => setConnectionOpen(true)} />
      ) : (
        total > 0 && (
          <section data-testid="mdm-devices" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {t("mdm.devicesDesc")}
              </p>
              <div className="flex items-center gap-2">
                <Input
                  data-testid="mdm-filter-input"
                  className="w-44 h-9"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder={t("mdm.filterPlaceholder")}
                />
                <Button
                  data-testid="mdm-export-button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadCsv("mdm-devices.csv", devicesToCsv(shown))
                  }
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("mdm.export", { count: shown.length })}
                </Button>
              </div>
            </div>
            {shown.length === 0 ? (
              <p
                data-testid="mdm-devices-empty"
                className="text-sm text-muted-foreground py-6"
              >
                {t("mdm.noneMatch")}
              </p>
            ) : (
              <DeviceTable devices={shown} />
            )}
          </section>
        )
      )}

      <ConnectionDialog
        open={connectionOpen}
        onOpenChange={setConnectionOpen}
        scepUrl={settings?.scepUrl ?? ""}
        challenge={settings?.challenge ?? ""}
      />
    </div>
  );
}
