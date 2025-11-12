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
    title: "Get Started",
    description:
      "Deploy App is your central operations hub for managing and launching all tactical systems and services.",
    icon: "👋",
    roles: ["user", "admin"],
  },
  {
    id: "products",
    title: "Access Mission Apps",
    description:
      "Access mission applications and establish secure connections through mTLS-protected channels.",
    icon: "⚙️",
    roles: ["user", "admin"],
  },
  {
    id: "credentials",
    title: "Credentials Ready",
    description:
      "Your authentication certificates are installed and verified. You can operate immediately with full access.",
    icon: "✅",
    roles: ["user", "admin"],
  },
  {
    id: "users",
    title: "Control User Accounts",
    description:
      "Control user access, assign admin roles, and remove inactive accounts to keep the roster accurate.",
    icon: "👥",
    roles: ["admin"],
  },
  {
    id: "invite",
    title: "Add New Operators",
    description:
      "Issue secure invite or QR codes to onboard new team members into your operational network.",
    icon: "📨",
    roles: ["admin"],
  },
  {
    id: "health",
    title: "System Status",
    description:
      "View live system metrics and verify all services are running within mission parameters.",
    icon: "📊",
    roles: ["user", "admin"],
  },
  {
    id: "instructions",
    title: "Tactical Guides",
    description:
      "Access quick-reference manuals, deployment steps, and usage notes for every system in service.",
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

  useEffect(() => {
    if (!callsign || !userType) return;

    const storageKey = `onboarding-${callsign}-${userType}`;
    const roleChangeKey = `onboarding-role-${callsign}`;
    const seenOnboarding = localStorage.getItem(storageKey);
    const lastRole = localStorage.getItem(roleChangeKey);

    const completedSteps = localStorage.getItem(
      `onboarding-steps-${callsign}-${userType}`,
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
  }, [callsign, userType]);

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
      if (callsign && userType) {
        localStorage.setItem(
          `onboarding-steps-${callsign}-${userType}`,
          JSON.stringify(newCompleted),
        );
      }
    }

    if (currentStep === relevantSteps.length - 1) {
      setShowCompletion(true);
      setTimeout(() => {
        if (callsign && userType) {
          localStorage.setItem(`onboarding-${callsign}-${userType}`, "true");
        }
        setOpen(false);
        setShowCompletion(false);
        toast.success("Onboarding completed! Ready to go.", { duration: 3000 });
      }, 2500);
    } else {
      handleNext();
    }
  };

  const handleSkip = () => {
    if (callsign && userType) {
      localStorage.setItem(`onboarding-${callsign}-${userType}`, "true");
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
              <h3 className="text-2xl font-bold">Onboarding Completed!</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                You're all set and ready to operate at full capacity.
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {step.icon} {step.title}
              </DialogTitle>
              <DialogDescription className="pt-2">
                Step {currentStep + 1} of {relevantSteps.length}
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
                {step.description}
              </p>
            </div>

            <div className="flex-row gap-2 flex justify-between">
              <Button variant="ghost" onClick={handleSkip} className="text-xs">
                Skip All
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
                  className="bg-primary hover:bg-primary/90"
                >
                  {currentStep === relevantSteps.length - 1 ? "Finish" : "Next"}
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
