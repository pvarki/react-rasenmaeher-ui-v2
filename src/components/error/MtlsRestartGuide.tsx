"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  Copy,
  Info,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { PlatformSelector } from "@/components/mtls/PlatformSelector";
import {
  BROWSER_RESTART_INSTRUCTIONS,
  getMtlsUrl,
  getOperatingSystem,
} from "@/components/mtls/platformUtils";

const FALLBACK_OS = "Windows";

export function MtlsRestartGuide() {
  const { t } = useTranslation();
  const [detectedOS, setDetectedOS] = useState("");
  const [selectedOS, setSelectedOS] = useState("");
  const [copied, setCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const os = getOperatingSystem();
    setDetectedOS(os in BROWSER_RESTART_INSTRUCTIONS ? os : FALLBACK_OS);
  }, []);

  const osToShow = selectedOS || detectedOS;
  const instructions =
    BROWSER_RESTART_INSTRUCTIONS[osToShow] ??
    BROWSER_RESTART_INSTRUCTIONS[FALLBACK_OS];
  const mtlsUrl = getMtlsUrl();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mtlsUrl);
      setCopied(true);
      toast.success(t("error.mtls_fail.restart.copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("error.mtls_fail.restart.copyFailed"));
    }
  };

  return (
    <Card
      data-testid="mtls-restart-guide"
      data-mtls-os={osToShow || ""}
      className="gap-5"
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <ShieldCheck className="size-4" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-base leading-snug">
              {t("error.mtls_fail.restart.title")}
            </CardTitle>
            <CardDescription className="leading-relaxed">
              {t("error.mtls_fail.restart.intro")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          data-testid="mtls-certificate-check"
          className="space-y-1 rounded-lg border border-accent/30 bg-accent/10 p-3.5"
        >
          <p className="text-sm font-semibold leading-snug">
            {t("error.mtls_fail.restart.certificateCheckTitle")}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("error.mtls_fail.restart.certificateCheckBody")}
          </p>
        </div>

        <ol
          data-testid="mtls-restart-summary"
          className="space-y-2.5 text-sm leading-relaxed"
        >
          {["1", "2", "3"].map((step, index) => (
            <li key={step} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
              >
                {index + 1}
              </span>
              <span>{t(`error.mtls_fail.restart.summary.${step}`)}</span>
            </li>
          ))}
        </ol>

        <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("error.mtls_fail.restart.addressLabel")}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all font-mono text-sm">
              {mtlsUrl}
            </code>
            <Button
              data-testid="mtls-copy-address-button"
              variant="ghost"
              size="icon-sm"
              onClick={handleCopy}
              aria-label={t("error.mtls_fail.restart.copyAddress")}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
          <Button
            data-testid="mtls-retry-button"
            className="w-full h-auto whitespace-normal py-2.5 leading-snug"
            onClick={() => {
              window.location.href = mtlsUrl;
            }}
          >
            <RefreshCw className="size-4" />
            {t("error.mtls_fail.restart.tryAgain")}
          </Button>
        </div>

        <Collapsible
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          className="rounded-lg border border-border overflow-hidden"
          data-testid="mtls-restart-details"
        >
          <CollapsibleTrigger
            className="w-full flex items-center justify-between gap-3 p-3.5 text-left hover:bg-accent/30 transition-colors cursor-pointer"
            data-testid="mtls-restart-details-toggle"
          >
            <span className="text-sm font-medium">
              {t("error.mtls_fail.restart.detailsToggle")}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 transition-transform",
                detailsOpen && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 border-t border-border p-3.5">
            <PlatformSelector value={osToShow} onValueChange={setSelectedOS} />

            <ol
              data-testid="mtls-restart-steps"
              className="divide-y divide-border rounded-lg border border-border overflow-hidden"
            >
              {instructions.steps.map((stepKey, index) => (
                <li key={stepKey} className="flex gap-3 p-3.5">
                  <span
                    aria-hidden="true"
                    className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{t(stepKey)}</span>
                </li>
              ))}
            </ol>

            {instructions.notes && instructions.notes.length > 0 && (
              <div className="flex gap-3 rounded-lg border border-accent/20 bg-accent/10 p-3.5">
                <Info className="size-4 shrink-0 text-accent mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    {t("mtlsInstall.note")}
                  </p>
                  {instructions.notes.map((noteKey) => (
                    <p
                      key={noteKey}
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      {t(noteKey)}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("error.mtls_fail.restart.stillFailing")}
            </p>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
