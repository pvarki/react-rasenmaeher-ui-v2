import type { RefObject } from "react";
import { Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import { useCopyToClipboard } from "@/hooks/helpers/useCopyToClipboard";
import { useTranslation } from "react-i18next";

interface InviteQRCodeCardProps {
  inviteUrl: string;
  qrRef: RefObject<HTMLDivElement>;
  onDownloadPdf: () => void;
}

export function InviteQRCodeCard({
  inviteUrl,
  qrRef,
  onDownloadPdf,
}: InviteQRCodeCardProps) {
  const { isCopied, handleCopy } = useCopyToClipboard();
  const { t } = useTranslation();

  return (
    <div
      data-testid="invite-qr-card"
      data-invite-url={inviteUrl}
      className="flex flex-col items-center space-y-6"
    >
      <div
        className="p-6 rounded-2xl shadow-lg"
        style={{ backgroundColor: "#ffffff" }}
        ref={qrRef}
      >
        <QRCode
          value={inviteUrl}
          bgColor="#FFFFFF"
          fgColor="#000000"
          size={280}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          data-testid="invite-copy-button"
          data-invite-copied={isCopied ? "true" : "false"}
          variant={"outline"}
          onClick={() => handleCopy(inviteUrl)}
          className="flex-1 bg-primary-light hover:bg-primary-light/90 h-12 text-base font-medium rounded-xl relative overflow-hidden"
        >
          <span className={cn("transition-all", isCopied && "opacity-0")}>
            {t("inviteCode.copyInvite")}
          </span>
          {isCopied && (
            <span className="absolute inset-0 flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              {t("inviteCode.copied")}
            </span>
          )}
        </Button>
        <Button
          data-testid="invite-export-pdf-button"
          onClick={onDownloadPdf}
          variant="outline"
          className="flex-1 h-12 text-base font-medium rounded-xl bg-transparent"
        >
          <Download className="w-4 h-4 mr-2" />
          {t("inviteCode.exportPdf")}
        </Button>
      </div>
    </div>
  );
}
