import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface WalkthroughDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalkthroughDialog({
  open,
  onOpenChange,
}: WalkthroughDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("manageUsers.walkthrough.title")}</DialogTitle>
          <DialogDescription>
            {t("manageUsers.walkthrough.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">
              {t("manageUsers.walkthrough.promotingTitle")}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t("manageUsers.walkthrough.promotingDesc")}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">
              {t("manageUsers.walkthrough.removingTitle")}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t("manageUsers.walkthrough.removingDesc")}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">
              {t("manageUsers.walkthrough.notesTitle")}
            </h4>
            <p className="text-sm text-muted-foreground">
              • {t("manageUsers.walkthrough.note1")}
              <br />• {t("manageUsers.walkthrough.note2")}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant={"outline"}
            className="w-full bg-primary-light hover:bg-primary-light/90"
          >
            {t("manageUsers.walkthrough.gotIt")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UserRolesInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserRolesInfoDialog({
  open,
  onOpenChange,
}: UserRolesInfoDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("manageUsers.infoModal.title", "User Roles")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "manageUsers.infoModal.description",
              "Learn about different user roles",
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground">
              {t("common.admin", "Administrator")}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t(
                "manageUsers.infoModal.adminDesc",
                "Administrators have access to management tools and can manage users.",
              )}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground">
              {t("common.user", "User")}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t(
                "manageUsers.infoModal.userDesc",
                "Users have basic access to services.",
              )}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant={"outline"}
            className="w-full bg-primary-light hover:bg-primary-light/90"
          >
            {t("common.close", "Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
