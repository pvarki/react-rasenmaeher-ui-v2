"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, RotateCcw, ImageOff } from "lucide-react";
import { useUserType } from "@/hooks/auth/useUserType";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";
import { cn } from "@/lib/utils";
import { getActiveThemeName } from "@/config/asset-loader";

const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).padStart(8, "0").slice(0, 8);
};

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  image: string;
  mobileImage?: string;
  roles: ("user" | "admin")[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "onboarding.steps.welcome.title",
    description: "onboarding.steps.welcome.description",
    image: "/Onboarding/ON_BOARDING_WELCOME.png",
    mobileImage: "/Onboarding/mobile/ON_BOARDING_WELCOME.png",
    roles: ["user", "admin"],
  },
  {
    id: "products",
    title: "onboarding.steps.products.title",
    description: "onboarding.steps.products.description",
    image: "/Onboarding/ON_BOARDING_LAUNCH.png",
    mobileImage: "/Onboarding/mobile/ON_BOARDING_LAUNCH.png",
    roles: ["user", "admin"],
  },
  {
    id: "users",
    title: "onboarding.steps.users.title",
    description: "onboarding.steps.users.description",
    image: "/Onboarding/ON_BOARDING_USER_MANAGEMENT.png",
    mobileImage: "/Onboarding/mobile/ON_BOARDING_USER_MANAGEMENT.png",
    roles: ["admin"],
  },
  {
    id: "invite",
    title: "onboarding.steps.invite.title",
    description: "onboarding.steps.invite.description",
    image: "/Onboarding/ON_BOARDING_INVITE_OTHERS.png",
    mobileImage: "/Onboarding/mobile/ON_BOARDING_INVITE_OTHERS.png",
    roles: ["admin"],
  },
  {
    id: "health",
    title: "onboarding.steps.health.title",
    description: "onboarding.steps.health.description",
    image: "/Onboarding/ON_BOARDING_SYSTEM_STATUS.png",
    mobileImage: "/Onboarding/mobile/ON_BOARDING_SYSTEM_STATUS.png",
    roles: ["user", "admin"],
  },
  {
    id: "instructions",
    title: "onboarding.steps.instructions.title",
    description: "onboarding.steps.instructions.description",
    image: "/Onboarding/ON_BOARDING_DOCS.png",
    mobileImage: "/Onboarding/mobile/ON_BOARDING_DOCS.png",
    roles: ["user", "admin"],
  },
];

const getOnboardingImage = (
  step: OnboardingStep,
  isMobile: boolean,
  forceDesktop: boolean = false,
): string => {
  const themeName = getActiveThemeName();
  const imagePath = forceDesktop
    ? step.image
    : isMobile && step.mobileImage
      ? step.mobileImage
      : step.image;

  if (themeName) {
    const themeImagePath = `/themes/${themeName}/assets${imagePath}`;
    return themeImagePath;
  }

  return imagePath;
};

// Image cache to store preloaded images
const imageCache = new Map<string, { loaded: boolean; error: boolean }>();

const preloadImage = (src: string): Promise<void> => {
  if (imageCache.has(src)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, { loaded: true, error: false });
      resolve();
    };
    img.onerror = () => {
      imageCache.set(src, { loaded: true, error: true });
      resolve();
    };
    img.src = src;
  });
};

