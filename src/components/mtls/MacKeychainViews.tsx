"use client";

import type { ReactNode } from "react";
import { ChevronDown, ChevronRight, KeyRound, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { CertIcon, KeyIcon, MacButton, PANEL, RING } from "./MacDialogs";

const s =
  (t: (k: string, v?: Record<string, string>) => string) =>
  (k: string, v?: Record<string, string>) =>
    t(`mtlsInstall.mac.keychain.ui.${k}`, v);

const RING_INSET = "ring-[3px] ring-inset ring-[#c41010]";

/** Matches a numbered line in the instructions to the spot it points at. */
export function Mark({ n, className }: { n: number; className?: string }) {
  return (
    <span
      className={cn(
        "absolute -left-2.5 -top-2.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#c41010] text-[11px] font-bold text-white shadow",
        className,
      )}
    >
      {n}
    </span>
  );
}

function Marked({
  n,
  className,
  children,
}: {
  n: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn("relative", className)}>
      <Mark n={n} />
      {children}
    </span>
  );
}

/** Keychain Access list: finding the certificate, or opening its private key. */
export function KeychainList({
  callsign,
  expanded,
}: {
  callsign: string;
  expanded?: boolean;
}) {
  const { t } = useTranslation();
  const ui = s(t);

  return (
    <div aria-hidden="true" className={PANEL}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-semibold">{ui("app")}</p>
        <span
          className={cn(
            "relative flex h-7 min-w-0 max-w-[60%] flex-1 items-center gap-1.5 rounded-full bg-white/10 px-3",
            !expanded && RING,
          )}
        >
          {!expanded && <Mark n={2} />}
          <Search className="h-3.5 w-3.5 shrink-0 text-white/60" />
          <span className="truncate">{callsign}</span>
        </span>
      </div>
      <div className="mt-3 flex gap-1 text-white/60">
        <span className="px-2 py-1">{ui("allItems")}</span>
        <span
          className={cn(
            "relative rounded-md bg-white/15 px-2 py-1 text-white",
            !expanded && RING,
          )}
        >
          {!expanded && <Mark n={1} />}
          {ui("myCertificates")}
        </span>
      </div>
      <div className="mt-3 rounded-md border border-white/10 py-1">
        <div
          className={cn(
            "relative mx-1 flex items-center gap-2 rounded py-1.5 pl-7 pr-1",
            !expanded && cn("bg-[#1f5fa8]", RING_INSET),
          )}
        >
          {!expanded && <Mark n={3} />}
          {expanded ? (
            <span className="relative">
              <Mark n={1} className="-left-7 -top-0.5" />
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 rounded", RING_INSET)}
              />
            </span>
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-white/60" />
          )}
          <CertIcon />
          <span className="font-medium">{callsign}</span>
          <span className="ml-auto text-white/60">{ui("certificate")}</span>
        </div>
        {expanded && (
          <div
            className={cn(
              "relative mx-1 flex items-center gap-2 rounded bg-[#1f5fa8] py-1.5 pl-8 pr-1",
              RING_INSET,
            )}
          >
            <Mark n={2} />
            <KeyRound className="h-4 w-4 shrink-0 text-white/80" />
            <span className="font-medium">Imported Private Key</span>
            <span className="ml-auto text-white/60">{ui("privateKey")}</span>
          </div>
        )}
        <div className="mx-1 flex items-center gap-2 px-1 py-1.5 opacity-30">
          <ChevronRight className="h-4 w-4 shrink-0" />
          <CertIcon />
          <span className="h-2 w-16 rounded-full bg-white/50" />
        </div>
      </div>
    </div>
  );
}

/** The certificate window with Trust opened and "Always Trust" chosen. */
export function KeychainTrust({
  callsign,
  issuer,
}: {
  callsign: string;
  issuer: string;
}) {
  const { t } = useTranslation();
  const ui = s(t);

  return (
    <div aria-hidden="true" className={PANEL}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded border border-white/20 bg-[#f2f2f7]">
          <CertIcon />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{callsign}</p>
          <p className="truncate text-white/70">{ui("issuedBy", { issuer })}</p>
        </div>
      </div>
      <p className="mt-4">
        <Marked
          n={1}
          className={cn(
            "inline-flex items-center gap-1 rounded px-1 font-semibold",
            RING,
          )}
        >
          <ChevronDown className="h-4 w-4" />
          {ui("trust")}
        </Marked>
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 pl-5">
        <span className="text-white/80">{ui("whenUsing")}</span>
        <Marked
          n={2}
          className={cn(
            "flex h-7 items-center gap-2 rounded-md bg-[#0a84ff] px-3 font-medium",
            RING,
          )}
        >
          {ui("alwaysTrust")}
          <ChevronDown className="h-3.5 w-3.5" />
        </Marked>
      </div>
    </div>
  );
}

/** The private key window, Access Control tab, all apps allowed. */
export function KeychainAccess() {
  const { t } = useTranslation();
  const ui = s(t);

  return (
    <div aria-hidden="true" className={PANEL}>
      <p className="text-center font-semibold">Imported Private Key</p>
      <div className="mx-auto mt-3 flex w-fit rounded-lg bg-white/10 p-0.5">
        <span className="px-3 py-1 text-white/60">{ui("attributes")}</span>
        <Marked n={3} className={cn("rounded-md bg-white/20 px-3 py-1", RING)}>
          {ui("accessControl")}
        </Marked>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Marked
          n={4}
          className={cn("flex w-fit items-center gap-2 rounded", RING)}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0a84ff]">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          {ui("allowAll")}
        </Marked>
        <span className="flex items-center gap-2 text-white/50">
          <span className="h-4 w-4 rounded-full border border-white/40" />
          {ui("confirm")}
        </span>
      </div>
      <div className="mt-4 flex justify-end">
        <Marked n={5}>
          <MacButton label={ui("save")} pressed />
        </Marked>
      </div>
    </div>
  );
}

/** Keychain asking for the Mac password to save the access change. */
export function KeychainPasswordDialog() {
  const { t } = useTranslation();
  const ui = s(t);

  return (
    <div aria-hidden="true" className={PANEL}>
      <div className="flex gap-3">
        <KeyIcon />
        <div className="min-w-0 flex-1">
          <p className="font-semibold break-words">{ui("changeTitle")}</p>
          <p className="mt-1 text-white/80">
            {t("mtlsInstall.mac.system.signBody")}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="shrink-0 text-white/80">
              {t("mtlsInstall.mac.system.password")}
            </span>
            <span className="flex h-7 min-w-0 flex-1 items-center rounded-md border border-[#0a84ff] bg-black/30 px-2 tracking-[0.2em]">
              ••••••••
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <MacButton label={t("mtlsInstall.mac.system.deny")} />
        <Marked n={6}>
          <MacButton label={t("mtlsInstall.mac.system.allow")} pressed />
        </Marked>
      </div>
    </div>
  );
}
