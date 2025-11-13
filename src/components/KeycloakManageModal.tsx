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

interface KeycloakManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeycloakManageModal({
  open,
  onOpenChange,
}: KeycloakManageModalProps) {
  const currentDomain = window.location.hostname.replace(/^mtls\./, "");
  const keycloakUrl = `https://kc.${currentDomain}:9443/admin/RASENMAEHER/console/`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keycloak Management Console</DialogTitle>
          <DialogDescription>
            Access the Keycloak administration interface to manage users, roles,
            and authentication settings.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-semibold text-foreground">
              What is Keycloak?
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Keycloak is an open-source identity and access management
              platform. It handles user authentication, authorization, and role
              management for this application.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-semibold text-foreground">
              What can you do there?
            </p>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
              <li>Reset user passwords</li>
              <li>Configure login settings</li>
              <li>Manage user attributes</li>
              <li>Configure identity providers</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <a
            href={keycloakUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button className="w-full bg-primary hover:bg-primary/90">
              Open Console
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
