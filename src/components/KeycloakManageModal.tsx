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
import { ExternalLink } from "lucide-react";
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("modals.keycloak.title")}</DialogTitle>
          <DialogDescription>
            {t("modals.keycloak.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {t("modals.keycloak.whatIsKeycloak")}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("modals.keycloak.whatIsKeycloakDesc")}
            </p>
          </div>

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
