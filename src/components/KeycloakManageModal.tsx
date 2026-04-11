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
import { ExternalLink, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

const isMock = import.meta.env.VITE_MOCK === "true";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("modals.keycloak.title")}</DialogTitle>
          <DialogDescription>
            {t("modals.keycloak.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {isMock && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex gap-3 items-start">
              <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {t("modals.keycloak.mockTitle")}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("modals.keycloak.mockDesc")}
                </p>
              </div>
            </div>
          )}

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {t("modals.keycloak.whatIsKeycloak")}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("modals.keycloak.whatIsKeycloakDesc")}
            </p>
          </div>

          {!isMock && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {t("modals.keycloak.whatCanYouDo")}
              </p>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                <li>{t("modals.keycloak.resetPasswords")}</li>
                <li>{t("modals.keycloak.configureLogin")}</li>
                <li>{t("modals.keycloak.manageAttributes")}</li>
                <li>{t("modals.keycloak.configureProviders")}</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {t("modals.keycloak.cancelButton")}
          </Button>
          {!isMock && (
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
