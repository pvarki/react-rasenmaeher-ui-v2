"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface DialogPreviewProps {
  callsign: string;
  caption: string;
}

/**
 * A drawing of the two dialogs Android is about to show, answers filled in:
 * the password, then the certificate type. It shows "press OK twice" rather
 * than telling the user.
 *
 * Only the password and the two OKs are real words. Everything else is a grey
 * bar so users don't try to read it or tap it as if it were a real control.
 */
export function DialogPreview({ callsign, caption }: DialogPreviewProps) {
  const { t } = useTranslation();

  return (
    <figure
      data-testid="mtls-callsign-display"
      data-callsign={callsign}
      className="flex flex-col items-center gap-5"
    >
      <div
        aria-hidden="true"
        // A scale leaves the layout box full size, so the negative margins
        // hand back the height it saves on short screens.
        className="flex w-full flex-col items-center [@media(max-height:700px)]:-my-6 [@media(max-height:700px)]:scale-[0.8]"
      >
        <Sketch n={1} className="-rotate-3 -translate-x-4">
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            {t("mtlsInstall.password")}
          </p>
          <p className="truncate border-b-2 border-primary-light pb-1 font-mono text-2xl font-bold tracking-wider">
            {callsign}
          </p>
        </Sketch>

        <Sketch n={2} className="-mt-6 translate-x-4 rotate-2">
          <div className="mt-4 space-y-2.5">
            <Choice selected />
            <Choice />
          </div>
        </Sketch>
      </div>

      <figcaption className="text-center text-xl leading-snug text-balance text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

function Sketch({
  n,
  className,
  children,
}: {
  n: 1 | 2;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative w-full max-w-[16rem] rounded-2xl bg-white p-4 text-black shadow-[0_12px_32px_rgba(0,0,0,0.55)]",
        className,
      )}
    >
      <div className="h-2.5 w-3/5 rounded-full bg-neutral-300" />
      {children}
      <div className="mt-4 flex items-center justify-end gap-5">
        <div className="h-2 w-10 rounded-full bg-neutral-200" />
        <span className="relative flex items-center gap-1.5 text-base font-bold">
          {/* Staggered, so the eye goes to the first OK and then the second. */}
          <span
            className={cn(
              "absolute -inset-x-3 -inset-y-2 animate-ping rounded-full bg-primary-light motion-reduce:hidden",
              n === 2 && "[animation-delay:500ms]",
            )}
          />
          <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-primary-light text-xs text-primary-foreground">
            {n}
          </span>
          <span className="relative">OK</span>
        </span>
      </div>
    </div>
  );
}

/** A radio row with its label reduced to a bar. */
function Choice({ selected = false }: { selected?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex h-4 w-4 flex-none items-center justify-center rounded-full border-2",
          selected ? "border-primary-light" : "border-neutral-300",
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-primary-light" />}
      </span>
      <span
        className={cn(
          "h-2.5 rounded-full",
          selected ? "w-4/5 bg-neutral-400" : "w-1/2 bg-neutral-200",
        )}
      />
    </div>
  );
}
