"use client";

import { useState, useEffect } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ImageOff,
  Smartphone,
  Monitor,
  AlertCircle,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getOperatingSystem } from "@/components/mtls/platformUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MtlsGuideStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  showPlatformInstructions?: boolean;
  androidWarning?: boolean;
}

const MTLS_GUIDE_STEPS: MtlsGuideStep[] = [
  {
    id: "intro",
    title: "mtlsGuide.steps.intro.title",
    description: "mtlsGuide.steps.intro.description",
  },
  {
    id: "download",
    title: "mtlsGuide.steps.download.title",
    description: "mtlsGuide.steps.download.description",
    androidWarning: true,
  },
  {
    id: "install",
    title: "mtlsGuide.steps.install.title",
    description: "mtlsGuide.steps.install.description",
    showPlatformInstructions: true,
  },
];

interface MtlsGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MtlsGuide({ open, onOpenChange }: MtlsGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [imageEnlarged, setImageEnlarged] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [userOS, setUserOS] = useState("");
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  useEffect(() => {
    setUserOS(getOperatingSystem());
  }, []);

  useEffect(() => {
    setShowInstructions(false);
  }, [currentStep, open]);

  const handleNext = () => {
    if (currentStep < MTLS_GUIDE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setImageError(false);
      setImageLoading(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setImageError(false);
      setImageLoading(true);
    }
  };

  const handleComplete = () => {
    if (currentStep === MTLS_GUIDE_STEPS.length - 1) {
      onOpenChange(false);
      setCurrentStep(0);
    } else {
      handleNext();
    }
  };

  if (isMobile === undefined) return null;

  const step = MTLS_GUIDE_STEPS[currentStep];
  const progress = ((currentStep + 1) / MTLS_GUIDE_STEPS.length) * 100;

  const getPlatformSteps = () => {
    const platform = userOS || "Android";
    const stepsKey = `mtlsInstall.platforms.${platform}.steps`;

    const stepCounts: Record<string, number> = {
      Windows: 7,
      MacOS: 5,
      Linux: 4,
      Android: 6,
      iOS: 7,
    };

    const count = stepCounts[platform] || 4;
    const steps = [];

    for (let i = 1; i <= count; i++) {
      steps.push(t(`${stepsKey}.${i}`));
    }

    return steps;
  };

  const contentComponent = (
    <>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{t(step.title)}</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("common.step")} {currentStep + 1} {t("common.of")}{" "}
              {MTLS_GUIDE_STEPS.length}
            </p>
          </div>

          {step.image && (
            <div
              className={cn(
                "relative rounded-lg overflow-hidden border border-border aspect-video w-full shadow-md",
                !imageError && !imageLoading && "cursor-pointer group",
              )}
              onClick={() =>
                !imageError && !imageLoading && setImageEnlarged(true)
              }
            >
              {imageLoading && !imageError && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 text-muted-foreground">
                  <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {imageError ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground gap-3">
                  <ImageOff className="w-12 h-12" />
                  <span className="text-sm font-medium">
                    {t("common.imageNotAvailable") || "Image not available"}
                  </span>
                </div>
              ) : (
                <>
                  <img
                    src={step.image}
                    alt={t(step.title)}
                    loading="lazy"
                    className={cn(
                      "w-full h-full object-contain",
                      imageLoading && "hidden",
                    )}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                  />
                  {!imageLoading && (
                    <div className="absolute inset-0 bg-black/0 flex items-center justify-center group-hover:bg-black/10">
                      <span className="text-white text-sm font-medium opacity-0 bg-black/50 px-3 py-1 rounded-full group-hover:opacity-100">
                        {t("common.clickToEnlarge") || "Click to enlarge"}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(step.description)}
          </p>

          {step.androidWarning && userOS === "Android" && (
            <Alert className="border-orange-500/50 bg-orange-500/10">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-sm text-foreground">
                <strong>{t("mtlsGuide.androidWarning.title")}</strong>
                <br />
                {t("mtlsGuide.androidWarning.description")}
              </AlertDescription>
            </Alert>
          )}

          {step.showPlatformInstructions && (
            <div className="rounded-lg border border-border bg-muted p-4 space-y-3">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center justify-between w-full gap-2 text-sm font-semibold hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isMobile ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    <Monitor className="w-4 h-4" />
                  )}
                  <span>
                    {t("mtlsGuide.installSteps.title")} ({userOS || "Unknown"})
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    showInstructions && "rotate-180",
                  )}
                />
              </button>
              {showInstructions && (
                <ScrollArea className="max-h-[50vh] -mx-1 px-1">
                  <ol className="space-y-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200 pr-4 pb-2">
                    {getPlatformSteps().map((stepText, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="font-medium text-foreground min-w-5">
                          {idx + 1}.
                        </span>
                        <span className="leading-relaxed">{stepText}</span>
                      </li>
                    ))}
                  </ol>
                </ScrollArea>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t px-4 py-4 space-y-4 bg-background">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 h-12 bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t("common.back") || "Back"}
          </Button>

          <Button
            onClick={handleComplete}
            variant={"outline"}
            className="flex-1 h-12 bg-primary-light hover:bg-primary-light/90 text-primary-light-foreground"
          >
            {currentStep === MTLS_GUIDE_STEPS.length - 1
              ? t("common.finish")
              : t("common.next")}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="bg-primary-light/20 relative h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary-light h-1.5 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>
  );

  const enlargedImageModal = step.image && (
    <Dialog open={imageEnlarged} onOpenChange={setImageEnlarged}>
      <DialogContent
        className="max-w-none! w-[95vw]! h-[95vh]! p-0 bg-black/95 border-none shadow-none flex items-center justify-center"
        onClick={() => setImageEnlarged(false)}
      >
        <DialogTitle className="sr-only">{t(step.title)}</DialogTitle>
        <img
          src={step.image}
          alt={t(step.title)}
          className="w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </DialogContent>
    </Dialog>
  );

  if (isMobile) {
    return (
      <>
        {enlargedImageModal}
        <Drawer open={open} onOpenChange={onOpenChange} dismissible={false}>
          <DrawerContent className="flex flex-col max-h-[95vh] bg-background border-t">
            {contentComponent}
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <>
      {enlargedImageModal}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTitle className="sr-only">
          {t("mtlsGuide.title") || "mTLS Certificate Guide"}
        </DialogTitle>
        <DialogContent className="flex flex-col max-h-[90vh] w-full max-w-2xl bg-background">
          {contentComponent}
        </DialogContent>
      </Dialog>
    </>
  );
}
