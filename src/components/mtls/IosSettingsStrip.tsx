"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

const TILES = ["open", "install", "paste", "back"] as const;

export function IosSettingsStrip({ shotDir }: { shotDir: string }) {
  const { t } = useTranslation();

  return (
    <ol
      data-testid="ios-settings-strip"
      className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] gap-x-3 gap-y-1"
    >
      {TILES.map((tile, i) => (
        <li
          key={tile}
          className="row-span-2 grid min-h-0 min-w-0 grid-rows-subgrid"
        >
          <StripShot src={`${shotDir}/install-${i + 1}.webp`} />
          <p className="mb-1 flex items-baseline gap-1.5 text-xs leading-tight">
            <span className="font-bold text-primary-light">{i + 1}.</span>
            <span>{t(`mtlsInstall.ios.install.tiles.${tile}`)}</span>
          </p>
        </li>
      ))}
    </ol>
  );
}

function StripShot({ src }: { src: string }) {
  const [attempt, setAttempt] = useState(0);

  if (attempt > 1) return <span aria-hidden="true" />;

  return (
    <img
      src={attempt ? `${src}?retry=${attempt}` : src}
      alt=""
      aria-hidden="true"
      onError={() => setAttempt((a) => a + 1)}
      className="h-full min-h-0 w-full object-contain object-bottom-left"
    />
  );
}
