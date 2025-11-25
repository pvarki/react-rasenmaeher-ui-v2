import { useRef } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { useTranslation } from "react-i18next";

pdfMake.vfs = pdfFonts.vfs;

interface UseInvitePdfExportOptions {
  code: string;
  inviteUrl: string;
  deployment?: string;
}

export function useInvitePdfExport({
  code,
  inviteUrl,
  deployment,
}: UseInvitePdfExportOptions) {
  const qrRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const downloadQRCodeAsPDF = async () => {
    if (!qrRef.current) return;

    try {
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      tempContainer.style.padding = "24px";
      tempContainer.style.borderRadius = "16px";

      const qrClone = qrRef.current.cloneNode(true) as HTMLElement;
      const safeStyleAll = (el: HTMLElement) => {
        el.style.background = "#ffffff";
        el.style.color = "#000000";
        el.style.borderColor = "#000000";
        el.style.filter = "none";
        Array.from(el.children).forEach((child) =>
          safeStyleAll(child as HTMLElement)
        );
      };
      safeStyleAll(qrClone);

      tempContainer.appendChild(qrClone);
      document.body.appendChild(tempContainer);

      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const qrImage = canvas.toDataURL("image/png");
      document.body.removeChild(tempContainer);

      const docDefinition = {
        pageSize: "A4" as const,
        pageMargins: [40, 60, 40, 60] as [number, number, number, number],
        content: [
          {
            text: t("inviteCode.pdf.title"),
            fontSize: 28,
            bold: true,
            color: "#1a1a1a",
            alignment: "center" as const,
            margin: [0, 0, 0, 10] as [number, number, number, number],
          },
          ...(deployment
            ? [
                {
                  text: deployment,
                  fontSize: 12,
                  color: "#666666",
                  alignment: "center" as const,
                  margin: [0, 0, 0, 5] as [number, number, number, number],
                },
              ]
            : []),
          {
            text: t("inviteCode.pdf.userEnrollment"),
            fontSize: 14,
            color: "#666666",
            alignment: "center" as const,
            margin: [0, 0, 0, 30] as [number, number, number, number],
          },
          {
            image: qrImage,
            width: 280,
            alignment: "center" as const,
            margin: [0, 0, 0, 20] as [number, number, number, number],
          },
          {
            text: inviteUrl,
            fontSize: 10,
            color: "#0066cc",
            alignment: "center" as const,
            margin: [0, 0, 0, 30] as [number, number, number, number],
            link: inviteUrl,
          },
          {
            text: t("inviteCode.pdf.instructionsTitle"),
            fontSize: 12,
            bold: true,
            color: "#1a1a1a",
            margin: [0, 0, 0, 15] as [number, number, number, number],
          },
          {
            ul: [
              {
                text: t("inviteCode.pdf.steps.step1"),
                margin: [0, 0, 0, 8] as [number, number, number, number],
              },
              {
                text: t("inviteCode.pdf.steps.step2"),
                margin: [0, 0, 0, 8] as [number, number, number, number],
              },
              {
                text: t("inviteCode.pdf.steps.step3"),
                margin: [0, 0, 0, 8] as [number, number, number, number],
              },
              {
                text: t("inviteCode.pdf.steps.step4"),
                margin: [0, 0, 0, 8] as [number, number, number, number],
              },
            ],
            fontSize: 11,
            color: "#444444",
          },
          {
            text: `${t("inviteCode.pdf.generated")} ${new Date().toLocaleString()}`,
            fontSize: 9,
            color: "#999999",
            alignment: "right" as const,
            margin: [0, 40, 0, 0] as [number, number, number, number],
          },
        ],
        footer: {
          text: t("inviteCode.pdf.footer"),
          alignment: "center" as const,
          fontSize: 9,
          color: "#999999",
        },
      };

      pdfMake.createPdf(docDefinition).download(`invite-code-${code}.pdf`);
      toast.success(t("inviteCode.pdf.downloadSuccess"));
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error(t("inviteCode.pdf.downloadFailure"));
    }
  };

  return { qrRef, downloadQRCodeAsPDF };
}
