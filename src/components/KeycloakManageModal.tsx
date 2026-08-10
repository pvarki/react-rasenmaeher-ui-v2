"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

interface KeycloakManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeycloakManageModal({
  open,
  onOpenChange,
}: KeycloakManageModalProps) {
  const { t } = useTranslation();
  const currentDomain = window.location.hostname.replace(/^mtls\./, "");
  const keycloakUrl = `https://kc.${currentDomain}:9443/admin/RASENMAEHER/console/`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto]">
        <DialogHeader>
          <DialogTitle>{t("modals.keycloak.title")}</DialogTitle>
          <DialogDescription>
            {t("modals.keycloak.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto">
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {t("modals.keycloak.whatCanYouDo")}
            </p>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>{t("modals.keycloak.inspectUsers")}</li>
              <li>{t("modals.keycloak.viewSessions")}</li>
              <li>{t("modals.keycloak.manageClients")}</li>
              <li>{t("modals.keycloak.reviewEvents")}</li>
            </ul>
          </div>

          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <span className="flex items-center shrink-0 h-[1.625em] text-xs">
              <TriangleAlert className="size-3.5 text-yellow-600 dark:text-yellow-400" />
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("modals.keycloak.note")}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {t("modals.keycloak.cancelButton")}
          </Button>
          <a
            href={keycloakUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button className="w-full bg-primary hover:bg-primary/90">
              {t("modals.keycloak.openConsole")}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
