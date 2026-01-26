import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { ApprovalCodeInput } from "./ApprovalCodeInput";

interface ApproveUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: string | null;
  approvalCode: string;
  onApprovalCodeChange: (code: string) => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export function ApproveUserDialog({
  open,
  onOpenChange,
  selectedUser,
  approvalCode,
  onApprovalCodeChange,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: ApproveUserDialogProps) {
  const { t } = useTranslation();
  const isLoading = isApproving || isRejecting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("approveUsers.approveUser")}</DialogTitle>
          <DialogDescription>
            {t("approveUsers.enterApprovalCode")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              {t("approveUsers.callsign")}
            </Label>
            <p className="font-semibold text-lg">{selectedUser}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="approval-code">
              {t("approveUsers.approvalCodeLabel")}
            </Label>
            <ApprovalCodeInput
              approvalCode={approvalCode}
              onCodeChange={onApprovalCodeChange}
              onSubmit={onApprove}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 h-11"
          >
            {t("approveUsers.goBack")}
          </Button>
          <Button
            variant="destructive"
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 h-11"
          >
            {isRejecting
              ? t("approveUsers.rejecting")
              : t("approveUsers.reject")}
          </Button>
          <Button
            onClick={onApprove}
            variant={"outline"}
            className="bg-primary-light hover:bg-primary-light/90 flex-1 h-11"
            disabled={isLoading}
          >
            {isApproving
              ? t("approveUsers.approving")
              : t("approveUsers.approve")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
