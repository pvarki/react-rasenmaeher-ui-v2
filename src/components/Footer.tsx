import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronUp } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { OnboardingGuide } from "./OnboardingGuide";
import { useIsCompactViewport } from "@/hooks/use-compact-viewport";

interface FooterProps {
  onMtlsInfoClick: () => void;
}

export function Footer({ onMtlsInfoClick }: FooterProps) {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isCompact = useIsCompactViewport();

  const footerContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="font-semibold text-foreground text-sm">
          {t("common.deployApp")}
        </p>
        <p className="text-muted-foreground/80 text-sm">
          {t("common.proudlyServedBy")}{" "}
          <button
            onClick={() => {
              setDrawerOpen(false);
              onMtlsInfoClick();
            }}
            className="text-primary hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            {t("common.learnAboutMtls")}
          </button>
        </p>
      </div>
      <div className="pt-2 border-t border-border">
        <p className="text-xs leading-relaxed text-muted-foreground/50">
          {t("common.copyright")} <br /> {t("common.rmUi")}
        </p>
      </div>
    </div>
  );

  if (isCompact) {
    return (
      <div>
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <button className="w-full py-4 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors border-t border-border bg-card/50">
              <ChevronUp className="h-3 w-3" />
              <span>{t("common.footer", "Avaa alatunniste")}</span>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerDescription className="sr-only" />
            <DrawerTitle className="sr-only" />
            <div className="px-4 pb-6">{footerContent}</div>
          </DrawerContent>
        </Drawer>
        <OnboardingGuide />
      </div>
    );
  }

  return (
    <>
      <footer className="border-t border-border bg-card/50 px-8 py-6 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto">{footerContent}</div>
      </footer>
      <OnboardingGuide />
    </>
  );
}
