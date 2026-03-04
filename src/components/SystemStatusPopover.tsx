"use client";

import { useState, useEffect } from "react";
import { Wifi, AlertTriangle, ServerCrash, EthernetPort, RefreshCw } from "lucide-react";
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
import { useHealthCheck } from "@/hooks/api/useHealthCheck";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";

const CHECK_INTERVAL_MS = 30_000;

interface SystemStatusPopoverProps {
  isOnline: boolean;
  lastSync: Date;
}

export function SystemStatusPopover({
  isOnline,
}: SystemStatusPopoverProps) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const { data: healthData, dataUpdatedAt, refetch, isFetching, isLoading } = useHealthCheck();
  const lastSync = dataUpdatedAt ? new Date(dataUpdatedAt) : new Date();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const nextCheckSeconds = Math.max(
    0,
    Math.round((CHECK_INTERVAL_MS - (now.getTime() - lastSync.getTime())) / 1000),
  );

  const progressPct = Math.min(
    100,
    Math.round(((CHECK_INTERVAL_MS - nextCheckSeconds * 1000) / CHECK_INTERVAL_MS) * 100),
  );

  const formatNextCheck = () => {
    if (nextCheckSeconds <= 0) return t("systemStatus.checkingNow");
    if (nextCheckSeconds < 60) return `${nextCheckSeconds}${t("systemStatus.sec", "s")}`;
    const nextCheckMins = Math.ceil(nextCheckSeconds / 60);
    return `${nextCheckMins}${t("systemStatus.min", "m")}`;
  };

  const filteredProducts = healthData
    ? Object.entries(healthData.products).filter(([product]) => {
        return product.toLowerCase();
      })
    : [];

  const overallStatus = isOnline && healthData?.all_ok;

  const triggerButton = (
    <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent/20 border">
      {isLoading ? (
        <>
          <span className="w-3 h-3 rounded-full bg-gray-400 animate-pulse inline-block" />
          <span className="text-gray-400">{t("systemStatus.checking", "Tarkistetaan...")}</span>
        </>
      ) : overallStatus ? (
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
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors disabled:opacity-40"
            aria-label={t("systemStatus.refresh", "Refresh")}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("systemStatus.nextCheckIn")} {formatNextCheck()}
        </p>
        <div className="w-full h-1 rounded-full bg-border/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500/60 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {filteredProducts.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            {t("systemStatus.noServices")}
          </p>
        ) : (
          filteredProducts.map(([product, status]) => (
            <div
              key={product}
              className={`flex items-center justify-between p-2 rounded-md text-xs ${
                status
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${status ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                />
                <span className="capitalize font-medium text-foreground">
                  {product}
                </span>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-mono font-semibold ${
                  status
                    ? "bg-green-500/20 text-green-700 dark:text-green-400"
                    : "bg-red-500/20 text-red-700 dark:text-red-400"
                }`}
              >
                {status
                  ? t("systemStatus.operational")
                  : t("systemStatus.down")}
              </span>
            </div>
          ))
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
