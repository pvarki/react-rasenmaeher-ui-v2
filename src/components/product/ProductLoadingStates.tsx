import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface ProductLoadingProps {
  message: string;
}

export function ProductLoading({ message }: ProductLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

interface ProductErrorProps {
  onGoHome: () => void;
}

export function ProductError({ onGoHome }: ProductErrorProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-sm text-destructive">{t("product.failedToLoad")}</p>
        <Button onClick={onGoHome}>{t("product.goHome")}</Button>
      </div>
    </div>
  );
}
