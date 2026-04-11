import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface RiskConfirmationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RiskConfirmationDrawer({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: RiskConfirmationDrawerProps) {
  const { t } = useTranslation();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent data-testid="risk-confirmation-drawer">
        <DrawerHeader className="space-y-3">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/15">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <DrawerTitle className="text-center text-xl">
            {t("browserGuard.title")}
          </DrawerTitle>
          <DrawerDescription className="text-center">
            {t("browserGuard.confirmRisk")}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerFooter className="flex flex-col gap-3 pt-6">
          <Button
            data-testid="risk-confirmation-confirm-button"
            onClick={onConfirm}
            variant="destructive"
            className="w-full py-6 text-base font-semibold"
          >
            {t("browserGuard.confirmButton")}
          </Button>
          <Button
            data-testid="risk-confirmation-cancel-button"
            onClick={onCancel}
            variant="outline"
            className="w-full py-6 text-base"
          >
            {t("common.cancel")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
