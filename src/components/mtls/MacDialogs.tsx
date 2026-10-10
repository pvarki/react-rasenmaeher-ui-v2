"use client";

import { Compass, Fingerprint } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export const PANEL =
  "w-full rounded-2xl border border-white/10 bg-[#2b2b2b] p-4 text-[13px] leading-snug tracking-normal text-white shadow-[0_8px_24px_rgba(0,0,0,0.55)] [font-family:-apple-system,system-ui,sans-serif]";
export const RING = "outline outline-[3px] outline-offset-2 outline-[#c41010]";

export function MacButton({
  label,
  primary,
  pressed,
}: {
  label: string;
  primary?: boolean;
  pressed?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex h-7 min-w-16 items-center justify-center rounded-md px-3",
        primary ? "bg-[#0a84ff] font-medium" : "bg-white/15",
        pressed && RING,
      )}
    >
      {label}
    </span>
  );
}

export function KeyIcon() {
  return (
    <svg viewBox="0 0 44 48" className="h-12 w-11 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id="mac-lock-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4cf6a" />
          <stop offset="1" stopColor="#c48a1e" />
        </linearGradient>
        <linearGradient id="mac-lock-shackle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8e8e93" />
          <stop offset="0.5" stopColor="#e5e5ea" />
          <stop offset="1" stopColor="#8e8e93" />
        </linearGradient>
      </defs>
      <path
        d="M11 22V15a11 11 0 0 1 22 0v7"
        fill="none"
        stroke="url(#mac-lock-shackle)"
        strokeWidth="5"
      />
      <rect
        x="4"
        y="21"
        width="36"
        height="25"
        rx="5"
        fill="url(#mac-lock-body)"
      />
      <rect
        x="4"
        y="21"
        width="36"
        height="4"
        rx="2"
        fill="#fff"
        opacity="0.25"
      />
    </svg>
  );
}

export function CertIcon() {
  return (
    <svg
      viewBox="0 0 18 14"
      className="h-3.5 w-[18px] shrink-0"
      aria-hidden="true"
    >
      <rect
        x="0.5"
        y="0.5"
        width="17"
        height="13"
        rx="1.5"
        fill="#f2f2f7"
        stroke="#8aa0b8"
      />
      <path d="M3 4h9M3 7h7M3 10h5" stroke="#9aa5b1" strokeWidth="1" />
      <circle cx="14" cy="10" r="2.5" fill="#e5b94a" />
    </svg>
  );
}

/** macOS asking for the .pfx password when the file is opened. */
export function MacImportDialog({
  fileName,
  callsign,
}: {
  fileName: string;
  callsign: string;
}) {
  const { t } = useTranslation();
  const s = (k: string, v?: Record<string, string>) =>
    t(`mtlsInstall.mac.system.${k}`, v);

  return (
    <div aria-hidden="true" className={PANEL}>
      <div className="flex gap-3">
        <KeyIcon />
        <div className="min-w-0 flex-1">
          <p className="font-semibold break-words">
            {s("importTitle", { file: fileName })}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="shrink-0 text-white/80">{s("password")}</span>
            <span
              className={cn(
                "flex h-7 min-w-0 flex-1 items-center truncate rounded-md border border-[#0a84ff] bg-black/30 px-2 font-mono",
              )}
            >
              {callsign}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <MacButton label={s("cancel")} />
        <MacButton label={s("ok")} primary pressed />
      </div>
    </div>
  );
}

