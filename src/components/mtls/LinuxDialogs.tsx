"use client";

import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const FONT =
  "[font-family:Ubuntu,'Cantarell',system-ui,sans-serif] tracking-normal";
const RING = "outline outline-[3px] outline-offset-2 outline-[#c41010]";

function Mark({ n }: { n: number }) {
  return (
    <span className="absolute -left-2.5 -top-2.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#c41010] text-[11px] font-bold text-white shadow">
      {n}
    </span>
  );
}

function FfButton({
  label,
  primary,
  mark,
}: {
  label: string;
  primary?: boolean;
  mark?: number;
}) {
  return (
    <span
      className={cn(
        "relative flex h-7 min-w-16 items-center justify-center rounded px-3",
        primary
          ? "bg-[#0061e0] font-semibold text-white"
          : "bg-black/7 text-black",
        mark !== undefined && RING,
      )}
    >
      {!!mark && <Mark n={mark} />}
      {label}
    </span>
  );
}

const FF_CARD =
  "w-full overflow-hidden rounded-lg border border-black/10 bg-white text-[12px] leading-snug text-black shadow-[0_8px_24px_rgba(0,0,0,0.55)]";

/** Firefox Certificate Manager, "Your Certificates" tab with Import…. */
export function FirefoxCertManager({ mark }: { mark?: number }) {
  const { t } = useTranslation();
  const s = (k: string) => t(`mtlsInstall.linux.system.${k}`);

  return (
    <div aria-hidden="true" className={cn(FF_CARD, FONT)}>
      <p className="border-b border-black/10 bg-[#f0f0f4] px-3 py-2 text-black/80">
        {s("ffManager")}
      </p>
      <div className="px-3 pt-2">
        <span className="inline-block border-b-2 border-[#0061e0] pb-1 font-semibold">
          {s("ffYours")}
        </span>
      </div>
      <div className="mx-3 mt-2 h-16 border border-black/15" />
      <div className="flex gap-2 px-3 py-3">
        <FfButton label={s("ffImport")} mark={mark} />
      </div>
    </div>
  );
}

/** Firefox "Password Required" prompt when importing the key file. */
export function FirefoxPassword({
  callsign,
  mark,
  buttonMark,
}: {
  callsign: string;
  mark?: number;
  buttonMark?: number;
}) {
  const { t } = useTranslation();
  const s = (k: string) => t(`mtlsInstall.linux.system.${k}`);

  return (
    <div aria-hidden="true" className={cn(FF_CARD, "p-4", FONT)}>
      <p className="text-[14px] font-semibold">{s("ffUnlockTitle")}</p>
      <span
        className={cn(
          "relative mt-3 flex h-7 items-center rounded border border-black/30 px-2 font-mono",
          mark !== undefined && RING,
        )}
      >
        {!!mark && <Mark n={mark} />}
        {callsign}
      </span>
      <div className="mt-4 flex justify-end gap-2">
        <FfButton
          label={s("ffSignIn")}
          primary
          mark={buttonMark ?? (mark ? mark + 1 : 0)}
        />
        <FfButton label={s("cancel")} />
      </div>
    </div>
  );
}

/** Firefox's own "identify yourself with a certificate" prompt. */
export function FirefoxCertPicker({
  host,
  callsign,
}: {
  host: string;
  callsign: string;
}) {
  const { t } = useTranslation();
  const s = (k: string, v?: Record<string, string>) =>
    t(`mtlsInstall.linux.system.${k}`, v);

  return (
    <div aria-hidden="true" className={cn(FF_CARD, "p-4", FONT)}>
      <p className="wrap-break-word font-semibold">
        {s("ffPickBody", { host })}
      </p>
      <span className="mt-2 flex h-7 items-center justify-between rounded border border-[#0061e0] px-2">
        <span className="truncate">{callsign} […]</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0" />
      </span>
      <p className="mt-3 font-semibold">{s("ffPickDetails")}</p>
      <div className="mt-1 h-10 bg-black/5" />
      <div className="mt-4 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-[#0061e0]">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </span>
          {s("ffRemember")}
        </span>
        <span className="flex gap-2">
          <FfButton label={s("cancel")} />
          <FfButton label="OK" primary mark={1} />
        </span>
      </div>
    </div>
  );
}

