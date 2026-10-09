"use client";

import { cn } from "@/lib/utils";

interface IosAlertProps {
  title?: string;
  body: string;
  buttons: string[];
  /** Index of the button the user should press. */
  press: number;
  /** "text" is Safari's older alert style with plain text buttons. */
  variant?: "text" | "pill";
  className?: string;
}

export function IosAlert({
  title,
  body,
  buttons,
  press,
  variant = "pill",
  className,
}: IosAlertProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-full rounded-[1.75rem] bg-[#2c2c2e] px-5 pb-3.5 pt-4 tracking-normal text-white shadow-[0_8px_24px_rgba(0,0,0,0.55)] [font-family:-apple-system,system-ui,sans-serif]",
        variant === "text" && "rounded-2xl pb-3",
        className,
      )}
    >
      {title && (
        <p className="text-base font-semibold leading-snug break-words">
          {title}
        </p>
      )}
      <p
        className={cn(
          "leading-snug break-words",
          title ? "mt-1 text-sm text-white/70" : "text-base",
        )}
      >
        {body}
      </p>
      <div
        className={cn(
          "mt-3 flex gap-2",
          variant === "text" ? "justify-end gap-4" : "",
        )}
      >
        {buttons.map((label, i) => (
          <span
            key={label}
            className={cn(
              "relative flex items-center justify-center text-base",
              variant === "text"
                ? "text-[#0a84ff]"
                : "h-10 flex-1 rounded-full",
              variant === "text" && i === press && "font-semibold",
              variant === "pill" &&
                (buttons.length === 1
                  ? "bg-[#0a84ff] font-semibold"
                  : "bg-white/15"),
              i === press &&
                "outline outline-[3px] outline-offset-4 outline-[#c41010]",
              i === press && variant === "text" && "rounded-full px-2",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
