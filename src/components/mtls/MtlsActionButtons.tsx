import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MtlsActionButtonsProps {
  onDownload: () => void;
  mtlsUrl: string;
  isDownloading: boolean;
  disabled: boolean;
}

export function MtlsActionButtons({
  onDownload,
  mtlsUrl,
  isDownloading,
  disabled,
}: MtlsActionButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-4">
      <Button
        onClick={onDownload}
        className="flex-1 bg-green-600 hover:bg-green-700 h-12 rounded-xl"
        disabled={isDownloading || disabled}
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t("mtlsInstall.downloading")}
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            {t("mtlsInstall.downloadButton")}
          </>
        )}
      </Button>
      <a href={mtlsUrl} className="flex-1">
        <Button
          variant="outline"
          className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl border-2"
        >
          {t("mtlsInstall.navigateButton")}
        </Button>
      </a>
    </div>
  );
}
