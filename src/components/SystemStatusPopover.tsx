"use client";

import { useState } from "react";
import { Wifi, AlertTriangle, ServerCrash, EthernetPort } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useHealthCheck } from "@/hooks/api/useHealthCheck";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";

interface SystemStatusPopoverProps {
  isOnline: boolean;
  lastSync: Date;
}

export function SystemStatusPopover({
  isOnline,
  lastSync,
}: SystemStatusPopoverProps) {
  const [open, setOpen] = useState(false);
  const { data: healthData } = useHealthCheck();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return t("systemStatus.justNow");
    if (diffMins === 1) return `1 ${t("systemStatus.minAgo")}`;
    if (diffMins < 60) return `${diffMins} ${t("systemStatus.minAgo")}`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return `1 ${t("systemStatus.hourAgo")}`;
    if (diffHours < 24) return `${diffHours} ${t("systemStatus.hoursAgo")}`;

    return date.toLocaleDateString();
  };

  const filteredProducts = healthData
    ? Object.entries(healthData.products).filter(([product]) => {
        return product.toLowerCase();
      })
    : [];

  const overallStatus = isOnline && healthData?.all_ok;

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
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground">
            {t("systemStatus.title")}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("systemStatus.lastUpdated")} {formatTime(lastSync)}
        </p>
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

  // Mobile: use Drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader />
          <div className="px-4 pb-6">{statusContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: use Popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent className="w-80 p-4 border">
        {statusContent}
      </PopoverContent>
    </Popover>
  );
}
