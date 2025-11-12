"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Check,
  ChevronDown,
  Download,
  ArrowLeft,
  Smartphone,
  Link2,
  Binary,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import QRCode from "react-qr-code";
import { useCopyToClipboard } from "@/hooks/helpers/useCopyToClipboard";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";

pdfMake.vfs = pdfFonts.vfs;

export const Route = createFileRoute("/invite-code/$code")({
  component: InviteCodePage,
});

function InviteCodePage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const qrRef = useRef<HTMLDivElement>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  const { isCopied, handleCopy } = useCopyToClipboard();
  const { deployment } = useHealthCheck();

  let hostname = new URL(window.location.origin).hostname;
  hostname = hostname.replace(/^mtls\./, "");
  const inviteUrl =
    window.location.protocol +
    "//" +
    hostname +
    (window.location.port ? ":" + window.location.port : "") +
    "/login?code=" +
    (code ?? "");

  const downloadQRCodeAsPDF = async () => {
    if (!qrRef.current) return;

    try {
      // Create a temporary container with only safe styles to avoid CSS color function issues
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      tempContainer.style.padding = "24px";
      tempContainer.style.borderRadius = "16px";
      console.log("tempContainer styles set");

      // Clone the QR code content
      const qrClone = qrRef.current.cloneNode(true) as HTMLElement;
      console.log("QR code cloned");
      const safeStyleAll = (el: HTMLElement) => {
        el.style.background = "#ffffff";
        el.style.color = "#000000";
        el.style.borderColor = "#000000";
        el.style.filter = "none";
        Array.from(el.children).forEach((child) =>
          safeStyleAll(child as HTMLElement),
        );
      };
      safeStyleAll(qrClone);

      tempContainer.appendChild(qrClone);
      document.body.appendChild(tempContainer);
      console.log("tempContainer appended to body");

      // Convert the temporary container to canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      console.log("Canvas created from tempContainer");
      const qrImage = canvas.toDataURL("image/png");
      console.log("QR image data URL generated");

      // Clean up
      document.body.removeChild(tempContainer);
      console.log("tempContainer removed from body");

      const docDefinition = {
        pageSize: "A4" as const,
        pageMargins: [40, 60, 40, 60] as [number, number, number, number],
        content: [
          {
            text: "Deploy App",
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
            text: "User Enrollment QR Code",
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
            text: "Instructions:",
            fontSize: 12,
            bold: true,
            color: "#1a1a1a",
            margin: [0, 0, 0, 15] as [number, number, number, number],
          },
          {
            ul: [
              {
                text: "Point your camera at the QR code above",
                margin: [0, 0, 0, 8] as [number, number, number, number],
              },
              {
                text: "Or visit the link and follow the enrollment process",
                margin: [0, 0, 0, 8] as [number, number, number, number],
              },
              {
                text: "Set your callsign when prompted",
                margin: [0, 0, 0, 8] as [number, number, number, number],
              },
              {
                text: "Wait for administrator approval",
                margin: [0, 0, 0, 8] as [number, number, number, number],
              },
            ],
            fontSize: 11,
            color: "#444444",
          },
          {
            text: `Generated: ${new Date().toLocaleString()}`,
            fontSize: 9,
            color: "#999999",
            alignment: "right" as const,
            margin: [0, 40, 0, 0] as [number, number, number, number],
          },
        ],
        footer: {
          text: "Deploy App",
          alignment: "center" as const,
          fontSize: 9,
          color: "#999999",
        },
      };

      pdfMake.createPdf(docDefinition).download(`invite-code-${code}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <div className="flex-1 flex flex-col md:ml-64">
        <div className="border-b border-border bg-card/50 px-4 md:px-8 py-3">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/add-users" })}
            className="flex items-center gap-2 text-sm hover:bg-accent/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invites
          </Button>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Invite Code {code}</h1>
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-mono">
                {code}
              </span>
            </div>

            <div className="md:bg-card md:border border-border rounded-xl flex flex-col items-center space-y-6">
              <div
                className="p-6 rounded-2xl shadow-lg mt-8"
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
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm px-8 mb-8">
                <Button
                  onClick={() => handleCopy(inviteUrl)}
                  className="flex-1 bg-primary hover:bg-primary/90 h-12 text-base font-medium rounded-xl relative overflow-hidden"
                >
                  <span
                    className={cn("transition-all", isCopied && "opacity-0")}
                  >
                    Copy invite link
                  </span>
                  {isCopied && (
                    <span className="absolute inset-0 flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" />
                      Copied!
                    </span>
                  )}
                </Button>
                <Button
                  onClick={downloadQRCodeAsPDF}
                  variant="outline"
                  className="flex-1 h-12 text-base font-medium rounded-xl bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                <span className="text-primary font-semibold">1. Show</span> this
                QR code to your user.
              </p>
              <p>
                <span className="text-primary font-semibold">
                  2. Alternatively,
                </span>{" "}
                press the <span className="font-medium">Copy invite link</span>{" "}
                button above, and paste & send the link to the user you want to
                enroll.
              </p>
              <p>
                <span className="text-primary font-semibold">
                  3. Print & Post
                </span>{" "}
                the exported PDF on a physical poster so soldiers can scan it
                during onboarding.
              </p>
              <p>
                <span className="text-primary font-semibold">4.</span> Via the
                QR code or the link, your user can log in and get to set their{" "}
                <span className="text-primary font-medium">callsign</span>.
              </p>
              <p>
                <span className="text-primary font-semibold">5.</span> After
                that, they are in the Waiting Room.
              </p>
              <p>
                <span className="text-primary font-semibold">6. Approve</span>{" "}
                your user by one of the methods below.
              </p>
            </div>

            <Collapsible
              open={instructionsOpen}
              onOpenChange={setInstructionsOpen}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border border-border rounded-xl hover:bg-accent/30 transition-colors">
                <span className="font-medium">Approval methods</span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 transition-transform",
                    instructionsOpen && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 p-6 bg-card border border-border rounded-xl space-y-4 text-sm text-muted-foreground leading-relaxed">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Smartphone className="w-4 h-4" />
                    Method 1: QR Code Scanning
                  </div>
                  <p>
                    Ask the user to show you their approval code on their
                    Waiting Room screen. Use your device's camera or a QR code
                    scanner app to scan the QR code. The approval will be
                    processed automatically.
                  </p>
                </div>

                <hr className="border-border/30" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Binary className="w-4 h-4" />
                    Method 2: Approval Code
                  </div>
                  <p>
                    Take the{" "}
                    <span className="font-semibold">approval code</span> from
                    their Waiting Room screen and use it in the{" "}
                    <span className="font-semibold">"Approve Users"</span> view.
                  </p>
                </div>

                <hr className="border-border/30" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Link2 className="w-4 h-4" />
                    Method 3: Link Approval
                  </div>
                  <p>
                    Ask them to provide you the approval link from their Waiting
                    Room screen, which you can click to approve them directly.
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </main>
      </div>
    </div>
  );
}
