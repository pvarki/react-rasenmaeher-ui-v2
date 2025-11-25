"use client"

import { createFileRoute } from "@tanstack/react-router"
import { useState, useRef } from "react"
import { Check, ChevronDown, Download, ArrowLeft, Smartphone, Link2, Binary } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import html2canvas from "html2canvas-pro"
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"

import QRCode from "react-qr-code"
import { useCopyToClipboard } from "@/hooks/helpers/useCopyToClipboard"
import useHealthCheck from "@/hooks/helpers/useHealthcheck"
import { useTranslation } from "react-i18next"

pdfMake.vfs = pdfFonts.vfs

export const Route = createFileRoute("/invite-code/$code")({
  component: InviteCodePage,
})

function InviteCodePage() {
  const { code } = Route.useParams()
  const navigate = useNavigate()
  const qrRef = useRef<HTMLDivElement>(null)
  const [instructionsOpen, setInstructionsOpen] = useState(false)

  const { isCopied, handleCopy } = useCopyToClipboard()
  const { deployment } = useHealthCheck()
  const { t } = useTranslation()

  let hostname = new URL(window.location.origin).hostname
  hostname = hostname.replace(/^mtls\./, "")
  const inviteUrl =
    window.location.protocol +
    "//" +
    hostname +
    (window.location.port ? ":" + window.location.port : "") +
    "/login?code=" +
    (code ?? "")

  const downloadQRCodeAsPDF = async () => {
    if (!qrRef.current) return

    try {
      // Create a temporary container with only safe styles to avoid CSS color function issues
      const tempContainer = document.createElement("div")
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      tempContainer.style.top = "-9999px"
      tempContainer.style.padding = "24px"
      tempContainer.style.borderRadius = "16px"

      // Clone the QR code content
      const qrClone = qrRef.current.cloneNode(true) as HTMLElement
      const safeStyleAll = (el: HTMLElement) => {
        el.style.background = "#ffffff"
        el.style.color = "#000000"
        el.style.borderColor = "#000000"
        el.style.filter = "none"
        Array.from(el.children).forEach((child) => safeStyleAll(child as HTMLElement))
      }
      safeStyleAll(qrClone)

      tempContainer.appendChild(qrClone)
      document.body.appendChild(tempContainer)

      // Convert the temporary container to canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      const qrImage = canvas.toDataURL("image/png")

      // Clean up
      document.body.removeChild(tempContainer)

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
      }

      pdfMake.createPdf(docDefinition).download(`invite-code-${code}.pdf`)
      toast.success(t("inviteCode.pdf.downloadSuccess"))
    } catch (error) {
      console.error("Failed to export PDF:", error)
      toast.error(t("inviteCode.pdf.downloadFailure"))
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="border-b border-border bg-card/50 px-4 md:px-8 py-3">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/add-users" })}
          className="flex items-center gap-2 text-sm hover:bg-accent/50"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("inviteCode.backToInvites")}
        </Button>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-8 overflow-auto">
        <div className="w-full max-w-2xl space-y-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold">{t("inviteCode.title", { code })}</h1>
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-mono">{code}</span>
          </div>

          <div className="flex flex-col items-center space-y-6">
            <div className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: "#ffffff" }} ref={qrRef}>
              <QRCode value={inviteUrl} bgColor="#FFFFFF" fgColor="#000000" size={280} />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => handleCopy(inviteUrl)}
                className="flex-1 bg-primary hover:bg-primary/90 h-12 text-base font-medium rounded-xl relative overflow-hidden"
              >
                <span className={cn("transition-all", isCopied && "opacity-0")}>{t("inviteCode.copyInvite")}</span>
                {isCopied && (
                  <span className="absolute inset-0 flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    {t("inviteCode.copied")}
                  </span>
                )}
              </Button>
              <Button
                onClick={downloadQRCodeAsPDF}
                variant="outline"
                className="flex-1 h-12 text-base font-medium rounded-xl bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                {t("inviteCode.exportPdf")}
              </Button>
            </div>
          </div>

          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              <span className="text-primary font-semibold">1. {t("inviteCode.steps.show")}</span>
            </p>
            <p>
              <span className="text-primary font-semibold">2. {t("inviteCode.steps.alternative")}</span>{" "}
              {t("inviteCode.steps.copyButtonHint")}
            </p>
            <p>
              <span className="text-primary font-semibold">3. {t("inviteCode.steps.print")}</span>{" "}
              {t("inviteCode.steps.printHint")}
            </p>
            <p>
              <span className="text-primary font-semibold">4. {t("inviteCode.steps.callsign")}</span>
            </p>
            <p>
              <span className="text-primary font-semibold">5. {t("inviteCode.steps.waiting")}</span>
            </p>
            <p>
              <span className="text-primary font-semibold">6. {t("inviteCode.steps.approve")}</span>{" "}
              {t("inviteCode.steps.approveHint")}
            </p>
          </div>

          <Collapsible open={instructionsOpen} onOpenChange={setInstructionsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border border-border rounded-xl hover:bg-accent/30 transition-colors">
              <span className="font-medium">{t("inviteCode.approvalMethods.title")}</span>
              <ChevronDown className={cn("w-5 h-5 transition-transform", instructionsOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 p-6 bg-card border border-border rounded-xl space-y-4 text-sm text-muted-foreground leading-relaxed">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Smartphone className="w-4 h-4" />
                  {t("inviteCode.approvalMethods.method1.title")}
                </div>
                <p>{t("inviteCode.approvalMethods.method1.description")}</p>
              </div>

              <hr className="border-border/30" />

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Binary className="w-4 h-4" />
                  {t("inviteCode.approvalMethods.method2.title")}
                </div>
                <p>{t("inviteCode.approvalMethods.method2.description")}</p>
              </div>

              <hr className="border-border/30" />

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Link2 className="w-4 h-4" />
                  {t("inviteCode.approvalMethods.method3.title")}
                </div>
                <p>{t("inviteCode.approvalMethods.method3.description")}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </main>
    </div>
  )
}
