"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useUserType } from "@/hooks/auth/useUserType";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";

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
  icon: React.ReactNode;
  roles: ("user" | "admin")[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "onboarding.steps.welcome.title",
    description: "onboarding.steps.welcome.description",
    icon: "👋",
    roles: ["user", "admin"],
  },
  {
    id: "products",
    title: "onboarding.steps.products.title",
    description: "onboarding.steps.products.description",
    icon: "⚙️",
    roles: ["user", "admin"],
  },
  {
    id: "credentials",
    title: "onboarding.steps.credentials.title",
    description: "onboarding.steps.credentials.description",
    icon: "✅",
    roles: ["user", "admin"],
  },
  {
    id: "users",
    title: "onboarding.steps.users.title",
    description: "onboarding.steps.users.description",
    icon: "👥",
    roles: ["admin"],
  },
  {
    id: "invite",
    title: "onboarding.steps.invite.title",
    description: "onboarding.steps.invite.description",
    icon: "📨",
    roles: ["admin"],
  },
  {
    id: "health",
    title: "onboarding.steps.health.title",
    description: "onboarding.steps.health.description",
    icon: "📊",
    roles: ["user", "admin"],
  },
  {
    id: "instructions",
    title: "onboarding.steps.instructions.title",
    description: "onboarding.steps.instructions.description",
    icon: "📖",
    roles: ["user", "admin"],
  },
];

export function OnboardingGuide() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const { userType, callsign } = useUserType();
  const { t } = useTranslation();
  const { deployment } = useHealthCheck();

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
      // User was promoted, only show admin-specific steps they haven't seen
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
      setCompleted(JSON.parse(completedSteps));
    }
  }, [callsign, userType, deployment]);

  const relevantSteps = ONBOARDING_STEPS.filter((step) =>
    step.roles.includes(userType as "user" | "admin"),
  );

  const handleNext = () => {
    if (currentStep < relevantSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
      setShowCompletion(true);
      setTimeout(() => {
        if (callsign && userType && deployment) {
          const deploymentHash = hashString(deployment);
          localStorage.setItem(
            `${deploymentHash}-onboarding-${callsign}-${userType}`,
            "true",
          );
        }
        setOpen(false);
        setShowCompletion(false);
        toast.success(t("onboarding.completion"), { duration: 3000 });
      }, 2500);
    } else {
      handleNext();
    }
  };

  const handleSkip = () => {
    if (callsign && userType && deployment) {
      const deploymentHash = hashString(deployment);
      localStorage.setItem(
        `${deploymentHash}-onboarding-${callsign}-${userType}`,
        "true",
      );
    }
    setOpen(false);
  };

  if (relevantSteps.length === 0) return null;

  const step = relevantSteps[currentStep];
  const progress = ((currentStep + 1) / relevantSteps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        {showCompletion ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
              <CheckCircle2 className="w-24 h-24 text-primary relative" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">
                {t("onboarding.completion")}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {t("onboarding.completionDesc")}
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {step.icon} {t(step.title)}
              </DialogTitle>
              <DialogDescription className="pt-2">
                {t("onboarding.step")} {currentStep + 1} {t("onboarding.of")}{" "}
                {relevantSteps.length}
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <div className="w-full bg-muted rounded-full h-2 mb-6">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(step.description)}
              </p>
            </div>

            <div className="flex-row gap-2 flex justify-between">
              <Button variant="ghost" onClick={handleSkip} className="text-xs">
                {t("onboarding.skipAll")}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleComplete}
                  size="sm"
                  className="bg-primary-light hover:bg-primary-light/90"
                  variant={"outline"}
                >
                  {currentStep === relevantSteps.length - 1
                    ? t("onboarding.finish")
                    : t("onboarding.next")}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
