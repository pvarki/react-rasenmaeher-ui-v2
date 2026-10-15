"use client";

import { useTranslation } from "react-i18next";
import { IosAlert } from "./IosAlert";

export function IosDialogPreview({ caption }: { caption: string }) {
  const { t } = useTranslation();
  const sys = (key: string, values?: Record<string, string>) =>
    t(`mtlsInstall.ios.system.${key}`, values);

  const alerts = [
    <IosAlert
      variant="text"
      body={sys("allowPrompt", { host: window.location.hostname })}
      buttons={[sys("ignore"), sys("allow")]}
      press={1}
    />,
    <IosAlert
      title={sys("downloadedTitle")}
      body={sys("downloadedBody")}
      buttons={[sys("close")]}
      press={0}
    />,
  ];

  return (
    <figure
      data-testid="ios-dialog-preview"
      className="flex flex-1 flex-col justify-center gap-3"
    >
      <ol className="flex flex-col gap-3">
        {alerts.map((alert, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-5 shrink-0 pt-3.5 text-right text-sm font-bold text-primary-light">
              {i + 1}.
            </span>
            {alert}
          </li>
        ))}
      </ol>
      <figcaption className="text-center text-base leading-snug text-balance text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}
