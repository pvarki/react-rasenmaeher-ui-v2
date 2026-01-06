"use client";

import { useState } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, ImageOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface LoginGuideStep {
  id: string;
  title: string;
  description: string;
  image?: string;
}

const LOGIN_GUIDE_STEPS: LoginGuideStep[] = [
  {
    id: "welcome",
    title: "loginGuide.steps.welcome.title",
    description: "loginGuide.steps.welcome.description",
  },
  {
    id: "methods",
    title: "loginGuide.steps.methods.title",
    description: "loginGuide.steps.methods.description",
  },
];

interface LoginGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginGuide({ open, onOpenChange }: LoginGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [imageEnlarged, setImageEnlarged] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const handleNext = () => {
    if (currentStep < LOGIN_GUIDE_STEPS.length - 1) {
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
    if (currentStep === LOGIN_GUIDE_STEPS.length - 1) {
      onOpenChange(false);
      setCurrentStep(0);
    } else {
      handleNext();
    }
  };

  if (isMobile === undefined) return null;

  const step = LOGIN_GUIDE_STEPS[currentStep];
  const progress = ((currentStep + 1) / LOGIN_GUIDE_STEPS.length) * 100;

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
              {LOGIN_GUIDE_STEPS.length}
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
        </div>
      </div>

      <div className="border-t px-4 py-4 flex gap-3 bg-background">
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
          {currentStep === LOGIN_GUIDE_STEPS.length - 1
            ? t("common.finish")
            : t("common.next")}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="bg-primary-light/20 relative h-2 w-full overflow-hidden rounded-full mt-6 md:mt-0">
        <div
          className="bg-primary-light h-2 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
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
        <Drawer open={open} onOpenChange={onOpenChange}>
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
          {t("loginGuide.title") || "Login Guide"}
        </DialogTitle>
        <DialogContent className="flex flex-col max-h-[90vh] w-full max-w-2xl bg-background">
          {contentComponent}
        </DialogContent>
      </Dialog>
    </>
  );
}