export function OnboardingGuide() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [imageEnlarged, setImageEnlarged] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const preloadedForDeviceRef = useRef<boolean | null>(null);
  const isMobile = useIsMobile();
  const { userType, callsign } = useUserType();
  const { t } = useTranslation();
  const { deployment } = useHealthCheck();

  const relevantSteps = ONBOARDING_STEPS.filter((step) =>
    step.roles.includes(userType as "user" | "admin"),
  );

  // Preload all relevant images on mount (device-appropriate images)
  useEffect(() => {
    // Skip if isMobile is not yet determined
    if (isMobile === undefined || relevantSteps.length === 0) return;

    // Skip if we already preloaded for this device type
    if (preloadedForDeviceRef.current === isMobile) return;

    preloadedForDeviceRef.current = isMobile;

    const preloadAllImages = async () => {
      // Preload device-appropriate images for inline display
      const inlineImages = relevantSteps.map((step) =>
        getOnboardingImage(step, isMobile, false),
      );
      // Also preload desktop images for enlarged modal
      const desktopImages = relevantSteps.map((step) =>
        getOnboardingImage(step, isMobile, true),
      );
      await Promise.all([...inlineImages, ...desktopImages].map(preloadImage));
    };

    preloadAllImages();
  }, [relevantSteps, isMobile]);

  // Check cache and set loading/error state when step changes
  const checkImageCache = useCallback((url: string) => {
    const cached = imageCache.get(url);
    if (cached) {
      setImageLoading(false);
      setImageError(cached.error);
    } else {
      setImageLoading(true);
      setImageError(false);
    }
  }, []);

  useEffect(() => {
    if (!callsign || !userType || !deployment) return;

    const deploymentHash = hashString(deployment);
    const storageKey = `${deploymentHash}-onboarding-${callsign}-${userType}`;
    const roleChangeKey = `${deploymentHash}-onboarding-role-${callsign}`;
    const seenOnboarding = localStorage.getItem(storageKey);
    const lastRole = localStorage.getItem(roleChangeKey);

    const completedSteps = localStorage.getItem(
      `${deploymentHash}-onboarding-steps-${callsign}-${userType}`,
    );

    if (lastRole && lastRole !== userType && userType === "admin") {
      const adminSteps = ONBOARDING_STEPS.filter((step) =>
        step.roles.includes("admin"),
      );
      const newAdminSteps = adminSteps.map((step) => step.id);
      setCompleted(
        newAdminSteps.filter((id) => !["users", "invite"].includes(id)),
      );
      setCurrentStep(adminSteps.findIndex((step) => step.id === "users"));
      setOpen(true);
      localStorage.setItem(roleChangeKey, userType);
      return;
    }

    if (!seenOnboarding && lastRole !== userType) {
      setOpen(true);
      localStorage.setItem(roleChangeKey, userType);
    }

    if (completedSteps) {
      const parsedCompleted = JSON.parse(completedSteps) as string[];
      setCompleted(parsedCompleted);

      // Restore progress: find the first incomplete step
      if (parsedCompleted.length > 0 && !seenOnboarding) {
        const stepsForRole = ONBOARDING_STEPS.filter((step) =>
          step.roles.includes(userType as "user" | "admin"),
        );
        const firstIncompleteIndex = stepsForRole.findIndex(
          (step) => !parsedCompleted.includes(step.id),
        );
        if (firstIncompleteIndex !== -1) {
          setCurrentStep(firstIncompleteIndex);
        } else {
          // All steps completed, go to last step
          setCurrentStep(stepsForRole.length - 1);
        }
        setCanReview(true);
      }
    }
  }, [callsign, userType, deployment]);

  // Check cache when step changes
  useEffect(() => {
    if (
      relevantSteps.length > 0 &&
      isMobile !== undefined &&
      relevantSteps[currentStep]
    ) {
      const url = getOnboardingImage(
        relevantSteps[currentStep],
        isMobile,
        false,
      );
      if (url) {
        checkImageCache(url);
      }
    }
  }, [currentStep, relevantSteps, checkImageCache, isMobile]);

  const handleNext = () => {
    if (currentStep < relevantSteps.length - 1) {
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

  const handleReviewClick = () => {
    setReviewMode(true);
    setCurrentStep(0);
    setOpen(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && reviewMode) {
      setReviewMode(false);
    } else if (!newOpen && !reviewMode && !showCompletion) {
      if (callsign && userType && deployment) {
        const deploymentHash = hashString(deployment);
        const newCompleted = [...completed];
        const step = relevantSteps[currentStep];
        if (!newCompleted.includes(step.id)) {
          newCompleted.push(step.id);
        }
        localStorage.setItem(
          `${deploymentHash}-onboarding-steps-${callsign}-${userType}`,
          JSON.stringify(newCompleted),
        );
        setCompleted(newCompleted);
      }
      setCanReview(true);
      toast.success(t("onboarding.progressSaved") || "Progress saved", {
        duration: 2000,
      });
    }
  };

  const handleComplete = () => {
    const step = relevantSteps[currentStep];
    if (!completed.includes(step.id)) {
      const newCompleted = [...completed, step.id];
      setCompleted(newCompleted);
      if (callsign && userType && deployment) {
        const deploymentHash = hashString(deployment);
        localStorage.setItem(
          `${deploymentHash}-onboarding-steps-${callsign}-${userType}`,
          JSON.stringify(newCompleted),
        );
      }
    }

    if (currentStep === relevantSteps.length - 1) {
      if (callsign && userType && deployment) {
        const deploymentHash = hashString(deployment);
        localStorage.setItem(
          `${deploymentHash}-onboarding-${callsign}-${userType}`,
          "true",
        );
      }
      setOpen(false);
      setShowCompletion(false);
      setCanReview(true);
      setReviewMode(false);
      toast.success(t("onboarding.completion"), { duration: 3000 });
    } else {
      handleNext();
    }
  };

  if (relevantSteps.length === 0) return null;
  if (isMobile === undefined) return null;

  const step = relevantSteps[currentStep];
  const progress = ((currentStep + 1) / relevantSteps.length) * 100;
  const imageUrl = getOnboardingImage(step, isMobile, false);
  const enlargedImageUrl = getOnboardingImage(step, isMobile, false);

  if (canReview && !open && !reviewMode) {
    return (
      <button
        onClick={handleReviewClick}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-primary-light hover:bg-primary-light/90 shadow-lg transition-all z-40 hover:scale-110"
        title={t("onboarding.review") || "Review onboarding"}
        aria-label={t("onboarding.review")}
      >
        <RotateCcw className="w-5 h-5" />
      </button>
    );
  }

  const contentComponent = (
    <>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{t(step.title)}</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("onboarding.step")} {currentStep + 1} {t("onboarding.of")}{" "}
              {relevantSteps.length}
            </p>
          </div>

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
                  {t("onboarding.imageMissing") || "Image not available"}
                </span>
              </div>
            ) : (
              <>
                <img
                  src={imageUrl}
                  alt={t(step.title)}
                  loading="lazy"
                  className={cn(
                    "w-full h-full object-contain [image-rendering:-webkit-optimize-contrast]",
                    imageLoading && "hidden",
                  )}
                  onLoad={() => {
                    setImageLoading(false);
                    imageCache.set(imageUrl, { loaded: true, error: false });
                  }}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                    imageCache.set(imageUrl, { loaded: true, error: true });
                  }}
                />
                {!imageLoading && (
                  <div className="absolute inset-0 bg-black/0 flex items-center justify-center group-hover:bg-black/10">
                    <span className="text-white text-sm font-medium opacity-0 bg-black/50 px-3 py-1 rounded-full group-hover:opacity-100">
                      {t("onboarding.clickToEnlarge") || "Click to enlarge"}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
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
          {t("onboarding.back") || "Back"}
        </Button>

        <Button
          onClick={handleComplete}
          variant={"outline"}
          className="flex-1 h-12 bg-primary-light hover:bg-primary-light/90 text-primary-light-foreground"
        >
          {currentStep === relevantSteps.length - 1
            ? t("onboarding.finish")
            : t("onboarding.next")}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="bg-primary-light/20 relative h-2 w-full overflow-hidden rounded-full mt-6 md:mt-0 ">
        <div
          className="bg-primary-light h-2"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  );

  const enlargedImageModal = (
    <Dialog open={imageEnlarged} onOpenChange={setImageEnlarged}>
      <DialogContent
        className="max-w-none! w-[95vw]! h-[95vh]! p-0 bg-black/95 border-none shadow-none flex items-center justify-center"
        onClick={() => setImageEnlarged(false)}
      >
        <DialogTitle className="sr-only">{t(step.title)}</DialogTitle>
        <img
          src={enlargedImageUrl}
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
        <Drawer open={open} onOpenChange={handleOpenChange}>
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
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTitle className="sr-only">
          {t("onboarding.title") || "Onboarding Guide"}
        </DialogTitle>
        <DialogContent className="flex flex-col max-h-[90vh] w-full max-w-2xl bg-background">
          {contentComponent}
        </DialogContent>
      </Dialog>
    </>
  );
}
