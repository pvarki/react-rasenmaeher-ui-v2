import { Button } from "@/components/ui/button";
import { ArrowBigRightDash, Download, Loader2 } from "lucide-react";
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
    <div className="flex flex-col md:flex-row gap-8 md:gap-4 pt-4">
      <Button
        onClick={onDownload}
        variant={"outline"}
        className="flex-1 rounded-xl bg-primary-light hover:bg-primary-light/90 w-full h-12 py-4 font-semibold"
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
      <a href={mtlsUrl} className="flex-1 ">
        <Button
          variant="ghost"
          className="w-full text-white h-12 rounded-xl border-2"
        >
          {t("mtlsInstall.navigateButton")}
          <ArrowBigRightDash className="w-4 h-4 ml-2" />
        </Button>
      </a>
    </div>
  );
}
