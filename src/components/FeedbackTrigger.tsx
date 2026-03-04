import { useState, useEffect, useRef } from "react";
import { X, MessageSquarePlus, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { FeedbackForm } from "./Feedbackform";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { OnboardingGuide, type OnboardingGuideHandle } from "./OnboardingGuide";

const STAR_TO_RATING: Record<number, string> = {
  1: "veryBad",
  2: "bad",
  3: "good",
  4: "excellent",
};

export function FeedbackTrigger() {
  const [dialOpen, setDialOpen] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [initialRating, setInitialRating] = useState<string | undefined>(undefined);
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const onboardingRef = useRef<OnboardingGuideHandle>(null);

  useEffect(() => {
    const lastSeen = localStorage.getItem("feedback_popup_last_seen");
    const dismissed = localStorage.getItem("feedback_popup_dismissed");
    const now = Date.now();

    if (dismissed && now - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const shouldShowRandomly = Math.random() < 0.1;
    const moreThanThreeDays =
      !lastSeen || now - parseInt(lastSeen) > 3 * 24 * 60 * 60 * 1000;

    if (shouldShowRandomly || moreThanThreeDays) {
      const timer = setTimeout(() => {
        setDialOpen(true);
        setPopupVisible(true);
        localStorage.setItem("feedback_popup_last_seen", now.toString());
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissPopup = () => {
    setPopupVisible(false);
    localStorage.setItem("feedback_popup_dismissed", Date.now().toString());
  };

  const handleOpenForm = (rating?: string) => {
    setInitialRating(rating);
    setFormOpen(true);
    setPopupVisible(false);
    setDialOpen(false);
  };

  const handleStarClick = (star: number) => {
    setSelectedStar(star);
    setTimeout(() => handleOpenForm(STAR_TO_RATING[star]), 300);
  };

  const handleToggleDial = () => {
    const next = !dialOpen;
    setDialOpen(next);
    if (!next) setPopupVisible(false);
  };

  const activeStar = hoveredStar ?? selectedStar;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

        <div
          className={cn(
            "flex flex-col items-end gap-3 transition-all duration-300",
            dialOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none",
          )}
        >
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-medium bg-card border border-border text-foreground px-2.5 py-1 rounded-lg shadow-sm transition-all duration-300",
              dialOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2",
            )}>
              {t("onboarding.review", "Guide")}
            </span>
            <button
              onClick={() => {
                onboardingRef.current?.openReview();
                setDialOpen(false);
              }}
              className="p-3 rounded-full bg-primary-light hover:bg-primary-light/90 text-white shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-0"
              aria-label={t("onboarding.review", "Review onboarding")}
            >
              <BookOpen className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-medium bg-card border border-border text-foreground px-2.5 py-1 rounded-lg shadow-sm transition-all duration-300 delay-75",
              dialOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2",
            )}>
              {t("feedbackForm.giveFeedback", "Feedback")}
            </span>
            <button
              onClick={() => {
                if (isMobile) {
                  handleOpenForm();
                } else {
                  setPopupVisible((v) => !v);
                }
              }}
              className="p-3 rounded-full bg-card border border-border text-muted-foreground hover:bg-muted hover:text-primary shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-0"
              aria-label={t("feedbackForm.giveFeedback", "Give feedback")}
            >
              <MessageSquarePlus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <button
          onClick={handleToggleDial}
          className={cn(
            "p-3 rounded-full bg-primary-light hover:bg-primary-light/90 text-white shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-0",
          )}
          aria-label={dialOpen ? "Close menu" : "Open menu"}
        >
          <Plus className={cn("h-5 w-5 transition-transform duration-300", dialOpen && "rotate-45")} />
        </button>
      </div>

      {!isMobile && (
        <div
          className={cn(
            "fixed bottom-24 right-6 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl",
            "transition-all duration-300 ease-out",
            popupVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-95 pointer-events-none",
          )}
        >
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-primary/70">
                    {t("feedbackForm.popupEyebrow", "Quick feedback")}
                  </p>
                  <h4 className="text-sm font-bold leading-tight text-foreground">
                    {t("feedbackForm.popupTitle", "How's it going?")}
                  </h4>
                </div>
              </div>
              <button
                onClick={handleDismissPopup}
                className="mt-0.5 shrink-0 rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
              {t(
                "feedbackForm.popupDescription",
                "Rate your experience it takes less than 30 seconds and genuinely helps us improve.",
              )}
            </p>

            <div className="mb-4">
              <div className="flex items-center justify-between gap-1">
                {[1, 2, 3, 4].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    onClick={() => handleStarClick(star)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xl transition-all duration-150",
                      "hover:scale-110 active:scale-95",
                      activeStar !== null && star <= activeStar
                        ? "text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]"
                        : "text-muted-foreground/40",
                    )}
                    aria-label={activeStar !== null ? t(`feedbackForm.ratings.${STAR_TO_RATING[activeStar]}`) : "‎"}
                  >
                    {star}
                  </button>
                ))}
              </div>
              <p
                className={cn(
                  "mt-1 text-center text-xs font-medium transition-all duration-200",
                  activeStar !== null ? "text-yellow-400/80 opacity-100" : "opacity-0",
                )}
              >
                {activeStar !== null ? t(`feedbackForm.ratings.${STAR_TO_RATING[activeStar]}`) : "‎"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDismissPopup}
                className="flex-1 rounded-lg py-2 text-xs text-muted-foreground/70 transition-colors hover:text-muted-foreground"
              >
                {t("common.notNow", "Not now")}
              </button>
              <Button
                size="sm"
                onClick={() => handleOpenForm()}
                className="flex-1 rounded-lg py-2 text-xs font-semibold bg-primary-light hover:bg-primary-light/90"
              >
                {t("feedbackForm.giveFeedback", "Write feedback")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <OnboardingGuide ref={onboardingRef} hideFloatingButton />
      <FeedbackForm open={formOpen} onOpenChange={setFormOpen} initialRating={initialRating} />
    </>
  );
}
