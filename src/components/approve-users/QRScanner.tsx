import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Camera, Scan } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import jsQR from "jsqr";

interface QRScannerProps {
  onScanSuccess: (callsign: string, approvalCode: string) => void;
  onApprovalCodeScanned: (approvalCode: string) => void;
}

export function QRScanner({
  onScanSuccess,
  onApprovalCodeScanned,
}: QRScannerProps) {
  const { t } = useTranslation();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const scanQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      try {
        const url = new URL(code.data);
        const callsignParam = url.searchParams.get("callsign");
        const approvalCodeParam = url.searchParams.get("approvalcode");

        if (callsignParam && approvalCodeParam) {
          onScanSuccess(callsignParam, approvalCodeParam);
          setIsScannerOpen(false);
          toast.success(t("approveUsers.qrScannedSuccessfully"));
        } else {
          toast.error(t("approveUsers.invalidQRFormat"));
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        onApprovalCodeScanned(code.data);
        setIsScannerOpen(false);
        toast.success(t("approveUsers.approvalCodeScanned"));
      }
    }
  }, [onScanSuccess, onApprovalCodeScanned, t]);

  const stopScanning = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsScanning(false);
    }
  }, []);

  const startScanning = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        setScanError("");

        scanIntervalRef.current = window.setInterval(scanQRCode, 100);
      }
    } catch (err) {
      setScanError(t("approveUsers.cameraAccessFailed"));
      console.error(t("approveUsers.cameraError"), err);
    }
  }, [scanQRCode, t]);

  useEffect(() => {
    if (isScannerOpen && !isScanning) {
      startScanning();
    } else if (!isScannerOpen && isScanning) {
      stopScanning();
    }
  }, [isScannerOpen, isScanning, startScanning, stopScanning]);

  return (
    <Drawer open={isScannerOpen} onOpenChange={setIsScannerOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 rounded-xl bg-transparent h-14 text-base font-semibold cursor-pointer"
        >
          <Camera className="w-4 h-4 mr-2" />
          {t("approveUsers.scanQRCode")}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh] md:h-auto">
        <div className="mx-auto w-full max-w-sm flex flex-col h-full md:h-auto">
          <DrawerHeader className="pt-4 md:pt-10 shrink-0">
            <DrawerTitle className="text-center">
              <Scan className="mb-2 mx-auto size-10 md:size-12" />
              <p className="text-sm md:text-base">
                {t("approveUsers.scanApprovalQR")}
              </p>
            </DrawerTitle>
            <DrawerDescription className="text-sm md:text-md mt-3">
              {t("approveUsers.pointCamera")}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 md:px-8 flex-1 flex flex-col">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-dashed border-muted-foreground/40 bg-muted flex-1">
              <video
                ref={videoRef}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover",
                  !isScanning && "hidden",
                )}
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {!isScanning && (
                <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                  {t("approveUsers.cameraPreview")}
                </div>
              )}
            </div>

            {scanError && (
              <p className="mt-3 text-sm text-destructive text-center">
                {scanError}
              </p>
            )}
          </div>

          <DrawerFooter className="shrink-0 gap-3 p-4 md:p-8">
            <Button
              variant="outline"
              onClick={() => setIsScannerOpen(false)}
              className="w-full h-11 md:h-12 cursor-pointer"
            >
              {t("approveUsers.close")}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
