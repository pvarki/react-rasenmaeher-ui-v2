"use client";

import type { ReactNode } from "react";
import { ArrowLeft, Check, ChevronDown, Info, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const FONT = "[font-family:'Segoe_UI',system-ui,sans-serif] tracking-normal";
const RING = "outline outline-[3px] outline-offset-2 outline-[#c41010]";

function Mark({ n }: { n: number }) {
  return (
    <span className="absolute -left-2.5 -top-2.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#c41010] text-[11px] font-bold text-white shadow">
      {n}
    </span>
  );
}

function WinButton({
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
        "relative flex h-6 min-w-[4.5rem] items-center justify-center rounded border px-3",
        primary ? "border-[#0067c0] bg-[#f5f9fd]" : "border-black/20 bg-white",
        mark !== undefined && RING,
      )}
    >
      {!!mark && <Mark n={mark} />}
      {label}
    </span>
  );
}

/** One page of the Certificate Import Wizard: header, body, Next. */
export function WinWizardPage({
  title,
  subtitle,
  next,
  mark,
  children,
}: {
  title: string;
  subtitle?: string;
  next: string;
  mark?: number;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const s = (k: string) => t(`mtlsInstall.win.system.${k}`);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-full overflow-hidden rounded-lg border border-black/20 bg-white text-[12px] leading-snug text-black shadow-[0_8px_24px_rgba(0,0,0,0.55)]",
        FONT,
      )}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <span className="flex items-center gap-2 text-black/80">
          <ArrowLeft className="h-3.5 w-3.5 text-black/40" />
          {s("wizardTitle")}
        </span>
        <X className="h-3.5 w-3.5 text-black/60" />
      </div>
      <div className="min-h-32 px-6 pb-4 pt-2">
        <p className="font-semibold">{title}</p>
        {subtitle && <p className="mt-0.5 pl-4 text-black/70">{subtitle}</p>}
        <div className="mt-3">{children}</div>
      </div>
      <div className="flex justify-end gap-2 border-t border-black/10 bg-[#f3f3f3] px-3 py-2.5">
        <WinButton label={next} primary mark={mark} />
        <WinButton label={s("cancel")} />
      </div>
    </div>
  );
}

export function WinRadio({ label, on }: { label: string; on?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cn(
          "flex h-3.5 w-3.5 items-center justify-center rounded-full border",
          on ? "border-[#0067c0]" : "border-black/40",
        )}
      >
        {on && <span className="h-2 w-2 rounded-full bg-[#0067c0]" />}
      </span>
      {label}
    </span>
  );
}

/** The password field the wizard asks for, filled with the callsign. */
export function WinPasswordField({
  callsign,
  mark,
}: {
  callsign: string;
  mark?: number;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1">
      <span>{t("mtlsInstall.win.system.password")}</span>
      <span
        className={cn(
          "relative flex h-6 max-w-56 items-center border-b-2 border-[#0067c0] bg-white px-2 font-mono",
          mark !== undefined && RING,
        )}
      >
        {!!mark && <Mark n={mark} />}
        {callsign}
      </span>
    </div>
  );
}

/** "The import was successful." */
export function WinSuccess({ ring }: { ring?: boolean }) {
  const { t } = useTranslation();
  const s = (k: string) => t(`mtlsInstall.win.system.${k}`);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-full overflow-hidden rounded-lg border border-black/20 bg-white text-[12px] text-black shadow-[0_8px_24px_rgba(0,0,0,0.55)]",
        FONT,
      )}
    >
      <p className="px-3 py-2 text-black/80">{s("wizardTitle")}</p>
      <p className="flex items-center gap-3 px-5 py-4">
        <Info className="h-7 w-7 shrink-0 fill-[#0067c0] text-white" />
        {s("success")}
      </p>
      <div className="flex justify-end bg-[#f3f3f3] px-3 py-2.5">
        <WinButton label="OK" primary mark={ring ? 0 : undefined} />
      </div>
    </div>
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
  const s = (k: string) => t(`mtlsInstall.win.system.${k}`);

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
}: {
  callsign: string;
  mark?: number;
}) {
  const { t } = useTranslation();
  const s = (k: string) => t(`mtlsInstall.win.system.${k}`);

  return (
    <div aria-hidden="true" className={cn(FF_CARD, "p-4", FONT)}>
      <p className="text-[14px] font-semibold">{s("ffPasswordTitle")}</p>
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
        <FfButton label={s("ffSignIn")} primary mark={mark ? mark + 1 : 0} />
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
    t(`mtlsInstall.win.system.${k}`, v);

  return (
    <div aria-hidden="true" className={cn(FF_CARD, "p-4", FONT)}>
      <p className="wrap-break-word font-semibold">{s("ffPickBody", { host })}</p>
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

/** Edge / Chrome on Windows: "Select a certificate for authentication". */
export function WinCertPicker({
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
    t(`mtlsInstall.win.system.${k}`, v);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-full rounded-lg border border-white/10 bg-[#2b2b2b] p-4 text-[12px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.55)]",
        FONT,
      )}
    >
      <p className="text-[14px] font-semibold">{s("pickTitle")}</p>
      <p className="mt-2 break-words text-white/80">
        {s("pickBody", { host })}
      </p>
      <div className="mt-3 border border-white/30 p-2">
        <div className="relative rounded px-2 py-1.5 ring-[3px] ring-inset ring-[#c41010]">
          <Mark n={1} />
          <p className="font-semibold">{callsign}</p>
          <p className="text-white/70">{issuer}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[#6cb6ff] underline">{s("details")}</span>
        <span className="flex gap-2">
          <span
            className={cn(
              "relative flex h-7 min-w-16 items-center justify-center rounded bg-[#0067c0] px-3 font-semibold",
              RING,
            )}
          >
            <Mark n={2} />
            OK
          </span>
          <span className="flex h-7 min-w-16 items-center justify-center rounded bg-white/15 px-3">
            {s("cancel")}
          </span>
        </span>
      </div>
    </div>
  );
}