/** Chromium's own certificate picker. */
export function MacCertPicker({
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
    t(`mtlsInstall.mac.system.${k}`, v);

  return (
    <div aria-hidden="true" className={PANEL}>
      <p className="text-[15px] font-semibold">{s("pickTitle")}</p>
      <p className="mt-1 break-words text-white/80">
        {s("pickBody", { host })}
      </p>
      <div className="mt-3 overflow-hidden rounded-md border border-white/20">
        <div className="grid grid-cols-[1fr_1.3fr] gap-2 border-b border-white/20 px-2 py-1 text-white/70">
          <span>{s("subject")}</span>
          <span>{s("issuer")}</span>
        </div>
        <div className="grid grid-cols-[1fr_1.3fr] gap-2 bg-[#1f5fa8] px-2 py-1.5">
          <span className="truncate font-medium">{callsign}</span>
          <span className="truncate text-white/80">{issuer}</span>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <MacButton label={s("pickCancel")} />
        <MacButton label={s("ok")} primary pressed />
      </div>
    </div>
  );
}

/** macOS asking whether the browser may use the private key. */
export function MacKeyAccessDialog({ browser }: { browser: string }) {
  const { t } = useTranslation();
  const s = (k: string, v?: Record<string, string>) =>
    t(`mtlsInstall.mac.system.${k}`, v);

  return (
    <div aria-hidden="true" className={PANEL}>
      <div className="flex gap-3">
        <KeyIcon />
        <div className="min-w-0 flex-1">
          <p className="font-semibold break-words">
            {s("signTitle", { browser })}
          </p>
          <p className="mt-1 text-white/80">{s("signBody")}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="shrink-0 text-white/80">{s("password")}</span>
            <span className="flex h-7 min-w-0 flex-1 items-center rounded-md border border-[#0a84ff] bg-black/30 px-2 tracking-[0.2em]">
              ••••••••
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between gap-2">
        <MacButton label={s("allowAlways")} pressed />
        <span className="flex gap-2">
          <MacButton label={s("deny")} />
          <MacButton label={s("allow")} />
        </span>
      </div>
    </div>
  );
}

/** macOS unlocking the keychain: Touch ID, or the Mac's own password. */
export function MacKeychainAuthDialog() {
  const { t } = useTranslation();
  const s = (k: string) => t(`mtlsInstall.mac.system.${k}`);

  return (
    <div aria-hidden="true" className={PANEL}>
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full bg-white",
          RING,
        )}
      >
        <Fingerprint className="h-7 w-7 text-[#ff375f]" />
      </span>
      <p className="mt-3 font-semibold">{s("authTitle")}</p>
      <p className="mt-1 text-white/80">{s("authBody")}</p>
      <div className="mt-4 flex flex-col gap-2">
        <MacButton label={s("usePassword")} />
        <MacButton label={s("cancel")} />
      </div>
    </div>
  );
}

/** Safari's one-time question before a site may download files. */
export function SafariDownloadDialog({ host }: { host: string }) {
  const { t } = useTranslation();
  const s = (k: string, v?: Record<string, string>) =>
    t(`mtlsInstall.mac.system.${k}`, v);

  return (
    <div
      aria-hidden="true"
      className="w-full overflow-hidden rounded-2xl bg-white text-[13px] leading-snug tracking-normal text-black shadow-[0_8px_24px_rgba(0,0,0,0.55)] [font-family:-apple-system,system-ui,sans-serif]"
    >
      <div className="p-4">
        <p className="text-[15px] font-semibold break-words">
          {s("safariTitle", { host })}
        </p>
        <p className="mt-1 text-black/70">{s("safariBody")}</p>
      </div>
      <div className="flex justify-end gap-6 border-t border-black/10 px-4 py-2.5 text-[15px] text-[#0a6cff]">
        <span>{s("cancel")}</span>
        <span className={cn("rounded px-1 font-medium", RING)}>
          {s("allow")}
        </span>
      </div>
    </div>
  );
}

/** Safari's certificate picker (light), opened from "Kirjaudu varmenteella". */
export function SafariCertPicker({
  host,
  callsign,
}: {
  host: string;
  callsign: string;
}) {
  const { t } = useTranslation();
  const s = (k: string, v?: Record<string, string>) =>
    t(`mtlsInstall.mac.system.${k}`, v);
  const other = (w: string) => (
    <div className="flex items-center gap-2 px-2 py-1 opacity-50">
      <CertIcon />
      <span className={cn("h-2 rounded-full bg-black/25", w)} />
    </div>
  );
  const light = "flex h-7 min-w-16 items-center justify-center rounded-md px-3";

  return (
    <div
      aria-hidden="true"
      className="w-full rounded-2xl bg-white p-4 text-[13px] leading-snug tracking-normal text-black shadow-[0_8px_24px_rgba(0,0,0,0.55)] [font-family:-apple-system,system-ui,sans-serif]"
    >
      <div className="flex gap-3">
        <span className="relative block shrink-0 self-start">
          <KeyIcon />
          <Compass className="absolute -bottom-0.5 -right-1.5 h-5 w-5 rounded-md bg-white p-0.5 text-[#0a84ff] shadow" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold break-words">
            {s("safariPickTitle", { host })}
          </p>
          <p className="mt-1 text-black/75">{s("safariPickBody")}</p>
        </div>
      </div>
      <div className="mt-3 border border-black/15 py-1">
        {other("w-12")}
        <div className="flex items-center gap-2 bg-[#2a63d9] px-2 py-1 font-medium text-white ring-[3px] ring-[#c41010]">
          <CertIcon />
          {callsign}
        </div>
        {other("w-16")}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className={cn(light, "bg-black/10")}>{s("showCert")}</span>
        <span className="flex gap-2">
          <span className={cn(light, "bg-black/10")}>{s("cancel")}</span>
          <span
            className={cn(light, "bg-[#0a84ff] font-medium text-white", RING)}
          >
            {s("continue")}
          </span>
        </span>
      </div>
    </div>
  );
}
