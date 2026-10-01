"use client";

import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface PasswordCalloutProps {
  callsign: string;
  isCopied: boolean;
  onCopy: () => void;
}

/**
 * The callsign, framed as the answer to the question Android is asking.
 *
 * Light card on a dark app on purpose: the system dialog dims whatever is
 * behind it to roughly half brightness. Dark text on a light
 * card survives that; white text on a dark card goes unreadable outdoors.
 */
export function PasswordCallout({
  callsign,
  isCopied,
  onCopy,
}: PasswordCalloutProps) {
  const { t } = useTranslation();

  return (
    <div
      data-testid="mtls-callsign-display"
      data-callsign={callsign}
      className="flex items-center gap-3 rounded-xl border-2 border-primary-light bg-white px-4 py-3"
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-600">
          {t("mtlsInstall.password")}
        </p>
        <p className="truncate font-mono text-[clamp(1.75rem,9vw,2.5rem)] font-bold leading-tight tracking-wider text-black">
          {callsign}
        </p>
      </div>

      <button
        type="button"
        onClick={onCopy}
        data-testid="password-copy-button"
        data-copied={isCopied ? "true" : "false"}
        aria-label={t("mtlsInstall.copyPassword")}
        className={cn(
          "flex h-11 flex-none items-center gap-1.5 rounded-lg px-3 text-xs font-bold uppercase tracking-[0.08em]",
          isCopied
            ? "bg-success text-white"
            : "bg-primary-light text-primary-foreground",
        )}
      >
        {isCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {isCopied ? t("mtlsInstall.copied") : t("mtlsInstall.copy")}
      </button>
    </div>
  );
}
