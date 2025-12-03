"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import type { User } from "@/hooks/api/useUserManagement";

interface UserManagementDialogProps {
  user: User | null;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  isCurrentUser: boolean;
  administratorsCount: number;
  isLoading: boolean;
  onPromote: () => void;
  onDemote: () => void;
  onRemove: () => void;
}

export function UserManagementDialog({
  user,
  onOpenChange,
  isAdmin,
  isCurrentUser,
  administratorsCount,
  isLoading,
  onPromote,
  onDemote,
  onRemove,
}: UserManagementDialogProps) {
  const { t } = useTranslation();

  const canRemove = !isCurrentUser && !(isAdmin && administratorsCount <= 1);
  const canDemote = !isCurrentUser;

  return (
    <Dialog open={!!user} onOpenChange={() => onOpenChange(false)}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("manageUsers.userDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("common.managing")}{" "}
            <span className="font-semibold text-foreground">
              {user?.callsign}
            </span>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6">
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {t("manageUsers.userDialog.currentRole")}{" "}
              <span className="font-medium text-foreground capitalize">
                {isAdmin ? t("common.admin") : t("common.user")}
              </span>
            </p>
          </div>
        </ScrollArea>
        <DialogFooter className="flex-row gap-2 sm:justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isLoading}
          >
            {t("manageUsers.userDialog.goBack")}
          </Button>

          <Button
            variant="outline"
            onClick={onRemove}
            className="flex-1 bg-transparent"
            disabled={isLoading || !canRemove}
            title={
              isCurrentUser ? t("manageUsers.tooltips.cannotRemove") : undefined
            }
          >
            {t("manageUsers.userDialog.remove")}
          </Button>

          {!isAdmin ? (
            <Button
              variant={"outline"}
              onClick={onPromote}
              className="flex-1 bg-primary-light hover:bg-primary-light/90"
              disabled={isLoading}
            >
              {t("manageUsers.userDialog.promote")}
            </Button>
          ) : (
            <Button
              onClick={onDemote}
              variant={"outline"}
              className="flex-1 bg-primary-light hover:bg-primary-light/90"
              disabled={isLoading || !canDemote}
              title={
                isCurrentUser
                  ? t("manageUsers.tooltips.cannotDemote")
                  : undefined
              }
            >
              {t("manageUsers.userDialog.demote")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
