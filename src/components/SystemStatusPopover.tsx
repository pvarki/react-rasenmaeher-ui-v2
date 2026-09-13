"use client";

import { useEffect, useState } from "react";
import {
  Wifi,
  AlertTriangle,
  ServerCrash,
  EthernetPort,
  RefreshCw,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  useHealthCheck,
  HEALTH_CHECK_STALE_AFTER_MS,
} from "@/hooks/api/useHealthCheck";
import useBasicHealthCheck from "@/hooks/helpers/useHealthcheck";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOnlineStatus } from "@/hooks/use-online-status";

/**
 * How often the "last updated" label is recomputed while the panel is open. The
 * label counts in seconds, so it has to tick every second to count smoothly
 * instead of jumping between whatever values the tick happens to land on.
 */
const OPEN_TICK_MS = 1000;

/**
 * Nothing renders the label while the panel is closed, but the age still has to
 * keep growing so the trigger can turn stale on its own — just far more slowly.
 */
const CLOSED_TICK_MS = 10000;

/** Ages below this read as "just now" rather than a second count. */
const JUST_NOW_BELOW_MS = 5000;

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return now;
}

type ProductState = "up" | "down" | "unknown";

const productStyles: Record<
  ProductState,
  { row: string; dot: string; badge: string }
> = {
  up: {
    row: "bg-green-500/10 border border-green-500/20",
    dot: "bg-green-500 animate-pulse",
    badge: "bg-green-500/20 text-green-700 dark:text-green-400",
  },
  down: {
    row: "bg-red-500/10 border border-red-500/20",
    dot: "bg-red-500",
    badge: "bg-red-500/20 text-red-700 dark:text-red-400",
  },
  unknown: {
    row: "bg-muted/50 border border-border",
    dot: "bg-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
};

export function SystemStatusPopover() {
  const [open, setOpen] = useState(false);
  const {
    data: healthData,
    dataUpdatedAt,
    isError,
    isFetching,
    failureCount,
    refetch,
  } = useHealthCheck();
  const { version: deploymentVersion } = useBasicHealthCheck();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const isOnline = useOnlineStatus();
  const now = useNow(open ? OPEN_TICK_MS : CLOSED_TICK_MS);

  const hasSynced = dataUpdatedAt > 0;
  const age = hasSynced ? Math.max(0, now - dataUpdatedAt) : Infinity;

  // The cached response only describes the products as of the last successful
  // check. Once we are offline, a check has failed, or the answer has aged out,
  // their real state is unknown and must not be rendered as if it were fresh.
  const isStale =
    !isOnline ||
    isError ||
    failureCount > 0 ||
    !hasSynced ||
    age > HEALTH_CHECK_STALE_AFTER_MS;

  const formatAge = () => {
    if (!hasSynced) return t("systemStatus.never");

    // The check runs every HEALTH_CHECK_INTERVAL_MS (30s), so a label that only
    // resolves to whole minutes would read "just now" forever and never tell
    // the user anything. Seconds keep it counting visibly between checks.
    if (age < JUST_NOW_BELOW_MS) return t("systemStatus.justNow");

    const diffSecs = Math.floor(age / 1000);
    if (diffSecs < 60) return `${diffSecs} ${t("systemStatus.secAgo")}`;

    const diffMins = Math.floor(age / 60000);
    if (diffMins === 1) return `1 ${t("systemStatus.minAgo")}`;
    if (diffMins < 60) return `${diffMins} ${t("systemStatus.minAgo")}`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return `1 ${t("systemStatus.hourAgo")}`;
    if (diffHours < 24) return `${diffHours} ${t("systemStatus.hoursAgo")}`;

    return new Date(dataUpdatedAt).toLocaleString();
  };

  const products = healthData ? Object.entries(healthData.products) : [];

  const overallStatus = !isStale && healthData?.all_ok === true;

  const triggerButton = (
    <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent/20 border">
      {overallStatus ? (
        <>
          <EthernetPort className="w-3 h-3 text-green-500" />
          <span>{t("systemStatus.online")}</span>
        </>
      ) : (
        <>
          <ServerCrash className="w-3 h-3 text-red-500" />
          <span>{t("systemStatus.offline")}</span>
        </>
      )}
    </button>
  );

  const statusContent = (
    <div className="space-y-4">
      <div className="space-y-2 pb-3 border-b border-border/30">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground">
            {t("systemStatus.title")}
          </h3>
          <button
            onClick={() => void refetch()}
            disabled={isFetching}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>{t("systemStatus.refresh")}</span>
          </button>
        </div>
        <p
          className={`text-xs ${isStale ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
        >
          {t("systemStatus.lastUpdated")} {formatAge()}
        </p>
        {deploymentVersion && (
          <p className="text-xs text-muted-foreground">
            {t("systemStatus.version")}{" "}
            <span className="font-mono">{deploymentVersion}</span>
          </p>
        )}
      </div>

      {isStale && (
        <div className="flex items-start gap-2 p-2 rounded-md text-xs bg-red-500/10 border border-red-500/20">
          <ServerCrash className="w-3 h-3 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
          <span className="text-foreground">
            {isOnline
              ? t("systemStatus.unreachable")
              : t("systemStatus.offlineWarning")}
          </span>
        </div>
      )}

      <div className="space-y-2">
        {products.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            {t("systemStatus.noServices")}
          </p>
        ) : (
          products.map(([product, status]) => {
            const state: ProductState = isStale
              ? "unknown"
              : status
                ? "up"
                : "down";
            const styles = productStyles[state];

            return (
              <div
                key={product}
                className={`flex items-center justify-between p-2 rounded-md text-xs ${styles.row}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                  <span className="capitalize font-medium text-foreground">
                    {product}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-mono font-semibold ${styles.badge}`}
                >
                  {state === "unknown"
                    ? t("systemStatus.unknown")
                    : state === "up"
                      ? t("systemStatus.operational")
                      : t("systemStatus.down")}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div
        className={`flex items-center gap-2 p-2 rounded-md text-xs ${isOnline ? "bg-blue-500/10 border border-blue-500/20" : "bg-yellow-500/10 border border-yellow-500/20"}`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span className="text-foreground">
              {t("systemStatus.networkConnected")}
            </span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
            <span className="text-foreground">
              {t("systemStatus.networkDisconnected")}
            </span>
          </>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle className="sr-only" />
          <DrawerDescription className="sr-only" />
          <div className="px-4 pb-6 mt-6.5">{statusContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent className="w-80 p-4 border">
        {statusContent}
      </PopoverContent>
    </Popover>
  );
}