const CR_CARD =
  "w-full overflow-hidden rounded-xl border border-white/10 bg-[#202124] text-[12px] leading-snug text-white shadow-[0_8px_24px_rgba(0,0,0,0.55)]";

/** Chrome/Chromium on Linux: Certificate Manager, client certs from platform. */
export function ChromeCertImport({ mark }: { mark?: number }) {
  const { t } = useTranslation();
  const s = (k: string) => t(`mtlsInstall.linux.system.${k}`);

  return (
    <div aria-hidden="true" className={cn(CR_CARD, "p-4", FONT)}>
      <p className="text-[15px]">{s("crManager")}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-white/80">{s("crPlatform")}</span>
        <span
          className={cn(
            "relative rounded-full border border-[#8ab4f8] px-3 py-1 font-medium text-[#8ab4f8]",
            mark !== undefined && RING,
          )}
        >
          {!!mark && <Mark n={mark} />}
          {s("crImport")}
        </span>
      </div>
      <p className="mt-3 text-white/50">{s("crNone")}</p>
    </div>
  );
}

/** Chrome/Chromium on Linux: "Enter certificate password". */
export function ChromePassword({
  callsign,
  mark,
}: {
  callsign: string;
  mark?: number;
}) {
  const { t } = useTranslation();
  const s = (k: string) => t(`mtlsInstall.linux.system.${k}`);

  return (
    <div aria-hidden="true" className={cn(CR_CARD, "p-4", FONT)}>
      <p className="text-[14px]">{s("crPassword")}</p>
      <span
        className={cn(
          "relative mt-3 flex h-8 items-center border-b-2 border-[#8ab4f8] bg-white/10 px-2 font-mono",
          mark !== undefined && RING,
        )}
      >
        {!!mark && <Mark n={mark} />}
        {callsign}
      </span>
      <div className="mt-4 flex justify-end gap-2">
        <span className="rounded-full border border-white/30 px-3 py-1">
          {t("mtlsInstall.linux.system.cancel")}
        </span>
        <span
          className={cn(
            "relative rounded-full bg-[#8ab4f8] px-4 py-1 font-semibold text-[#202124]",
            mark !== undefined && RING,
          )}
        >
          {!!mark && <Mark n={mark} />}
          OK
        </span>
      </div>
    </div>
  );
}

/** Chrome/Chromium on Linux: "Select a certificate" table dialog. */
export function ChromeLinuxCertPicker({
  host,
  callsign,
  issuer,
}: {
  host: string;
  callsign: string;
  issuer: string;
}) {
  const { t } = useTranslation();
  const s = (k: string, v?: Record<string, string>) =>
    t(`mtlsInstall.linux.system.${k}`, v);

  return (
    <div aria-hidden="true" className={cn(CR_CARD, "p-4", FONT)}>
      <p className="text-[15px] font-semibold">{s("crPickTitle")}</p>
      <p className="mt-1 break-words text-white/80">
        {s("crPickBody", { host })}
      </p>
      <div className="mt-3 border border-white/15">
        <div className="grid grid-cols-[1fr_1.2fr] gap-2 border-b border-white/15 px-2 py-1 text-white/70">
          <span>{s("crSubject")}</span>
          <span>{s("crIssuer")}</span>
        </div>
        <div className="grid grid-cols-[1fr_1.2fr] gap-2 bg-[#1f4f8a] px-2 py-1.5">
          <span className="truncate">{callsign}</span>
          <span className="truncate text-white/80">{issuer}</span>
        </div>
        <div className="h-6" />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <span className="rounded-full bg-[#1f4f8a] px-3 py-1">
          {t("mtlsInstall.linux.system.cancel")}
        </span>
        <span
          className={cn(
            "relative rounded-full bg-[#e8862a] px-4 py-1 font-semibold text-[#202124]",
            RING,
          )}
        >
          <Mark n={1} />
          OK
        </span>
      </div>
    </div>
  );
}
