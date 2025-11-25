import { useState } from "react";
import { useTranslation } from "react-i18next";
import FeedbackForm from "@/components/Feedbackform";

interface FooterProps {
  onMtlsInfoClick: () => void;
}

export function Footer({ onMtlsInfoClick }: FooterProps) {
  const { t } = useTranslation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-border bg-card/50 px-4 md:px-8 py-8 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="font-semibold text-foreground text-sm">
                {t("common.deployApp")}
              </p>
              <p className="text-muted-foreground/80">
                {t("common.proudlyServedBy")}{" "}
                <button
                  onClick={onMtlsInfoClick}
                  className="text-primary hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  {t("common.learnAboutMtls")}
                </button>
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground text-sm">
                {t("common.feedback")}
              </p>
              <p className="text-muted-foreground/80">
                <button
                  onClick={() => setFeedbackOpen(true)}
                  className="text-primary hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  {t("common.letDevelopersKnow")}
                </button>{" "}
                {t("common.whatYouThink")}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs leading-relaxed text-muted-foreground/50">
                {t("common.copyright")} <br /> {t("common.rmUi")}
              </p>
            </div>
          </div>
        </div>
      </footer>
      <FeedbackForm open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  );
}
