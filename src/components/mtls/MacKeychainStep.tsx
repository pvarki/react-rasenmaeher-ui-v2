"use client";

import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  KeychainAccess,
  KeychainList,
  KeychainPasswordDialog,
  KeychainTrust,
} from "./MacKeychainViews";

const PARTS = ["open", "trust", "access"] as const;

interface MacKeychainStepProps {
  callsign: string;
  issuer: string;
  footer: (last: boolean, next: () => void) => ReactNode;
}

export function MacKeychainStep({
  callsign,
  issuer,
  footer,
}: MacKeychainStepProps) {
  const { t } = useTranslation();
  const [part, setPart] = useState(0);
  const key = (k: string) => `mtlsInstall.mac.keychain.${PARTS[part]}.${k}`;

  const views: Record<(typeof PARTS)[number], ReactNode> = {
    open: <KeychainList callsign={callsign} />,
    trust: <KeychainTrust callsign={callsign} issuer={issuer} />,
    access: (
      <div className="grid gap-3 md:grid-cols-2 md:items-start">
        <KeychainAccess />
        <KeychainPasswordDialog />
      </div>
    ),
  };

  return (
    <>
      <div className="grid gap-8 md:grid-cols-[13rem_1fr]">
        <ol className="flex flex-col gap-1" data-testid="mac-keychain-parts">
          {PARTS.map((name, i) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => setPart(i)}
                aria-current={i === part ? "step" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  i === part
                    ? "bg-card font-bold text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    i < part && "bg-success/15 text-success",
                    i === part && "bg-primary-light text-foreground",
                    i > part && "bg-muted",
                  )}
                >
                  {i < part ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                {t(`mtlsInstall.mac.keychain.${name}.title`)}
              </button>
            </li>
          ))}
        </ol>

        <div className="flex min-w-0 flex-col gap-4">
          <div
            className={cn(
              "flex flex-col gap-3",
              PARTS[part] === "access" &&
                "md:grid md:grid-cols-2 md:items-start md:gap-4",
            )}
          >
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-bold leading-tight">
                {t(key("title"))}
              </h2>
              <ol className="flex flex-col gap-1.5 text-base">
                {(
                  t(key("steps"), {
                    callsign,
                    returnObjects: true,
                  }) as string[]
                ).map((line, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c41010] text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
              {PARTS[part] === "open" && (
                <p className="text-sm text-muted-foreground">
                  {t(key("hint"))}
                </p>
              )}
            </div>
            {PARTS[part] === "access" && (
              <KeychainList callsign={callsign} expanded />
            )}
          </div>
          <div className={PARTS[part] === "access" ? "" : "max-w-lg"}>
            {views[PARTS[part]]}
          </div>
        </div>
      </div>

      {footer(part === PARTS.length - 1, () => setPart(part + 1))}
    </>
  );
}
