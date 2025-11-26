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

interface ExitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exitUrl: string;
  onConfirm: () => void;
}

export function ExitConfirmDialog({
  open,
  onOpenChange,
  exitUrl,
  onConfirm,
}: ExitConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("home.dialog.leaveTitle")}</DialogTitle>
          <DialogDescription className="pt-2">
            {t("home.dialog.leaveDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className="text-primary break-all font-mono text-xs">{exitUrl}</p>
        </div>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {t("home.dialog.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            variant={"outline"}
            className="flex-1 bg-primary-light hover:bg-primary-light/90"
          >
            {t("home.dialog.continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
