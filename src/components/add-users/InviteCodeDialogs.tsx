import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
interface InviteCode {
  invitecode: string;
  active: boolean;
}

interface CreateInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CreateInviteDialog({
  open,
  onOpenChange,
  onConfirm,
}: CreateInviteDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addUsers.createModalTitle")}</DialogTitle>
          <DialogDescription className="pt-4 space-y-3 text-sm leading-relaxed text-left">
            <p className="font-semibold text-foreground">
              {t("addUsers.createModalWarning")}
            </p>
            <p>{t("addUsers.createModalText")}</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>{t("addUsers.createModalReason1")}</li>
              <li>{t("addUsers.createModalReason2")}</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              {t("addUsers.createModalTip")}
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-4 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11"
          >
            {t("addUsers.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            variant={"outline"}
            className="flex-1 h-11 bg-primary-light hover:bg-primary-light/90"
          >
            {t("addUsers.createModalTitle")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ManageCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCode: string | null;
  inviteCodes?: InviteCode[];
  onToggleStatus: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  isTogglingStatus: boolean;
}

export function ManageCodeDialog({
  open,
  onOpenChange,
  selectedCode,
  inviteCodes,
  onToggleStatus,
  onDelete,
  isDeleting,
  isTogglingStatus,
}: ManageCodeDialogProps) {
  const { t } = useTranslation();
  const selectedInvite = inviteCodes?.find(
    (c) => c.invitecode === selectedCode,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addUsers.manageModalTitle")}</DialogTitle>
          <DialogDescription>
            {t("addUsers.manageModalCode")}{" "}
            <span className="font-mono font-semibold text-foreground">
              {selectedCode}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onToggleStatus}
            className="w-full bg-transparent"
            disabled={isTogglingStatus || isDeleting}
          >
            {selectedInvite?.active
              ? t("addUsers.disableCode")
              : t("addUsers.enableCode")}
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            className="w-full"
            disabled={isTogglingStatus || isDeleting}
          >
            {isDeleting ? t("addUsers.deleting") : t("addUsers.deleteCode")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            {t("addUsers.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
          <DialogTitle>{t("addUsers.walkthrough.title")}</DialogTitle>
          <DialogDescription>
            {t("addUsers.walkthrough.description")}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[330px] rounded-md">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                {t("addUsers.walkthrough.step1Title")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t("addUsers.walkthrough.step1Description")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                {t("addUsers.walkthrough.step2Title")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t("addUsers.walkthrough.step2Description")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                {t("addUsers.walkthrough.step3Title")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t("addUsers.walkthrough.step3Description")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                {t("addUsers.walkthrough.managingTitle")}
              </h4>
              <p className="text-sm text-muted-foreground">
                • {t("addUsers.walkthrough.managingBullet1")}
                <br />• {t("addUsers.walkthrough.managingBullet2")}
                <br />• {t("addUsers.walkthrough.managingBullet3")}
              </p>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-primary-light hover:bg-primary-light/90"
            variant={"outline"}
          >
            {t("addUsers.walkthrough.gotIt")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
